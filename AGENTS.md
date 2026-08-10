# SiftReader

A personal book reading app designed for deep learning and AI-assisted analysis. It tracks reading sessions, extracts structured insights (people, concepts, research) via LLMs, and provides a grounded chat interface for every book.

## Build & Test

• Install dependencies: `pnpm install`
• Start development server: `pnpm dev`
• Build for production: `pnpm build`
• Run Tauri development: `pnpm tauri dev`
• Build Tauri desktop app: `pnpm tauri build`
• Lint code: `pnpm lint`
• Auto-fix lint issues: `pnpm lint:fix`
• Full validation (fix, lint, typecheck): `pnpm check`
• Type check: `pnpm typecheck`
• Clean build artifacts: `pnpm clean`

## Project Layout

├─ src/ → Vue 3 frontend source
│ ├─ assets/css/ → Tailwind v4 and base styles
│ ├─ components/ → UI components
│ │ └─ ui/ → Reusable Shadcn-like primitives (reka-ui)
│ ├─ i18n/ → Localization (en, es, zh)
│ ├─ pages/ → View components for routing
│ ├─ router/ → Vue Router configuration
│ └─ stores/ → Pinia state management (settings, etc.)
├─ src-tauri/ → Rust backend and desktop configuration
│ └─ src/ → Rust source, plugins, and commands
├─ product/ → PRDs, DB schemas, and technical specs
└─ public/ → Static assets (logos, etc.)

## Architecture Overview

SiftReader uses Tauri v2 as a lightweight desktop wrapper around a Vue 3 frontend. The app follows an offline-first approach using Turso (libSQL) for local data storage with edge synchronization. The frontend handles PDF rendering via PDF.js, while the Rust core executes heavy tasks like PDF text extraction locally to save server costs.

The AI pipeline is orchestrated via OpenRouter, utilizing Gemini 2.5 Flash for extraction and Grok for chat. Background processing for book analysis is handled by Motia (Node.js/TS) which manages chunked extraction steps and state. PDFs are stored in Cloudflare R2 to eliminate egress costs during streaming.

## Development Patterns & Constraints

### Coding Style

• TypeScript: Strict mode enabled. Prefer interfaces for public APIs, types for internals.
• Formatting: Managed by `@antfu/eslint-config`. 2 spaces, no semicolons, single quotes.
• Naming: PascalCase for components/classes, camelCase for functions/variables.
• Components: Vue 3 Composition API with `<script setup>`. Logic extracted into composables.
• CSS: Tailwind CSS v4 using the `@tailwindcss/vite` plugin.

### State & Data

• Store: Pinia for reactive global state (settings, auth).
• Database: Turso for persistent data. Use proper indexing on `book_id` to avoid full table scans.
• PDF Rendering: PDF.js renders to canvas with a transparent text layer for selection.

### Error Handling

• Frontend: Global error boundaries and toast notifications for user feedback.
• Backend: Result types in Rust; try/catch with descriptive error logs in TypeScript.
• AI: Resume-capable pipeline. If extraction fails, it restarts from the last pending chunk.

## Security

• Authentication: Email/Password (bcrypt) with JWT. Google/Goodreads OAuth secondary.
• Secrets: API keys (OpenRouter, Turso, R2) stored in `.env` and never exposed to the client.
• Session: Single active device policy. New logins invalidate previous sessions.
• Validation: Input sanitization for all user-provided notes and AI-generated content.

## Git Workflows

• Branches: `main` for releases, `develop` for integration, `feature/*` for new work.
• Commits: Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`).
• PRs: Must pass lint, typecheck, and build. Squash and merge into `develop`.

## Evidence Required for Every PR

• All tests pass: `pnpm typecheck && pnpm lint`
• Proof of work: Screenshots for UI changes; log outputs for backend logic.
• Schema changes: Migrations must be documented in `product/db-schema.md`.
• No regressions: Verify PDF rendering and annotation anchoring still work.

## External Services

• OpenRouter - `OPENROUTER_API_KEY` - LLM access (Gemini/Grok)
• Turso - `TURSO_DATABASE_URL` - Edge SQLite database
• Cloudflare R2 - `R2_BUCKET_NAME` - PDF file storage
• Resend - `RESEND_API_KEY` - Email notifications and reminders

## Gotchas

• PDF.js Dimensions: PDFs use fixed layouts. They are letterboxed in the 768px reader view.
• Annotation Schema: PDF coordinates are incompatible with future EPUB/HTML reflow. Always store `selected_text` as the source of truth for fuzzy re-anchoring.
• Chat Context: Hits 32k token limit. Users are warned at 80% and auto-archived at 95% to prevent model failure.
• Environment: Tauri commands require `src-tauri/tauri.conf.json` to have correct permissions/capabilities defined.


• Stage and commit after you finish the task. everytime.
