import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface NoteEntry {
  id: string
  bookId: string
  content: string
  timestamp: string
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<NoteEntry[]>([
    {
      id: '1',
      bookId: 'b1',
      content: 'The idea of being a clock-builder instead of a time-teller is incredibly relevant to engineering architecture. We should build systems that survive individual developers.',
      timestamp: '2024-03-20T14:30:00Z',
    },
    {
      id: '2',
      bookId: 'b1',
      content: 'Just finished Chapter 2. The data on visionary companies outperforming the market by 15x is staggering. Need to look up the Stanford research project details.',
      timestamp: '2024-03-19T10:15:00Z',
    },
  ])

  function getNotesByBookId(bookId: string) {
    return notes.value
      .filter(n => n.bookId === bookId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  function addNote(bookId: string, content: string) {
    const newNote: NoteEntry = {
      id: Date.now().toString(),
      bookId,
      content,
      timestamp: new Date().toISOString(),
    }
    notes.value.unshift(newNote)
  }

  function deleteNote(noteId: string) {
    notes.value = notes.value.filter(n => n.id !== noteId)
  }

  return {
    notes,
    getNotesByBookId,
    addNote,
    deleteNote,
  }
})
