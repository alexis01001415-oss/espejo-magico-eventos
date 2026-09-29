import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

await mkdir('.screenshots', { recursive: true })
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
})
const baseUrl = process.env.TEST_URL || 'http://127.0.0.1:5173/'

async function capture(name, viewport, selector, offset = 0) {
  if (process.argv[2] && !name.includes(process.argv[2])) return
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.evaluate(({ selector, offset }) => {
    document.documentElement.style.scrollBehavior = 'auto'
    if (selector === ':end') { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); return }
    const el = document.querySelector(selector)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'instant' })
  }, { selector, offset })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `.screenshots/${name}.png` })
  const details = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    webgl: document.querySelector('.mirror-stage canvas') !== null,
    modelOpacity: getComputedStyle(document.querySelector('.mirror-stage')).opacity,
    anatomyBottom: Math.round(document.querySelector('#espejo').getBoundingClientRect().bottom),
    modelRequest: performance.getEntriesByType('resource').some(entry => entry.name.endsWith('espejo-magico.glb')),
    title: document.title,
  }))
  console.log(JSON.stringify({ name, ...details, errors }))
  await page.close()
}

await capture('desktop-hero', { width: 1440, height: 900 }, '#inicio')
await capture('desktop-story', { width: 1440, height: 900 }, '#experiencia')
await capture('desktop-anatomy', { width: 1440, height: 900 }, '#espejo', 600)
await capture('desktop-anatomy-led', { width: 1440, height: 900 }, '#espejo', 2000)
await capture('desktop-occasions', { width: 1440, height: 900 }, '#momentos')
await capture('desktop-contact', { width: 1440, height: 900 }, '#contacto')
await capture('desktop-footer', { width: 1440, height: 900 }, ':end')
await capture('tablet-hero', { width: 820, height: 1180 }, '#inicio')
await capture('tablet-story', { width: 820, height: 1180 }, '#experiencia')
await capture('mobile-hero', { width: 390, height: 844 }, '#inicio')
await capture('mobile-story', { width: 390, height: 844 }, '#experiencia')
await capture('mobile-anatomy', { width: 390, height: 844 }, '#espejo', 600)
await capture('mobile-contact', { width: 390, height: 844 }, '#contacto')
await browser.close()
