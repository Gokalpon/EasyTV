// src/features/premium.js - Premium System Module
import { loadData, SETTINGS, SVC } from '../core/storage.js';

let premiumState = {
    active: false,
    tier: 'free',
    trialStart: null,
    trialEnd: null,
    isTrial: false
};

export function initPremium() {
    const data = loadData();
    const settings = data.settings || {};
    
    premiumState = {
        active: settings.premiumActive || false,
        tier: settings.premiumTier || 'free',
        trialStart: settings.trialStart || null,
        trialEnd: settings.trialEnd || null,
        isTrial: settings.isTrial || false
    };
    
    checkTrialExpiration();
    return premiumState;
}

export function getPremiumState() {
    return { ...premiumState };
}

export function isPremium() {
    return premiumState.active || premiumState.isTrial;
}

function checkTrialExpiration() {
    if (premiumState.isTrial && premiumState.trialEnd) {
        const now = new Date();
        const end = new Date(premiumState.trialEnd);
        if (now > end) {
            premiumState.isTrial = false;
            savePremiumState();
        }
    }
}

export function activateTrial(days = 3) {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);
    
    premiumState.isTrial = true;
    premiumState.trialStart = now.toISOString();
    premiumState.trialEnd = end.toISOString();
    
    savePremiumState();
    return premiumState;
}

export function setPremiumStatus(active, tier = 'premium') {
    premiumState.active = active;
    premiumState.tier = tier;
    premiumState.isTrial = false;
    savePremiumState();
    return premiumState;
}

export function getRemainingTrialDays() {
    if (!premiumState.isTrial) return 0;
    const now = new Date();
    const end = new Date(premiumState.trialEnd);
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

export function canAddService() {
    const services = SVC.services || [];
    const FREE_LIMIT = 6;
    
    if (isPremium()) return { allowed: true, limit: Infinity };
    
    return {
        allowed: services.length < FREE_LIMIT,
        current: services.length,
        limit: FREE_LIMIT,
        remaining: Math.max(0, FREE_LIMIT - services.length)
    };
}

export function enforceServiceLimit() {
    const check = canAddService();
    const addBtn = document.getElementById('addServiceBtn');
    const limitMsg = document.getElementById('serviceLimitMsg');
    
    if (!check.allowed) {
        if (addBtn) addBtn.disabled = true;
        if (limitMsg) {
            limitMsg.style.display = 'block';
            limitMsg.innerHTML = `
                <div class="limit-warning">
                    <span>Ücretsiz: ${check.current}/${check.limit} servis</span>
                    <button onclick="showUpgradeModal()" class="upgrade-btn">Premium'e Geç</button>
                </div>
            `;
        }
        return false;
    }
    
    if (limitMsg) limitMsg.style.display = 'none';
    return true;
}

export function showUpgradeModal() {
    let modal = document.getElementById('premiumModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'premiumModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Premium'a Geç</h2>
                <p>Sınırsız servis, bulut senkronizasyonu!</p>
                <div class="premium-actions">
                    <button onclick="hidePremiumModal()" class="btn-secondary">Kapat</button>
                    <button onclick="initiatePremiumPurchase()" class="btn-primary">Satın Al</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
}

export function hidePremiumModal() {
    const modal = document.getElementById('premiumModal');
    if (modal) modal.style.display = 'none';
}

export function getPremiumFeatures() {
    return {
        unlimited: isPremium(),
        cloudSync: isPremium(),
        analytics: isPremium(),
        export: isPremium(),
        themes: isPremium()
    };
}

function savePremiumState() {
    const data = loadData();
    data.settings = data.settings || {};
    data.settings.premiumActive = premiumState.active;
    data.settings.premiumTier = premiumState.tier;
    data.settings.trialStart = premiumState.trialStart;
    data.settings.trialEnd = premiumState.trialEnd;
    data.settings.isTrial = premiumState.isTrial;
    
    try {
        localStorage.setItem('easytv_data', JSON.stringify(data));
    } catch (e) {
        console.error('Premium state kayıt hatası:', e);
    }
}

export function clearPremium() {
    premiumState = { active: false, tier: 'free', trialStart: null, trialEnd: null, isTrial: false };
    savePremiumState();
    return premiumState;
}

export function renderPremiumBadge() {
    return isPremium() ? '<span class="premium-badge">Premium</span>' : '';
}

window.showUpgradeModal = showUpgradeModal;
window.hidePremiumModal = hidePremiumModal;