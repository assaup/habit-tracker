export interface JwtPayload {
  userId: string
  email: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  category?: string | null
  userId: string
  createdAt: Date
}

export interface Completion {
  id: string
  date: string
  habitId: string
}