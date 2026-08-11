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

// Generate OG Social Preview Image (1200x630) modeled directly after splash-screen.vue using dark design system tokens
const splashOgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Radial Glow matching splash-screen.vue -->
    <radialGradient id="glow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#d1cfc0" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#141414" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Deep Warm Neutral Background (background: #141414) -->
  <rect width="1200" height="630" fill="#141414"/>

  <!-- Radial Glow Backdrop -->
  <circle cx="600" cy="260" r="380" fill="url(#glow)"/>

  <!-- Subtle outer border frame -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#2c2c2c" stroke-width="2"/>

  <!-- Splash Icon Container (card: #1c1c1c, border: #2c2c2c) -->
  <g transform="translate(600, 220)">
    <rect x="-60" y="-60" width="120" height="120" rx="28" fill="#1c1c1c" stroke="#2c2c2c" stroke-width="3"/>
    
    <!-- Mic icon (foreground: #e8e3da) -->
    <g transform="translate(0, -5)">
      <rect x="-16" y="-30" width="32" height="54" rx="16" fill="#e8e3da"/>
      <path d="M -26 2 A 26 26 0 0 0 26 2" fill="none" stroke="#e8e3da" stroke-width="6" stroke-linecap="round"/>
      <line x1="0" y1="28" x2="0" y2="44" stroke="#e8e3da" stroke-width="6" stroke-linecap="round"/>
      <line x1="-16" y1="44" x2="16" y2="44" stroke="#e8e3da" stroke-width="6" stroke-linecap="round"/>
    </g>
  </g>

  <!-- App Title & Subtitle matching Splash Screen -->
  <text x="600" y="375" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#e8e3da" letter-spacing="-1">Maina Voice</text>
  <text x="600" y="420" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#8e8a83" letter-spacing="0">AI Voice Dictation &amp; Multi-Model Engine Benchmarking</text>

  <!-- Animated Loading Dots matching splash-screen.vue (primary: #d1cfc0) -->
  <g transform="translate(600, 480)">
    <circle cx="-32" cy="0" r="7" fill="#d1cfc0"/>
    <circle cx="0" cy="0" r="9" fill="#d1cfc0"/>
    <circle cx="32" cy="0" r="7" fill="#d1cfc0"/>
  </g>

  <!-- Bottom Brand Footer -->
  <text x="600" y="565" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#5c5a56" letter-spacing="0.5">100% Client-Side IndexedDB Privacy • OpenRouter Cloud AI Integration</text>
</svg>`

const resvgOg = new Resvg(Buffer.from(splashOgSvg), {
  fitTo: { mode: 'width', value: 1200 },
})
fs.writeFileSync(path.join(publicDir, 'og-image.png'), resvgOg.render().asPng())
console.log('Generated Splash-screen styled og-image.png (1200x630)')
