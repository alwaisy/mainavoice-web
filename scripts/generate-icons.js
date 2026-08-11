import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const publicDir = path.resolve(process.cwd(), 'public')
const svgPath = path.join(publicDir, 'icon.svg')
const svgBuffer = fs.readFileSync(svgPath)

function renderPng(width, outputPath) {
  const resvg = new Resvg(svgBuffer, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  })
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()
  fs.writeFileSync(outputPath, pngBuffer)
  console.log(`Generated ${outputPath} (${width}x${width})`)
}

renderPng(192, path.join(publicDir, 'pwa-192x192.png'))
renderPng(512, path.join(publicDir, 'pwa-512x512.png'))
renderPng(180, path.join(publicDir, 'apple-touch-icon.png'))
renderPng(512, path.join(publicDir, 'pwa-maskable-512x512.png'))

// Generate OG Social Image (1200x630)
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="gradText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="32" y="32" width="1136" height="566" rx="32" fill="none" stroke="#334155" stroke-width="4" opacity="0.6"/>
  
  <g transform="translate(140, 315)">
    <circle cx="0" cy="0" r="90" fill="#1e293b" stroke="#f59e0b" stroke-width="6"/>
    <rect x="-50" y="-10" width="8" height="20" rx="4" fill="url(#gradText)"/>
    <rect x="-35" y="-25" width="8" height="50" rx="4" fill="url(#gradText)"/>
    <rect x="-20" y="-45" width="8" height="90" rx="4" fill="url(#gradText)"/>
    <rect x="-5" y="-60" width="10" height="120" rx="5" fill="url(#gradText)"/>
    <rect x="12" y="-45" width="8" height="90" rx="4" fill="url(#gradText)"/>
    <rect x="27" y="-25" width="8" height="50" rx="4" fill="url(#gradText)"/>
    <rect x="42" y="-10" width="8" height="20" rx="4" fill="url(#gradText)"/>
  </g>

  <text x="280" y="270" font-family="sans-serif" font-size="72" font-weight="800" fill="#ffffff" letter-spacing="-2">Maina Voice</text>
  <text x="280" y="340" font-family="sans-serif" font-size="32" font-weight="600" fill="url(#gradText)">Native AI Voice Transcription &amp; Engine Benchmarking</text>
  <text x="280" y="410" font-family="sans-serif" font-size="22" font-weight="400" fill="#94a3b8">Multi-engine speed comparison • 100% Client-side privacy • OpenRouter cloud AI</text>
</svg>`

const resvgOg = new Resvg(Buffer.from(ogSvg), {
  fitTo: { mode: 'width', value: 1200 },
})
fs.writeFileSync(path.join(publicDir, 'og-image.png'), resvgOg.render().asPng())
console.log('Generated og-image.png (1200x630)')
