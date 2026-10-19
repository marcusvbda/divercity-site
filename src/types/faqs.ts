export interface Faq {
  id: number
  question: string
  answer: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export type FaqStatus = 'unanswered' | 'answered' | 'published'
