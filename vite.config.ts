import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// This boilerplate is necessary for using __dirname in ESM modules
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared')
    },
  },
})