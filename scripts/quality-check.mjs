import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
})
const baseUrl = process.env.TEST_URL || 'http://127.0.0.1:5173/'

for (const viewport of [{ width: 1440, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  console.log(JSON.stringify({ viewport, overflow, errors, violations: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, count: nodes.length, targets: nodes.slice(0, 4).map(node => node.target) })) }))
  if (viewport.width === 390) {
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    console.log(JSON.stringify({ menuOpened: await page.getByRole('dialog', { name: 'Menú de navegación' }).isVisible() }))
    await page.keyboard.press('Escape')
    console.log(JSON.stringify({ menuClosed: !(await page.getByRole('dialog', { name: 'Menú de navegación' }).isVisible()) }))
    await page.locator('#contacto').scrollIntoViewIfNeeded()
    await page.locator('input[name="name"]').fill('Ana')
    await page.locator('input[name="event"]').fill('Boda')
    await page.locator('input[name="place"]').fill('Coyoacán')
    await page.getByRole('button', { name: 'Preparar mi solicitud' }).click()
    await page.waitForTimeout(800)
    console.log(JSON.stringify({ formFeedback: await page.locator('[role="status"]').innerText() }))
  }
  await context.close()
}

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const reducedPage = await reducedContext.newPage()
await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' })
console.log(JSON.stringify({ reducedMotion: await reducedPage.evaluate(() => ({
  poster: Boolean(document.querySelector('.mirror-poster--static')),
  glbLoaded: performance.getEntriesByType('resource').some(entry => entry.name.endsWith('espejo-magico.glb')),
  threeLoaded: performance.getEntriesByType('resource').some(entry => /three-[\w-]+\.js$/.test(entry.name)),
})) }))
await reducedContext.close()

await browser.close()
