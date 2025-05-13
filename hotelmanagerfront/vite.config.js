import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'
import obfuscatorConfig from './javascript-obfuscator.config.js'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),

    // sólo en dev:
    command === 'serve' && obfuscatorPlugin({
      options: obfuscatorConfig
    })
  ].filter(Boolean)
}))