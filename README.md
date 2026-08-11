# Maina Voice

A browser-based voice transcription app that lets you record audio, send it to cloud speech-to-text engines, and compare their speed and accuracy side by side. Everything stays local — no server, no account, no sync.

By [Awais Alwaisy](https://alwaisy.dev) &nbsp;|&nbsp; MIT License

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)

---

## What it does

**Record mode** — pick a speech engine, record your voice, and get a transcription back. You can re-transcribe the same recording with a different engine to compare outputs without re-recording.

**Benchmark mode** — run two engines on the same audio at the same time and see which one finishes first, with a relative speed ratio between them.

**History** — every transcription is saved locally with version tracking. If you re-transcribe, the old version is kept. You can diff them, copy them, or delete them.

**Backup and restore** — export everything (recordings, transcriptions, settings) as a ZIP archive. The filename includes your local time and IANA timezone so you can tell backups apart at a glance.

## Supported engines

All transcription goes through [OpenRouter](https://openrouter.ai), so you only need one API key to access all of them:

- Fish Audio Transcribe-1
- OpenAI GPT-Transcribe
- Deepgram Nova-3
- NVIDIA Parakeet

## Tech stack

- [Vue 3](https://vuejs.org) with Composition API (`<script setup>`)
- [Vite](https://vite.dev) as the build tool
- [TypeScript](https://www.typescriptlang.org) in strict mode
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- [Pinia](https://pinia.vuejs.org) for state management
- [Reka UI](https://reka-ui.com) for accessible UI primitives
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for local storage (no backend)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for audio conversion

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 9+
- An [OpenRouter](https://openrouter.ai) API key

### Install and run

```bash
git clone https://github.com/alwaisy/mainavoice-web.git
cd mainavoice
pnpm install
pnpm dev
```

Open the app in your browser, go to Settings, and paste your OpenRouter API key. That is all the setup there is.

### Build for production

```bash
pnpm build
pnpm preview
```

## Project structure

```
src/
  assets/       Global styles and Tailwind setup
  components/   UI components and dialogs
    ui/         Primitive components (Reka UI wrappers)
  i18n/         Localization files
  layouts/      Shared layout components
  lib/          Utility functions
  pages/        Page views (Record, Compare, History, Settings, Audio Detail)
  router/       Route definitions
  schemas/      Zod validation schemas
  services/     Transcription, transliteration, backup, and DB logic
  stores/       Pinia stores
public/         Static assets, icons, PWA manifest
```

## How the audio pipeline works

The browser's `MediaRecorder` API captures microphone input as WebM or Ogg depending on the platform. Before sending to any cloud provider, `transcription-service.ts` decodes the audio and re-encodes it as 16-bit PCM WAV using the Web Audio API. This normalizes the format across browsers and avoids provider-specific rejection errors.

Transcriptions go to OpenRouter's `/v1/audio/transcriptions` endpoint. The selected model determines which provider handles the request.

## Data and privacy

Nothing leaves your device except the audio you explicitly send for transcription. Recordings, transcriptions, and settings are stored in IndexedDB under the key `mainavoice_indexeddb`. There is no telemetry, no analytics, and no external database.

Your OpenRouter API key is stored in IndexedDB and passed via HTTP `Authorization: Bearer` headers. It never touches any server other than OpenRouter.

## Transliteration

When the transcribed text contains Devanagari script, Maina Voice can automatically transliterate it to Urdu. This runs offline using a local character mapping in `transliteration-service.ts` and can be toggled per page in Settings.

## Contributing

Run the full check before opening a pull request:

```bash
pnpm check   # runs lint:fix, lint, and typecheck in sequence
```

Other available commands:

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm lint         # lint only
pnpm lint:fix     # auto-fix lint issues
pnpm typecheck    # type check only
pnpm clean        # remove build artifacts
pnpm shadcn       # add a Reka UI component
```

A few things to know before contributing:

- Commits follow [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `chore:`, `docs:`, etc.
- All PRs must pass `pnpm check` with zero errors.
- Components use `<script setup>` only. No Options API.
- Formatting is handled by `@antfu/eslint-config`: 2 spaces, single quotes, no semicolons.
- State changes go through store actions, not direct mutation.

## License

MIT. See [LICENSE.md](./LICENSE.md).
