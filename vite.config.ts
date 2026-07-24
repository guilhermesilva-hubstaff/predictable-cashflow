import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Dev-only bridge: Dev Mode's "Apply" button POSTs the recorded design-token
// overrides here; we persist them to .devmode/apply.json so the coding agent
// (Claude Code) can pick them up and edit source. `apply: 'serve'` keeps this
// out of production builds entirely.
function devModeApplyBridge(): Plugin {
  return {
    name: 'devmode-apply-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__devmode/apply', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('method not allowed'); return }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const dir = resolve(server.config.root, '.devmode')
            mkdirSync(dir, { recursive: true })
            const payload = { at: new Date().toISOString(), changes: JSON.parse(body || '[]') }
            writeFileSync(resolve(dir, 'apply.json'), JSON.stringify(payload, null, 2))
            res.statusCode = 200
            res.setHeader('content-type', 'application/json')
            res.end('{"ok":true}')
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
    // '/' for local dev + Cloudflare Pages (root domain); GitHub Pages serves
    // under a subpath, so the deploy workflow sets PAGES_BASE=/predictable-cashflow/.
    base: process.env.PAGES_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    devModeApplyBridge(),
  ],
})
