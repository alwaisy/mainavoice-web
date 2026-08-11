# Maina Voice

Native AI Voice Transcription & Engine Benchmarking Desktop App built with Vue 3 and Vite. It features single-engine recording, dual-engine speed benchmarking, transcript version tracking, and local IndexedDB data persistence with OpenRouter cloud API integration.

## Build & Test

• Install dependencies: `pnpm install`
• Start development server: `pnpm dev`
• Build for production: `pnpm build`
• Preview build: `pnpm preview`
• Lint code: `pnpm lint`
• Auto-fix lint issues: `pnpm lint:fix`
• Type check: `pnpm typecheck`
• Full validation (fix, lint, typecheck): `pnpm check`
• Clean build artifacts: `pnpm clean`
• Add UI primitive: `pnpm shadcn`

## Project Layout

├─ src/ → Vue 3 frontend source code
│ ├─ assets/ → Global styles and Tailwind CSS v4 setup
│ ├─ components/ → UI components and dialog modals
│ │ └─ ui/ → Primitive components built with Reka UI
│ ├─ i18n/ → Localization files and language settings
│ ├─ layouts/ → Shared page layout components
│ ├─ lib/ → General helper utility functions
│ ├─ pages/ → Main application page views
│ ├─ router/ → Vue Router route definitions
│ ├─ schemas/ → Zod schemas for data validation
│ ├─ services/ → Core services for DB, transcription, and transliteration
│ └─ stores/ → Pinia state management stores
├─ docs/ → Application screenshots and assets
└─ public/ → Static files, logos, and icons

## Architecture Overview

Maina Voice runs as a Vue 3 desktop web application powered by Vite and Tailwind CSS v4. Data management follows a local-first pattern using browser IndexedDB (`mainavoice_indexeddb`) to store recording history, audio blobs, and application settings locally without requiring an external database backend.

The audio pipeline captures microphone input using the browser MediaRecorder API. When sent for transcription, `transcription-service.ts` converts WebM or Ogg audio buffers into 16-bit PCM WAV format via Web Audio API. Audio files are submitted to OpenRouter endpoints (`/v1/audio/transcriptions`) for speech-to-text processing.

State management is handled by Pinia (`maina-store.ts`), managing audio recordings, selected speech engines, benchmarking comparisons, and transcript edit histories across views.

## Development Patterns & Constraints

### Coding Style

• TypeScript: Strict mode enabled via `@vue/tsconfig`. Prefer interfaces for service data contracts and stores.
• Formatting: Managed by `@antfu/eslint-config`. 2 spaces, single quotes, no semicolons.
• Naming: PascalCase for components, camelCase for functions and variables, kebab-case for file names.
• Components: Vue 3 Composition API using `<script setup>`.
• CSS: Tailwind CSS v4 using the `@tailwindcss/vite` plugin.

### State & Data

• Store: Pinia for reactive application state (`mainaStore`, `settingsStore`, `notesStore`).
• Database: IndexedDB (`db-service.ts`) with stores for `recordings`, `audio_blobs`, and `settings`.
• Audio Processing: Raw audio converted to 16-bit PCM WAV blobs prior to API transmission.

### Error Handling

• Frontend: Defensive checks for empty audio streams, missing API keys, and player failures.
• Services: Structured error returns inside transcription calls to display clear UI notifications without breaking app state.

## Security

• API Keys: OpenRouter API keys saved locally in IndexedDB and passed strictly via HTTP Bearer headers.
• Data Privacy: Audio recordings and transcriptions remain stored locally on client storage.

## Git Workflows

• Branches: `master` for release builds, `feature/*` for active development.
• Commits: Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`).
• PRs: Must pass type check and linting checks before merging.

## Evidence Required for Every PR

• All tests pass: `pnpm check`
• Proof of work: Verified UI rendering or audio pipeline logs.
• No regressions: Verified recording, IndexedDB saving, and engine benchmarking work as expected.

## External Services

• OpenRouter Audio API - `openRouterApiKey` - Cloud audio transcription (OpenAI GPT-Transcribe, Deepgram Nova-3, NVIDIA Parakeet, Fish Audio).

## Gotchas

• Audio Format Conversion: Browser MediaRecorder outputs vary by platform (WebM/Ogg). `audioBlobToWavBlob` standardizes all audio inputs to 16-bit PCM WAV before sending requests to cloud providers.
• IndexedDB Synchronization: Recording metadata and binary audio blobs are stored in separate object stores (`recordings` and `audio_blobs`) linked by matching IDs.
• Regional Transliteration: Automated Devanagari-to-Urdu transliteration runs conditionally based on region detection in `transliteration-service.ts`.

• Stage and commit changes after completing tasks.
