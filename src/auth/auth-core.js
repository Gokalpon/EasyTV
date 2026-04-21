// src/auth/auth-core.js - Authentication Module
import { loadData, saveData, PROFILE } from '../core/storage.js';
import { APP_CONFIG } from '../core/constants.js';

// Auth state
let currentUser = null;
let _authListeners = [];
let _supabase = null;
let CLOUD_SYNC_AVAILABLE = false;

// Initialize auth
export async function initAuth() {
    try {
        // Initialize Supabase
        if (window.supabase && !_supabase) {
            _supabase = window.supabase.createClient(
                APP_CONFIG.supabaseUrl,
                APP_CONFIG.supabaseKey
            );
            CLOUD_SYNC_AVAILABLE = true;
        }
        
        // Check existing session
        if (_supabase) {
            const { data: session } = await _supabase.auth.getSession();
            if (session?.user) {
                currentUser = session.user;
                notifyAuthSuccess(currentUser);
            }
            
            // Listen for auth changes
            _supabase.auth.onAuthStateChange((event, session) => {
                if (session?.user) {
                    currentUser = session.user;
                    notifyAuthSuccess(currentUser);
                } else {
                    currentUser = null;
                    notifyAuthLogout();
                }
            });
        }
        
        return !!currentUser;
        
    } catch (e) {
        console.warn('Auth init error:', e);
        return false;
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if authenticated
export function isAuthenticated() {
    return !!(currentUser && (currentUser.email || currentUser.id));
}

// Google Sign In
export async function loginWithGoogle() {
    if (!_supabase) {
        return { success: false, error: 'Auth not initialized' };
    }
    
    try {
        const { data, error } = await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        return { success: true, data };
        
    } catch (e) {
        console.error('Google login error:', e);
        return { success: false, error: e.message };
    }
}

// Apple Sign In
export async function loginWithApple() {
    if (!_supabase) {
        return { success: false, error: 'Auth not initialized' };
    }
    
    try {
        const { data, error } = await _supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        return { success: true, data };
        
    } catch (e) {
        console.error('Apple login error:', e);
        return { success: false, error: e.message };
    }
}

// Email/Password login
export async function loginWithEmail(email, password) {
    if (!_supabase) {
        return { success: false, error: 'Auth not initialized' };
    }
    
    try {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        notifyAuthSuccess(currentUser);
        
        return { success: true, user: data.user };
        
    } catch (e) {
        console.error('Email login error:', e);
        return { success: false, error: e.message };
    }
}

// Register with email
export async function registerWithEmail(email, password) {
    if (!_supabase) {
        return { success: false, error: 'Auth not initialized' };
    }
    
    try {
        const { data, error } = await _supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        return { success: true, user: data.user };
        
    } catch (e) {
        console.error('Register error:', e);
        return { success: false, error: e.message };
    }
}

// Sign out
export async function signOut() {
    if (!_supabase) {
        currentUser = null;
        notifyAuthLogout();
        return { success: true };
    }
    
    try {
        await _supabase.auth.signOut();
        currentUser = null;
        notifyAuthLogout();
        return { success: true };
        
    } catch (e) {
        console.error('Sign out error:', e);
        return { success: false, error: e.message };
    }
}

// On auth success callback
export function onAuthSuccess(callback) {
    if (typeof callback === 'function') {
        _authListeners.push(callback);
    }
}

// Notify auth success
function notifyAuthSuccess(user) {
    // Save to local profile
    const data = loadData();
    data.profile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url || null,
        provider: user.app_metadata?.provider || 'email'
    };
    saveData(data);
    
    // Notify listeners
    _authListeners.forEach(cb => {
        try { cb(user); } catch (e) { console.warn('Auth listener error:', e); }
    });
}

// Notify logout
function notifyAuthLogout() {
    _authListeners.forEach(cb => {
        try { cb(null); } catch (e) { console.warn('Auth listener error:', e); }
    });
}

// Reset password
export async function resetPassword(email) {
    if (!_supabase) {
        return { success: false, error: 'Auth not initialized' };
    }
    
    try {
        const { error } = await _supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        });
        
        if (error) throw error;
        return { success: true };
        
    } catch (e) {
        console.error('Reset password error:', e);
        return { success: false, error: e.message };
    }
}

// Update profile
export async function updateUserProfile(updates) {
    const data = loadData();
    if (data.profile) {
        data.profile = { ...data.profile, ...updates };
        saveData(data);
    }
    
    if (_supabase && currentUser) {
        try {
            await _supabase.auth.updateUser({
                data: updates
            });
        } catch (e) {
            console.warn('Profile update warning:', e);
        }
    }
    
    return data.profile;
}

// Check cloud sync availability
export function isCloudSyncAvailable() {
    return CLOUD_SYNC_AVAILABLE;
}