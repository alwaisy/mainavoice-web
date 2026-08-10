import type { Annotation, ReadingSession } from '@/schemas/models'

export const mockAnnotations: Annotation[] = [
  {
    id: 'a1',
    bookId: 'b1',
    type: 'quote',
    content: 'The builders of visionary companies tend to be clock builders, not time tellers.',
    selectedText: 'The builders of visionary companies tend to be clock builders, not time tellers.',
    pageReference: 'p. 23',
    createdAt: '2024-03-01T10:15:00Z',
  },
  {
    id: 'a2',
    bookId: 'b1',
    type: 'vocab',
    content: 'A clear and compelling goal that serves as a unifying focal point of effort.',
    selectedText: 'BHAG',
    pageReference: 'p. 94',
    createdAt: '2024-03-02T14:20:00Z',
  },
  {
    id: 'a3',
    bookId: 'b1',
    type: 'insight',
    content: 'This explains why most startups fail after the founder leaves. They were built around a person, not a core ideology.',
    selectedText: '...single visionary leader...',
    pageReference: 'p. 45',
    createdAt: '2024-03-03T09:10:00Z',
  },
  {
    id: 'a4',
    bookId: 'b1',
    type: 'concept',
    content: 'The Tyranny of the OR',
    selectedText: 'the "Tyranny of the OR"',
    pageReference: 'p. 43',
    createdAt: '2024-03-03T09:45:00Z',
  },
]

export const mockSessions: ReadingSession[] = [
  { id: 's1', bookId: 'b1', date: '2024-03-01', durationMinutes: 45 },
  { id: 's2', bookId: 'b1', date: '2024-03-02', durationMinutes: 30 },
  { id: 's3', bookId: 'b1', date: '2024-03-03', durationMinutes: 60 },
  { id: 's4', bookId: 'b1', date: '2024-03-05', durationMinutes: 20 },
  { id: 's5', bookId: 'b1', date: '2024-03-06', durationMinutes: 45 },
]
