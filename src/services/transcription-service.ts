import type { TranscriptionVersion } from '@/stores/maina-store'

export interface ModelMetadata {
  id: string
  name: string
  price: string
  badge: string
  badgeColor: string
  points: string[]
}

export const ALL_MODELS: ModelMetadata[] = [
  {
    id: 'openai/gpt-transcribe',
    name: 'OpenAI GPT-Transcribe ($0.0045/m)',
    price: '$0.0045 / min',
    badge: 'Highest Quality',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    points: [
      'Flagship OpenAI cloud transcription model.',
      'Exceptional accuracy on Urdu, Hindi, and 99+ global languages.',
      'Smart punctuation, auto-formatting, and spoken filler word removal.',
      'Supports keyword context hints for domain-specific terminology.',
      'Best overall choice for high-accuracy voice notes and emails.',
    ],
  },
  {
    id: 'deepgram/nova-3',
    name: 'Deepgram Nova-3 Multi ($0.0043/m)',
    price: '$0.0043 / min',
    badge: 'Code-Switching King',
    badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
    points: [
      'Engineered specifically for multilingual code-switching (Hinglish & Urdish).',
      'Seamlessly switches between English and Urdu/Hindi mid-sentence.',
      'Sub-300ms real-time processing speed for near-instant output.',
      'Custom curriculum training on South Asian spoken accents.',
      'Best choice for conversational speech where you mix languages.',
    ],
  },
  {
    id: 'nvidia/parakeet-tdt-0.6b-v3',
    name: 'NVIDIA Parakeet ($0.0015/m)',
    price: '$0.0015 / min',
    badge: 'High Speed (European)',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    points: [
      'NVIDIA Token-and-Duration Transducer (TDT) high-speed architecture.',
      'Optimized for 25 European languages and English.',
      'Produces precise word-aligned timestamp data.',
      'Note: Does NOT support Urdu or Hindi.',
      'Best choice for rapid English and European language transcription.',
    ],
  },
  {
    id: 'fish-audio/transcribe-1',
    name: 'Fish Audio ($0.0001/m)',
    price: '$0.0001 / min',
    badge: 'Ultra Budget King',
    badgeColor: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
    points: [
      'Cheaper than air — 45x lower cost than OpenAI.',
      'Optimized for Chinese (Mandarin) and English speech.',
      'Ideal for high-volume automated batch audio processing.',
      'Note: Low accuracy on South Asian languages.',
      'Best choice for bulk English/Chinese recording on a budget.',
    ],
  },
]

const PRICE_PER_MIN: Record<string, number> = {
  'openai/gpt-transcribe': 0.0045,
  'deepgram/nova-3': 0.0043,
  'nvidia/parakeet-tdt-0.6b-v3': 0.0015,
  'fish-audio/transcribe-1': 0.0001,
}

export async function transcribeAudio(
  audioFilePath: string,
  modelId: string,
  apiKey: string,
  durationSeconds: number,
): Promise<TranscriptionVersion> {
  const startTime = Date.now()

  if (!apiKey || apiKey.trim() === '') {
    return {
      versionNumber: 1,
      engineName: modelId,
      text: 'Please set your OpenRouter API Key in Settings to transcribe audio using cloud AI models.',
      latencyMs: 15,
      wordCount: 0,
      costEstimate: 0.0,
      timestamp: new Date().toISOString(),
    }
  }

  try {
    const isTauriEnv = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)

    if (!isTauriEnv) {
      // Browser preview simulation
      await new Promise(r => setTimeout(r, 1200))
      return {
        versionNumber: 1,
        engineName: modelId,
        text: 'Recorded audio transcribed via OpenRouter API. (Sample voice note transcript generated successfully.)',
        latencyMs: Date.now() - startTime,
        wordCount: 11,
        costEstimate: (durationSeconds / 60) * (PRICE_PER_MIN[modelId] || 0.0045),
        timestamp: new Date().toISOString(),
      }
    }

    // Read raw bytes from disk via Tauri
    const { invoke } = await import('@tauri-apps/api/core')
    const bytes = (await invoke('read_file_binary', { path: audioFilePath })) as number[]
    const uint8 = new Uint8Array(bytes)

    // Build a Blob from the raw WAV bytes
    const audioBlob = new Blob([uint8], { type: 'audio/wav' })

    // Use multipart/form-data — the correct endpoint for audio transcription models
    // OpenRouter: POST /api/v1/audio/transcriptions (same as OpenAI's audio API)
    const form = new FormData()
    form.append('file', audioBlob, 'recording.wav')
    form.append('model', modelId)

    const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://mainavoice.app',
        'X-Title': 'Maina Voice Desktop',
        // NOTE: Do NOT set Content-Type manually — fetch sets it with the boundary automatically
      },
      body: form,
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}))
      throw new Error(errJson?.error?.message || `HTTP Error ${response.status}`)
    }

    const data = await response.json()
    // OpenAI-compatible audio transcriptions response: { text: "..." }
    const text = (data.text || data.choices?.[0]?.message?.content || '').trim() || 'No transcript text returned.'
    const latencyMs = Date.now() - startTime
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const costEstimate = (durationSeconds / 60) * (PRICE_PER_MIN[modelId] || 0.0045)

    return {
      versionNumber: 1,
      engineName: modelId,
      text,
      latencyMs,
      wordCount,
      costEstimate,
      timestamp: new Date().toISOString(),
    }
  }
  catch (err: any) {
    return {
      versionNumber: 1,
      engineName: modelId,
      text: `Transcription Error: ${err?.message || err}`,
      latencyMs: Date.now() - startTime,
      wordCount: 0,
      costEstimate: 0.0,
      timestamp: new Date().toISOString(),
    }
  }
}
