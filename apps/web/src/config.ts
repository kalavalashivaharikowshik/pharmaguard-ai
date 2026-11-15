/** Backend URL. Set VITE_API_URL at build time (e.g. on Vercel). */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3000';
