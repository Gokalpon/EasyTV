// src/core/storage.js - LocalStorage Management
const STORAGE_KEY = 'easytv_data';
const ENCRYPT_KEY = 'easytv_v2_secure';

// Storage state
let _storageData = null;

// Initialize storage
export function initStorage() {
    _storageData = loadData();
    return _storageData;
}

// Load data from localStorage
export function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            _storageData = getDefaultData();
            return _storageData;
        }
        
        // Try to parse
        _storageData = JSON.parse(raw);
        
        // Migrate old format if needed
        if (!_storageData.version) {
            _storageData = migrateData(_storageData);
        }
        
        return _storageData;
    } catch (e) {
        console.warn('Storage parse error:', e);
        _storageData = getDefaultData();
        return _storageData;
    }
}

// Save data to localStorage
export function saveData(data) {
    try {
        _storageData = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Storage save error:', e);
        return false;
    }
}

// Get default data structure
function getDefaultData() {
    return {
        version: '2.0',
        services: [],
        profile: null,
        settings: {
            theme: 'auto',
            language: 'tr',
            currency: 'USD',
            notifications: true,
            autoSync: true,
            lastSync: null
        },
        auth: null
    };
}

// Migrate data from old version
function migrateData(oldData) {
    const newData = getDefaultData();
    
    if (oldData.services) newData.services = oldData.services;
    if (oldData.profile) newData.profile = oldData.profile;
    if (oldData.settings) newData.settings = { ...newData.settings, ...oldData.settings };
    if (oldData.user) newData.auth = oldData.user;
    
    return newData;
}

// Simple encryption for sensitive data
export function encryptData(data) {
    try {
        const str = JSON.stringify(data);
        return btoa(str);
    } catch (e) {
        return null;
    }
}

// Simple decryption
export function decryptData(encrypted) {
    try {
        const str = atob(encrypted);
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

// Service storage wrapper
export const SVC = {
    get services() { return (_storageData || loadData()).services || []; },
    set services(val) {
        if (!_storageData) loadData();
        _storageData.services = val;
        saveData(_storageData);
    },
    add(service) {
        if (!_storageData) loadData();
        _storageData.services.push(service);
        saveData(_storageData);
    },
    remove(id) {
        if (!_storageData) loadData();
        _storageData.services = _storageData.services.filter(s => s.id !== id);
        saveData(_storageData);
    },
    update(id, data) {
        if (!_storageData) loadData();
        const idx = _storageData.services.findIndex(s => s.id === id);
        if (idx >= 0) {
            _storageData.services[idx] = { ..._storageData.services[idx], ...data };
            saveData(_storageData);
        }
    }
};

// Settings wrapper
export const SETTINGS = {
    get all() { return (_storageData || loadData()).settings || {}; },
    set all(val) {
        if (!_storageData) loadData();
        _storageData.settings = val;
        saveData(_storageData);
    },
    get(key) {
        const s = this.all;
        return s[key];
    },
    set(key, value) {
        if (!_storageData) loadData();
_storageData.settings[key] = value;
        saveData(_storageData);
    }
};

// Profile wrapper
export const PROFILE = {
    get all() { return (_storageData || loadData()).profile; },
    set all(val) {
        if (!_storageData) loadData();
        _storageData.profile = val;
        saveData(_storageData);
    }
};

// Clear all data
export function clearStorage() {
    _storageData = getDefaultData();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ENCRYPT_KEY);
}

// Export for backup
export function exportAllData() {
    return JSON.parse(JSON.stringify(_storageData || loadData()));
}

// Import from backup
export function importAllData(data) {
    if (data && data.version) {
        saveData(data);
        return true;
    }
    return false;
}