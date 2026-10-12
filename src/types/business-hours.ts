export interface BusinessHour {
  id: number
  key?: string | null
  label: string
  opening: number
  close: number
  createdAt: string
  updatedAt: string
}
