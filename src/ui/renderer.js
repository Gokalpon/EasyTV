// src/ui/renderer.js - UI Rendering Module
import { getServices } from '../features/services.js';
import { getPremiumState, isPremium, renderPremiumBadge } from '../features/premium.js';
import { getSyncIndicator } from '../features/sync.js';

// Initialize UI
export function initUI() {
    bindEventListeners();
    renderNavGlow();
    updateSyncStatus();
}

// Navigation glow effect
export function renderNavGlow() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.toggle('glow', item.classList.contains('active'));
    });
}

function bindEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavClick);
    });
    
    const addBtn = document.getElementById('addServiceBtn');
    if (addBtn) addBtn.addEventListener('click', showAddServiceModal);
}

function handleNavClick(e) {
    const page = e.currentTarget.dataset.page;
    if (!page) return;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'glow');
    });
    e.currentTarget.classList.add('active', 'glow');
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) targetPage.classList.add('active');
    
    switch (page) {
        case 'home': renderHomePage(); break;
        case 'services': renderServicesPage(); break;
        case 'analytics': renderAnalyticsPage(); break;
        case 'settings': renderSettingsPage(); break;
    }
}

export function renderHomePage() {
    const services = getServices();
    const container = document.getElementById('servicesList');
    if (!container) return;
    
    container.innerHTML = services.length === 0 ? renderEmptyState() 
        : services.map(s => renderServiceCard(s)).join('');
    
    updateStats();
    updatePremiumBanner();
}

export function renderServicesPage() {
    const services = getServices();
    const container = document.getElementById('allServicesList');
    if (container) {
        container.innerHTML = services.map(s => renderServiceCard(s)).join('');
    }
}

function renderServiceCard(service) {
    const currencySymbol = getCurrencySymbol(service.currency);
    return `
        <div class="service-card" onclick="showServiceDetail('${service.id}')">
            <div class="card-left">
                <div class="service-color" style="background: ${service.color}"></div>
                <div class="service-info">
                    <h4>${escapeHtml(service.name)}</h4>
                    <span class="category-tag">${escapeHtml(service.category)}</span>
                </div>
            </div>
            <div class="card-right">
                <span class="price">${currencySymbol}${service.price}</span>
                <span class="billing">/${service.billingCycle}</span>
            </div>
        </div>
    `;
}

export function renderAnalyticsPage() {
    const services = getServices();
    const totalMonthly = services.reduce((sum, s) => {
        let m = s.price;
        if (s.billingCycle === 'yearly') m /= 12;
        return sum + m;
    }, 0);
    
    const chartEl = document.getElementById('costChart');
    if (chartEl) {
        chartEl.innerHTML = `
            <div class="stat-card">
                <span class="stat-label">Aylık Toplam</span>
                <span class="stat-value">$${totalMonthly.toFixed(2)}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Yıllık Tahmin</span>
                <span class="stat-value">$${(totalMonthly * 12).toFixed(2)}</span>
            </div>
        `;
    }
}

export function renderSettingsPage() {
    const sync = getSyncIndicator();
    const syncEl = document.getElementById('syncStatus');
    if (syncEl) syncEl.textContent = `${sync.icon} ${sync.text}`;
}

export function updateStats() {
    const services = getServices();
    const total = services.reduce((sum, s) => sum + s.price, 0);
    const activeEl = document.getElementById('activeServices');
    if (activeEl) activeEl.textContent = services.filter(s => s.status === 'active').length;
}

export function updatePremiumBanner() {
    const banner = document.getElementById('premiumBanner');
    if (!banner) return;
    banner.style.display = isPremium() ? 'none' : 'flex';
}

export function updateSyncStatus() {
    const sync = getSyncIndicator();
    const indicator = document.getElementById('syncIndicator');
    if (indicator) indicator.innerHTML = `<span class="sync-icon">${sync.icon}</span> ${sync.text}`;
}

export function showAddServiceModal() {
    const modal = document.getElementById('addServiceModal');
    if (modal) {
        modal.style.display = 'flex';
        const input = document.getElementById('serviceNameInput');
        if (input) input.focus();
    }
}

export function hideAddServiceModal() {
    const modal = document.getElementById('addServiceModal');
    if (modal) modal.style.display = 'none';
}

function renderEmptyState() {
    return `
        <div class="empty-state">
            <div class="empty-icon">📺</div>
            <h3>Henüz servis yok</h3>
            <p>İlk streaming servisinizi ekleyin</p>
            <button onclick="showAddServiceModal()" class="btn-primary">Servis Ekle</button>
        </div>
    `;
}

export function showServiceDetail(serviceId) {
    const service = getServices().find(s => s.id === serviceId);
    if (!service) return;
    
    let modal = document.getElementById('serviceDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'serviceDetailModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2 class="detail-name"></h2>
                <div class="detail-row"><span>Fiyat:</span> <span class="detail-price"></span></div>
                <div class="detail-row"><span>Kategori:</span> <span class="detail-category"></span></div>
                <div class="detail-row"><span>Sonraki:</span> <span class="detail-next"></span></div>
                <div class="detail-actions">
                    <button onclick="window.deleteServiceFromDetail()" class="btn-danger">Sil</button>
                    <button onclick="closeModal('serviceDetailModal')" class="btn-secondary">Kapat</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
    modal.dataset.serviceId = serviceId;
    modal.querySelector('.detail-name').textContent = service.name;
    modal.querySelector('.detail-price').textContent = `${getCurrencySymbol(service.currency)}${service.price}/${service.billingCycle}`;
    modal.querySelector('.detail-category').textContent = service.category;
    modal.querySelector('.detail-next').textContent = service.nextBilling;
}

window.deleteServiceFromDetail = function() {
    const modal = document.getElementById('serviceDetailModal');
    if (modal && modal.dataset.serviceId) {
        import('./features/services.js').then(m => {
            m.deleteService(modal.dataset.serviceId);
            closeModal('serviceDetailModal');
            renderHomePage();
        });
    }
};

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function getCurrencySymbol(currency) {
    const symbols = { USD: '$', EUR: '€', GBP: '£', TRY: '₺', TL: '₺' };
    return symbols[currency] || '$';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}