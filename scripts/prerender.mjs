import { readFile, writeFile } from 'node:fs/promises'
import { render } from '../dist-ssr/entry-server.js'

const path = 'dist/index.html'
const html = await readFile(path, 'utf8')
const content = await render()
if (!content.includes('Tu fiesta merece')) throw new Error('El prerender no generó el contenido principal')
const result = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
if (result === html) throw new Error('No se encontró el contenedor root en dist/index.html')
await writeFile(path, result)
