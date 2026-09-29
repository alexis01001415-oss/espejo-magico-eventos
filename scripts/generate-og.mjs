import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const poster = await readFile('public/models/espejo-magico-poster.webp')
const image = `data:image/webp;base64,${poster.toString('base64')}`
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.setContent(`<!doctype html><html lang="es"><head><link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@600;700&family=Unbounded:wght@500;600&display=swap" rel="stylesheet"><style>
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:radial-gradient(ellipse at 75% 50%,#315b86 0,#1a3f75 23%,#0e244d 48%,#00002a 85%);color:#f7fbff;font-family:'Albert Sans',sans-serif}.halo{position:absolute;right:20px;top:-60px;width:620px;height:700px;border-radius:50%;background:radial-gradient(ellipse,rgba(183,223,249,.28),transparent 68%)}.left{position:absolute;left:75px;top:62px;width:750px;height:510px;display:flex;flex-direction:column}.brand{font:600 26px/1 'Unbounded',sans-serif;letter-spacing:.04em}.tag{margin-top:auto;margin-bottom:25px;font:700 14px/1 'Albert Sans',sans-serif;letter-spacing:.14em;color:#c1dcee}.title{margin:0;font:500 66px/1.15 'Unbounded',sans-serif;letter-spacing:-.035em}.title span{color:#b7d8ed}.foot{margin-top:40px;font:700 15px/1 'Albert Sans',sans-serif;letter-spacing:.08em;color:#d4e7f4}.mirror{position:absolute;right:40px;top:15px;width:450px;height:605px;object-fit:contain;filter:drop-shadow(0 16px 30px rgba(0,0,18,.45))}
</style></head><body><div class="halo"></div><img class="mirror" src="${image}" alt=""><div class="left"><div class="brand">LÚMINA.</div><div class="tag">ESPEJO MÁGICO PARA EVENTOS</div><h1 class="title">TU FIESTA<br>MERECE <span>VERSE</span><br>INOLVIDABLE.</h1><div class="foot">CDMX + ESTADO DE MÉXICO</div></div></body></html>`)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'public/og-cover.jpg', type: 'jpeg', quality: 86 })
await browser.close()
