import type { infer as zInfer } from 'zod'
import { number, object, string, enum as zEnum } from 'zod'

// Basic User Schema
export const UserSchema = object({
  id: string().uuid(),
  name: string(),
  email: string().email(),
  avatarUrl: string().url().optional(),
})
export type User = zInfer<typeof UserSchema>

// Book Schema
export const BookStatusSchema = zEnum(['unread', 'reading', 'done'])
export type BookStatus = zInfer<typeof BookStatusSchema>

export const BookSchema = object({
  id: string(),
  title: string(),
  author: string(),
  category: string(),
  status: BookStatusSchema,
  coverUrl: string().optional(),
  fileUrl: string().optional(), // URL or local path to the PDF
  currentPage: number().int().min(0),
  totalPages: number().int().min(1),
  addedAt: string().datetime(), // ISO 8601 string
})
export type Book = zInfer<typeof BookSchema>

// Annotation Schema (Notes, Quotes, Vocab, Concepts)
export const AnnotationTypeSchema = zEnum(['vocab', 'concept', 'quote', 'insight', 'personal'])
export type AnnotationType = zInfer<typeof AnnotationTypeSchema>

export const AnnotationSchema = object({
  id: string().uuid(),
  bookId: string(),
  type: AnnotationTypeSchema,
  content: string(), // The main text/insight
  selectedText: string().optional(), // The text that was highlighted in the PDF
  pageReference: string(), // e.g. "p. 42"
  createdAt: string().datetime(),
})
export type Annotation = zInfer<typeof AnnotationSchema>

// AI Entity Schema (People, Places, Events)
export const AIEntityTypeSchema = zEnum(['person', 'place', 'event', 'framework', 'stat', 'book', 'research', 'company'])
export type AIEntityType = zInfer<typeof AIEntityTypeSchema>

export const AIEntitySchema = object({
  id: string().uuid(),
  bookId: string(),
  type: AIEntityTypeSchema,
  name: string(),
  description: string(),
  context: string().optional(), // Where/why it was mentioned
})
export type AIEntity = zInfer<typeof AIEntitySchema>

// Reading Session Schema
export const ReadingSessionSchema = object({
  id: string().uuid(),
  bookId: string(),
  date: string(), // YYYY-MM-DD
  durationMinutes: number().int().min(1),
})
export type ReadingSession = zInfer<typeof ReadingSessionSchema>
