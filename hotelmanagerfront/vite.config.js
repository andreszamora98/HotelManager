// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'
import obfuscatorConfig from './javascript-obfuscator.config.js'

// ESTE plugin reemplazará en TODOS tus .js/.jsx las URLs absolutas
function replaceFetchCalls() {
  return {
    name: 'replace-fetch-calls',
    enforce: 'pre',
    transform(code, id) {
      if (
        /\.(j|t)sx?$/.test(id) &&
        id.includes('/src/') &&
        code.includes('http://localhost:3001')
      ) {
        return {
          code: code.replace(/http:\/\/localhost:3001/g, '/api'),
          map: null
        }
      }
    }
  }
}

export default defineConfig(() => ({
  plugins: [
    replaceFetchCalls(),     // 1) Reemplaza antes de compilar
    react(),                 // 2) React+SWC
    obfuscatorPlugin({       // 3) Obfuscación SIEMPRE activa
      options: obfuscatorConfig
    })
  ],

  // dev-server (npm run dev)
  server: {
    host: true,
    port: 4173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/auth': {             // si también usas /auth directo
        target: 'http://localhost:3001',
        changeOrigin: true
        // no rewrite para /auth
      }
    }
  },

  // preview (npm run preview)
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: ['.ngrok.io', '.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}))
