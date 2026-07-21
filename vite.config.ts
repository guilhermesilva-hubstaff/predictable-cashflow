import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    // '/' for local dev + Cloudflare Pages (root domain); GitHub Pages serves
    // under a subpath, so the deploy workflow sets PAGES_BASE=/predictable-cashflow/.
    base: process.env.PAGES_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
