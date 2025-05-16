import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Points to copilot/src
      '$common': path.resolve(__dirname, '../src') // Points to qwen v.0/src
    }
  },
  server: {
    fs: {
      // Allow serving files from one level up (qwen v.0 directory) and the workspace root
      allow: [
        path.resolve(__dirname, '..'), // This is qwen v.0/
      ]
    }
  }
})
