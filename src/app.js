// src/app.js - Main Application Bootstrap
// Import all modules
import { initStorage, loadData } from './core/storage.js';
import { initAuth, getCurrentUser, onAuthSuccess } from './auth/auth-core.js';
import { initServices, getServices, addService } from './features/services.js';
import { initPremium, isPremium, enforceServiceLimit } from './features/premium.js';
import { initSync, syncToCloud, getSyncState, getLastSyncFormatted } from './features/sync.js';
import { initUI, renderHomePage, updateStats, showToast } from './ui/renderer.js';

// Global app state
const App = {
    version: '2.0.0',
    initialized: false,
    currentPage: 'home'
};

// Initialize application
export async function initApp() {
    console.log('🎬 EasyTV initializing...');
    
    try {
        // 1. Initialize storage
        initStorage();
        console.log('✓ Storage initialized');
        
        // 2. Initialize services
        initServices();
        console.log('✓ Services module ready');
        
        // 3. Initialize premium system
        initPremium();
        console.log('✓ Premium system ready');
        
        // 4. Initialize UI
        initUI();
        console.log('✓ UI module ready');
        
        // 5. Initialize auth
        const authReady = await initAuth();
        if (authReady) {
            console.log('✓ Auth system ready');
            onAuthSuccess(() => {
                syncToCloud();
                showToast('Hesap senkronize edildi', 'success');
            });
        }
        
        // 6. Initialize sync
        initSync();
        console.log('✓ Sync module ready');
        
        // 7. Enforce premium limits
        enforceServiceLimit();
        
        // 8. Render initial view
        renderHomePage();
        updateStats();
        
        // 9. Mark as initialized
        App.initialized = true;
        console.log('🎉 EasyTV ready!');
        
        // 10. Auto-sync if logged in
        const user = getCurrentUser();
        if (user) syncToCloud();
        
        return true;
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showToast('Uygulama başlatılırken hata oluştu', 'error');
        return false;
    }
}

// Handle page navigation
export function navigateTo(page) {
    App.currentPage = page;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'glow');
        if (item.dataset.page === page) item.classList.add('active', 'glow');
    });
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    const target = document.getElementById(page + 'Page');
    if (target) target.classList.add('active');
    
    switch (page) {
        case 'home': renderHomePage(); break;
        case 'services': updateServicesList(); break;
        case 'analytics': updateAnalytics(); break;
    }
}

function updateServicesList() {
    const services = getServices();
    const container = document.getElementById('servicesList');
    if (container) {
        container.innerHTML = services.length === 0 
            ? '<div class="empty-state"><p>Henüz servis yok</p></div>'
            : services.map(s => `
                <div class="service-card" data-id="${s.id}">
                    <div class="service-color" style="background: ${s.color}"></div>
                    <div class="service-info">
                        <h4>${s.name}</h4>
                        <span>${s.category}</span>
                    </div>
                    <div class="service-meta">
                        <span class="price">$${s.price}/${s.billingCycle}</span>
                    </div>
                </div>
            `).join('');
    }
}

function updateAnalytics() {
    const services = getServices();
    const totalMonthly = services.reduce((sum, s) => {
        let m = s.price;
        if (s.billingCycle === 'yearly') m /= 12;
        return sum + m;
    }, 0);
    
    const monthlyEl = document.getElementById('monthlyTotal');
    const yearlyEl = document.getElementById('yearlyTotal');
    const countEl = document.getElementById('serviceCount');
    
    if (monthlyEl) monthlyEl.textContent = `$${totalMonthly.toFixed(2)}`;
    if (yearlyEl) yearlyEl.textContent = `$${(totalMonthly * 12).toFixed(2)}`;
    if (countEl) countEl.textContent = services.length;
}

export async function handleAddService(serviceData) {
    if (!isPremium()) {
        const services = getServices();
        if (services.length >= 6) {
            showToast('Ücretsiz planda maksimum 6 servis', 'warning');
            return { success: false, reason: 'limit_reached' };
        }
    }
    
    try {
        const newService = addService(serviceData);
        const syncState = getSyncState();
        if (syncState.lastSync) syncToCloud();
        
        showToast(`${serviceData.name} eklendi`, 'success');
        renderHomePage();
        updateStats();
        
        return { success: true, service: newService };
    } catch (error) {
        console.error('Add service error:', error);
        showToast('Servis eklenirken hata', 'error');
        return { success: false, reason: 'error', error };
    }
}

export async function handleDeleteService(serviceId) {
    const services = getServices();
    const service = services.find(s => s.id === serviceId);
    
    if (!service) return { success: false, reason: 'not_found' };
    
    try {
        const { deleteService } = await import('./features/services.js');
        deleteService(serviceId);
        showToast(`${service.name} silindi`, 'info');
        renderHomePage();
        updateStats();
        return { success: true };
    } catch (error) {
        console.error('Delete service error:', error);
        return { success: false, reason: 'error' };
    }
}

export function getAppState() {
    return {
        version: App.version,
        initialized: App.initialized,
        currentPage: App.currentPage,
        user: getCurrentUser(),
        syncState: getSyncState(),
        isPremium: isPremium()
    };
}

// Debug exports
window.debugApp = getAppState;
window.addService = handleAddService;
window.navigateTo = navigateTo;

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}