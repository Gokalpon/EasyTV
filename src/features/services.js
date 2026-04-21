// src/features/services.js - Service Management Module
import { loadData, SVC } from '../core/storage.js';
import { CURRENCIES } from '../core/constants.js';

// Service state
let services = [];

export function initServices() {
    const data = loadData();
    services = data.services || [];
    return services;
}

export function getServices() {
    if (services.length === 0) initServices();
    return services;
}

export function getService(id) {
    return services.find(s => s.id === id);
}

export function addService(service) {
    const newService = {
        id: generateId(),
        name: service.name || '',
        category: service.category || 'general',
        url: service.url || '',
        price: parseFloat(service.price) || 0,
        currency: service.currency || 'USD',
        billingCycle: service.billingCycle || 'monthly',
        startDate: service.startDate || new Date().toISOString().split('T')[0],
        nextBilling: service.nextBilling || calculateNextBilling(service.startDate, service.billingCycle),
        quality: service.quality || '',
        status: 'active',
        notes: service.notes || '',
        reminder: service.reminder || 30,
        color: service.color || '#6366f1',
        icon: service.icon || '',
        syncId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    services.push(newService);
    saveServices();
    return newService;
}

export function updateService(id, updates) {
    const index = services.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    services[index] = { ...services[index], ...updates, id, updatedAt: new Date().toISOString() };
    saveServices();
    return services[index];
}

export function deleteService(id) {
    const index = services.findIndex(s => s.id === id);
    if (index === -1) return false;
    services.splice(index, 1);
    saveServices();
    return true;
}

export function getServicesByStatus(status) {
    return services.filter(s => s.status === status);
}

export function getTotalMonthlyCost() {
    return services.reduce((total, s) => total + convertToMonthly(s.price, s.billingCycle, s.currency), 0);
}

export function convertToMonthly(price, cycle, currency) {
    let monthly = price;
    switch (cycle) {
        case 'yearly': monthly = price / 12; break;
        case 'weekly': monthly = price * 4.33; break;
        case 'daily': monthly = price * 30; break;
    }
    return monthly;
}

function calculateNextBilling(startDate, cycle) {
    const start = new Date(startDate);
    const now = new Date();
    let next = new Date(start);
    
    while (next <= now) {
        switch (cycle) {
            case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
            case 'monthly': next.setMonth(next.getMonth() + 1); break;
            case 'weekly': next.setDate(next.getDate() + 7); break;
            default: next.setMonth(next.getMonth() + 1);
        }
    }
    return next.toISOString().split('T')[0];
}

function generateId() {
    return 'svc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveServices() {
    SVC.services = services;
}

export function getUpcomingRenewals(days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    return services.filter(s => {
        const billing = new Date(s.nextBilling);
        return billing >= now && billing <= future;
    }).sort((a, b) => new Date(a.nextBilling) - new Date(b.nextBilling));
}

export function getCategoryStats() {
    const stats = {};
    services.forEach(s => {
const cat = s.category || 'general';
        if (!stats[cat]) stats[cat] = { count: 0, monthly: 0 };
        stats[cat].count++;
        stats[cat].monthly += convertToMonthly(s.price, s.billingCycle, s.currency);
    });
    return stats;
}

export function exportServices() {
    return JSON.parse(JSON.stringify(services));
}

export function importServices(imported) {
    if (Array.isArray(imported)) {
        services = imported;
        saveServices();
        return true;
    }
    return false;
}

export function validateServiceForm(data) {
    const errors = [];
    if (!data.name || data.name.trim().length < 2) errors.push('Servis adı en az 2 karakter olmalı');
    if (data.price && isNaN(parseFloat(data.price))) errors.push('Geçerli bir fiyat girin');
    return errors;
}