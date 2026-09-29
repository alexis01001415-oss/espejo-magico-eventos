import { renderToPipeableStream } from 'react-dom/server'
import { PassThrough } from 'node:stream'
import App from './App'

export async function render() {
  return new Promise<string>((resolve, reject) => {
    const stream = new PassThrough()
    let html = ''
    stream.setEncoding('utf8')
    stream.on('data', chunk => { html += chunk })
    stream.on('end', () => resolve(html))
    stream.on('error', reject)
    const { pipe } = renderToPipeableStream(<App />, {
      onAllReady() { pipe(stream) },
      onError(error) { reject(error) },
    })
  })
}
