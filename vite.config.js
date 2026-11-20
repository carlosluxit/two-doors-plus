import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Emulate Vercel `cleanUrls: true` in `vite dev` so /faq serves /public/faq.html
// without requiring the .html extension. Production Vercel handles this natively.
function vercelCleanUrlsDev() {
  return {
    name: 'vercel-clean-urls-dev',
    configureServer(server) {
      const publicDir = join(server.config.root, 'public')
      server.middlewares.use((req, res, next) => {
        const url = req.url.split('?')[0]
        if (url === '/' || url.includes('.') || url.startsWith('/@') || url.startsWith('/src/') || url.startsWith('/node_modules/')) {
          return next()
        }
        const candidate = join(publicDir, `${url}.html`)
        if (existsSync(candidate)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(readFileSync(candidate, 'utf-8'))
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [vercelCleanUrlsDev(), react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
  },
})
