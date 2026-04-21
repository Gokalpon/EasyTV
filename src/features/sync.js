// src/features/sync.js - Cloud Sync Module
import { loadData, saveData, SVC } from '../core/storage.js';
import { getCurrentUser } from '../auth/auth-core.js';
import { exportServices, importServices } from './services.js';
import { setPremiumStatus } from './premium.js';

let syncState = {
    lastSync: null,
    syncInProgress: false,
    syncError: null,
    autoSync: true
};

export function initSync() {
    const data = loadData();
    if (data.settings) {
        syncState.autoSync = data.settings.autoSync !== false;
        syncState.lastSync = data.settings.lastSync || null;
    }
    return syncState;
}

export function getSyncState() {
    return { ...syncState };
}

export async function syncToCloud() {
    if (syncState.syncInProgress) {
        return { success: false, error: 'Sync already in progress' };
    }
    
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }
    
    syncState.syncInProgress = true;
    syncState.syncError = null;
    
    try {
        const localData = loadData();
        
        const syncPayload = {
            userId: user.id,
            timestamp: new Date().toISOString(),
            services: exportServices(),
            settings: localData.settings,
            profile: localData.profile,
            version: '1.0'
        };
        
        const { supabase } = window;
        if (supabase) {
            const { error } = await supabase
                .from('user_data')
                .upsert({
                    user_id: user.id,
                    data: syncPayload,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            
            if (error) throw error;
        }
        
        syncState.lastSync = new Date().toISOString();
        saveSyncState();
        
        return { success: true, timestamp: syncState.lastSync };
        
    } catch (error) {
        console.error('Sync error:', error);
        syncState.syncError = error.message;
        return { success: false, error: error.message };
    } finally {
        syncState.syncInProgress = false;
    }
}

export async function syncFromCloud() {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
        const { supabase } = window;
        if (!supabase) return { success: false, error: 'Supabase not initialized' };
        
        const { data, error } = await supabase
            .from('user_data')
            .select('data')
            .eq('user_id', user.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return { success: true, data: null };
            throw error;
        }
        
        if (data && data.data) {
            if (data.data.services) importServices(data.data.services);
            if (data.data.settings) {
                const localData = loadData();
                localData.settings = { ...localData.settings, ...data.data.settings };
                saveData(localData);
            }
            if (data.data.premium) {
                setPremiumStatus(data.data.premium.active, data.data.premium.tier);
            }
            
            syncState.lastSync = new Date().toISOString();
            saveSyncState();
            
            return { success: true, data: data.data };
        }
        
        return { success: true, data: null };
        
    } catch (error) {
        console.error('Pull error:', error);
        return { success: false, error: error.message };
    }
}

export async function fullSync() {
    const pullResult = await syncFromCloud();
    const pushResult = await syncToCloud();
    return {
        success: pushResult.success,
        pulled: pullResult.success,
        pushed: pushResult.success,
        error: pushResult.error || pullResult.error
    };
}

export function setAutoSync(enabled) {
    syncState.autoSync = enabled;
    saveSyncState();
    return syncState.autoSync;
}

export function getLastSyncFormatted() {
    if (!syncState.lastSync) return 'Hiç senkronize edilmedi';
    
    const date = new Date(syncState.lastSync);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Az önce';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dakika önce`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
    
    return date.toLocaleDateString('tr-TR');
}

export function getSyncIndicator() {
    if (syncState.syncInProgress) return { status: 'syncing', icon: '🔄', text: 'Senkronize ediliyor...' };
    if (syncState.syncError) return { status: 'error', icon: '⚠️', text: 'Senkronizasyon hatası' };
    if (syncState.lastSync) return { status: 'synced', icon: '✅', text: getLastSyncFormatted() };
    return { status: 'pending', icon: '⏳', text: 'Henüz senkronize edilmedi' };
}

export function exportSyncData() {
    const data = loadData();
    return {
        exported: new Date().toISOString(),
        services: exportServices(),
        settings: data.settings,
        profile: data.profile,
        syncState: syncState
    };
}

export function importSyncData(backupData) {
    try {
        if (backupData.services) importServices(backupData.services);
        if (backupData.settings) {
            const data = loadData();
            data.settings = backupData.settings;
            saveData(data);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function saveSyncState() {
    const data = loadData();
    data.settings = data.settings || {};
    data.settings.autoSync = syncState.autoSync;
    data.settings.lastSync = syncState.lastSync;
    saveData(data);
}

export function clearSyncData() {
    syncState = { lastSync: null, syncInProgress: false, syncError: null, autoSync: true };
    saveSyncState();
}