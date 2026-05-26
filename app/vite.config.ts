import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync } from 'fs'
import { join } from 'path'

const faviconPlugin = {
  name: 'favicon-data-uri',
  transformIndexHtml(html: string) {
    if (process.env.VITE_SINGLE_FILE) {
      try {
        const faviconPath = join(__dirname, 'public/favicon.svg')
        const svgContent = readFileSync(faviconPath, 'utf-8')
        const base64 = Buffer.from(svgContent).toString('base64')
        const dataUri = `data:image/svg+xml;base64,${base64}`
        return html.replace(
          /href="\/favicon\.svg"/,
          `href="${dataUri}"`
        )
      } catch (e) {
        console.warn('Could not inline favicon:', e)
        return html
      }
    }
    return html
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    faviconPlugin,
    process.env.VITE_SINGLE_FILE ? viteSingleFile() : null,
  ].filter(Boolean),
})
