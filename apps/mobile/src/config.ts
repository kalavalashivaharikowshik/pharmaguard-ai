/**
 * Backend URL. Set EXPO_PUBLIC_API_URL (in apps/mobile/.env or the EAS build
 * profile) to your hosted API, e.g. https://pharmaguard-api.onrender.com.
 * For local development on a phone, use your computer's LAN IP.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.27.3.125:3000').replace(/\/$/, '');
