import { copyFile, mkdir, writeFile } from 'node:fs/promises'

await mkdir('site-public/models', { recursive: true })
await mkdir('site-public/fonts', { recursive: true })
await Promise.all([
  copyFile('public/favicon.svg', 'site-public/favicon.svg'),
  copyFile('public/og-cover.jpg', 'site-public/og-cover.jpg'),
  copyFile('public/models/espejo-magico.glb', 'site-public/models/espejo-magico.glb'),
  copyFile('public/models/espejo-magico-poster.webp', 'site-public/models/espejo-magico-poster.webp'),
  copyFile('node_modules/@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2', 'site-public/fonts/unbounded-latin.woff2'),
  copyFile('node_modules/@fontsource-variable/albert-sans/files/albert-sans-latin-wght-normal.woff2', 'site-public/fonts/albert-sans-latin.woff2'),
])

const siteUrl = process.env.VITE_SITE_URL?.replace(/\/$/, '')
if (siteUrl) {
  const url = new URL(siteUrl)
  if (url.protocol !== 'https:') throw new Error('VITE_SITE_URL debe usar HTTPS')
  await writeFile('site-public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`)
  await writeFile('site-public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url></urlset>\n`)
} else {
  await copyFile('public/robots.txt', 'site-public/robots.txt')
}
