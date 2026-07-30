// Build-time configuration. When VITE_API_URL is unset (the static
// GitHub Pages build), every server-backed feature is dormant and the
// app behaves exactly as the localStorage-only version.
export const API_URL = import.meta.env.VITE_API_URL || null
