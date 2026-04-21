// src/core/constants.js - Centralized Data Definitions
export const CURRENCIES = {
    USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
    EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
    GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
    TRY: { symbol: '₺', name: 'Turkish Lira', code: 'TRY' },
    TL: { symbol: '₺', name: 'Turkish Lira', code: 'TL' }
};

export const COUNTRIES = {
    TR: { name: 'Türkiye', currency: 'TRY', lang: 'tr' },
    US: { name: 'United States', currency: 'USD', lang: 'en' },
    GB: { name: 'United Kingdom', currency: 'GBP', lang: 'en' },
    DE: { name: 'Germany', currency: 'EUR', lang: 'de' }
};

export const SERVICE_MAX_USERS = {
    Netflix: 4,
    Spotify: 6,
    Disney: 4,
    YouTube: 5,
    Amazon: 6,
    Apple: 6,
    HBO: 4
};

export const LOGO = {
    path: './assets/EasyTVLogo.webp',
    width: 200,
    height: 80
};

export const POPULAR_SVCS = [
    { name: 'Netflix', icon: 'netflix_N.webp', color: '#E50914' },
    { name: 'Spotify', icon: 'Spotify.webp', color: '#1DB954' },
    { name: 'YouTube', icon: 'youtube.webp', color: '#FF0000' },
    { name: 'Disney+', icon: 'Disney+.webp', color: '#0ABFBC' },
    { name: 'Amazon Prime', icon: 'prime video.webp', color: '#1A98FF' },
    { name: 'Apple TV+', icon: 'appleb.webp', color: '#e0e0e0' },
    { name: 'HBO Max', icon: 'hbo.webp', color: '#6B2D8B' },
    { name: 'Exxen', icon: 'exxen.webp', color: '#FFD100' },
    { name: 'BeIN', icon: 'bein.webp', color: '#6F2DA8' },
    { name: 'Twitch', icon: 'twitch.webp', color: '#9146FF' },
    { name: 'Kick', icon: 'kick.webp', color: '#53FC18' }
];

export const REGION_DATA = {
    tr: {
        currency: 'TRY',
        language: 'tr',
        dateFormat: 'DD.MM.YYYY',
        popularServices: ['Netflix', 'Spotify', 'Exxen', 'BeIN', 'BluTV']
    },
    en: {
        currency: 'USD',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        popularServices: ['Netflix', 'Spotify', 'Disney+', 'HBO Max', 'YouTube']
    }
};

export const BILLING_CYCLES = ['daily', 'weekly', 'monthly', 'yearly'];

export const QUALITY_OPTIONS = ['SD', 'HD', 'Full HD', '4K', '4K+HDR'];

export const DEFAULT_REMINDER_DAYS = [1, 3, 7, 14, 30];

export const FREE_SERVICE_LIMIT = 6;

export const APP_CONFIG = {
    name: 'EasyTV',
    version: '2.0.0',
    supabaseUrl: 'https://susshevhyrylxrxesngc.supabase.co',
    supabaseKey: 'sb_publishable_Q6MOIZo_i2SBrkBVKos8_g_8NMKQiew'
};