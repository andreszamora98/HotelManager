// server.js
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// 1) Proxy para /api/*
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/api': '' }
  })
)

// 2) Proxy para /auth (si tu back expone /auth/login, etc.)
app.use(
  '/auth',
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true
    // no pathRewrite aquí, tu back ya maneja /auth
  })
)

// 3) Sirve los archivos estáticos ofuscados de dist/
app.use(express.static(path.join(__dirname, 'dist')))

// 4) Fallback para tu SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 5) Arranca en el puerto 4173
const PORT = process.env.PORT || 4173
app.listen(PORT, () => {
  console.log(`🚀 Frontend servido en http://localhost:${PORT}`)
})
