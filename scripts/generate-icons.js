import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const publicDir = path.resolve(process.cwd(), 'public')

function renderPngFromSvg(svgBuffer, width, outputPath) {
  const resvg = new Resvg(svgBuffer, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  })
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()
  fs.writeFileSync(outputPath, pngBuffer)
  console.log(`Generated ${path.basename(outputPath)} (${width}x${width})`)
}

const svgLight = fs.readFileSync(path.join(publicDir, 'icon-light.svg'))
const svgDark = fs.readFileSync(path.join(publicDir, 'icon-dark.svg'))

// Light Mode Icons
renderPngFromSvg(svgLight, 192, path.join(publicDir, 'pwa-192x192.png'))
renderPngFromSvg(svgLight, 512, path.join(publicDir, 'pwa-512x512.png'))
renderPngFromSvg(svgLight, 180, path.join(publicDir, 'apple-touch-icon.png'))
renderPngFromSvg(svgLight, 512, path.join(publicDir, 'pwa-maskable-512x512.png'))

// Dark Mode Adaptive Icons
renderPngFromSvg(svgDark, 192, path.join(publicDir, 'pwa-192x192-dark.png'))
renderPngFromSvg(svgDark, 512, path.join(publicDir, 'pwa-512x512-dark.png'))
renderPngFromSvg(svgDark, 180, path.join(publicDir, 'apple-touch-icon-dark.png'))
renderPngFromSvg(svgDark, 512, path.join(publicDir, 'pwa-maskable-512x512-dark.png'))

// Generate Dark Mode Splash-screen Styled OG Social Image (1200x630)
const splashOgDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="glowDark" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#d1cfc0" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#141414" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#141414"/>
  <circle cx="600" cy="260" r="380" fill="url(#glowDark)"/>
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#2c2c2c" stroke-width="2"/>

  <!-- Splash Icon Container -->
  <g transform="translate(600, 220)">
    <rect x="-60" y="-60" width="120" height="120" rx="28" fill="#1c1c1c" stroke="#2c2c2c" stroke-width="3"/>
    
    <!-- Lucide Mic icon -->
    <g transform="translate(0, -6) scale(3.5)">
      <rect x="-3" y="-10" width="6" height="11" rx="3" fill="#e8e3da"/>
      <path d="M -7 -1 A 7 7 0 0 0 7 -1" fill="none" stroke="#e8e3da" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="0" y1="6" x2="0" y2="10" stroke="#e8e3da" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="-4" y1="10" x2="4" y2="10" stroke="#e8e3da" stroke-width="1.8" stroke-linecap="round"/>
    </g>
  </g>

  <!-- Typography -->
  <text x="600" y="375" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#e8e3da" letter-spacing="-1">Maina Voice</text>
  <text x="600" y="420" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#8e8a83" letter-spacing="0">AI Voice Dictation &amp; Multi-Model Engine Benchmarking</text>

  <!-- Loading Dots -->
  <g transform="translate(600, 480)">
    <circle cx="-32" cy="0" r="7" fill="#d1cfc0"/>
    <circle cx="0" cy="0" r="9" fill="#d1cfc0"/>
    <circle cx="32" cy="0" r="7" fill="#d1cfc0"/>
  </g>

  <text x="600" y="565" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#5c5a56" letter-spacing="0.5">100% Client-Side IndexedDB Privacy • OpenRouter Cloud AI Integration</text>
</svg>`

// Generate Light Mode Splash-screen Styled OG Social Image (1200x630)
const splashOgLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="glowLight" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#2e2e2e" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#e9e4d8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#e9e4d8"/>
  <circle cx="600" cy="260" r="380" fill="url(#glowLight)"/>
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#d2cbbb" stroke-width="2"/>

  <!-- Splash Icon Container -->
  <g transform="translate(600, 220)">
    <rect x="-60" y="-60" width="120" height="120" rx="28" fill="#f4efe4" stroke="#d2cbbb" stroke-width="3"/>
    
    <!-- Lucide Mic icon -->
    <g transform="translate(0, -6) scale(3.5)">
      <rect x="-3" y="-10" width="6" height="11" rx="3" fill="#1e1e1e"/>
      <path d="M -7 -1 A 7 7 0 0 0 7 -1" fill="none" stroke="#1e1e1e" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="0" y1="6" x2="0" y2="10" stroke="#1e1e1e" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="-4" y1="10" x2="4" y2="10" stroke="#1e1e1e" stroke-width="1.8" stroke-linecap="round"/>
    </g>
  </g>

  <!-- Typography -->
  <text x="600" y="375" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#1e1e1e" letter-spacing="-1">Maina Voice</text>
  <text x="600" y="420" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#5e5a52" letter-spacing="0">AI Voice Dictation &amp; Multi-Model Engine Benchmarking</text>

  <!-- Loading Dots -->
  <g transform="translate(600, 480)">
    <circle cx="-32" cy="0" r="7" fill="#2e2e2e"/>
    <circle cx="0" cy="0" r="9" fill="#2e2e2e"/>
    <circle cx="32" cy="0" r="7" fill="#2e2e2e"/>
  </g>

  <text x="600" y="565" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#a89f8f" letter-spacing="0.5">100% Client-Side IndexedDB Privacy • OpenRouter Cloud AI Integration</text>
</svg>`

const resvgDark = new Resvg(Buffer.from(splashOgDark), { fitTo: { mode: 'width', value: 1200 } })
fs.writeFileSync(path.join(publicDir, 'og-image.png'), resvgDark.render().asPng())
fs.writeFileSync(path.join(publicDir, 'og-image-dark.png'), resvgDark.render().asPng())

const resvgLight = new Resvg(Buffer.from(splashOgLight), { fitTo: { mode: 'width', value: 1200 } })
fs.writeFileSync(path.join(publicDir, 'og-image-light.png'), resvgLight.render().asPng())

console.log('Generated Light & Dark mode splash-screen styled OG images and PWA assets.')
