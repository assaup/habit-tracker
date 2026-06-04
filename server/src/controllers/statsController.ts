import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

// Считает текущий streak для массива дат
const calcStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0

  const sorted = [...dates].sort((a, b) => (a > b ? -1 : 1))
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Streak считается только если есть сегодня или вчера
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// GET /api/stats/overview
export const getOverview = async (req: AuthRequest, res: Response) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.user!.userId },
    include: { completions: true },
  })

  const today = new Date().toISOString().split('T')[0]

  const stats = habits.map((habit) => {
    const dates = habit.completions.map((c) => c.date)
    const streak = calcStreak(dates)
    const completedToday = dates.includes(today)
    const total = dates.length

    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      streak,
      completedToday,
      total,
    }
  })

  const completedTodayCount = stats.filter((s) => s.completedToday).length

  res.json({
    habits: stats,
    todayProgress: {
      completed: completedTodayCount,
      total: habits.length,
      percent: habits.length > 0
        ? Math.round((completedTodayCount / habits.length) * 100)
        : 0,
    },
  })
}

// GET /api/stats/streaks
export const getStreaks = async (req: AuthRequest, res: Response) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.user!.userId },
    include: { completions: true },
  })

  const streaks = habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    streak: calcStreak(habit.completions.map((c) => c.date)),
    longestStreak: habit.completions.length, // упрощённо, можно усложнить
  }))

  res.json(streaks)
}