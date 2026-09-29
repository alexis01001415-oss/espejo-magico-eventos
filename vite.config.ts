import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const siteUrl = process.env.VITE_SITE_URL?.replace(/\/$/, '')

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    {
      name: 'site-metadata',
      transformIndexHtml(html) {
        if (!siteUrl) return html
        const tags = `<link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />\n    <meta property="og:image" content="${siteUrl}/og-cover.jpg" />\n    <meta name="twitter:image" content="${siteUrl}/og-cover.jpg" />`
        return html.replace('    <title>', `    ${tags}\n    <title>`)
      },
    },
  ],
  publicDir: 'site-public',
  base: process.env.VITE_BASE_PATH || './',
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild ? undefined : {
          three: ['three'],
        },
      },
    },
  },
}))
