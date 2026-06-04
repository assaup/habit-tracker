import { Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

const habitSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  icon: z.string().default('⭐'),
  color: z.string().default('#6366f1'),
  category: z.string().optional(),
})

// GET /api/habits
export const getHabits = async (req: AuthRequest, res: Response) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.user!.userId },
    include: { completions: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json(habits)
}

// POST /api/habits
export const createHabit = async (req: AuthRequest, res: Response) => {
  const parsed = habitSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message })
    return
  }

  const habit = await prisma.habit.create({
    data: { ...parsed.data, userId: req.user!.userId },
  })
  res.status(201).json(habit)
}

// PUT /api/habits/:id
export const updateHabit = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  const habit = await prisma.habit.findFirst({
    where: { id, userId: req.user!.userId },
  })
  if (!habit) {
    res.status(404).json({ message: 'Привычка не найдена' })
    return
  }

  const parsed = habitSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message })
    return
  }

  const updated = await prisma.habit.update({
    where: { id },
    data: parsed.data,
  })
  res.json(updated)
}

// DELETE /api/habits/:id
export const deleteHabit = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  const habit = await prisma.habit.findFirst({
    where: { id, userId: req.user!.userId },
  })
  if (!habit) {
    res.status(404).json({ message: 'Привычка не найдена' })
    return
  }

  await prisma.habit.delete({ where: { id } })
  res.status(204).send()
}

// POST /api/habits/:id/complete
export const completeHabit = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const date: string = req.body.date ?? new Date().toISOString().split('T')[0]

  const habit = await prisma.habit.findFirst({
    where: { id, userId: req.user!.userId },
  })
  if (!habit) {
    res.status(404).json({ message: 'Привычка не найдена' })
    return
  }

  const existing = await prisma.completion.findFirst({ where: { habitId: id, date } })
  if (existing) {
    res.status(409).json({ message: 'Уже отмечено' })
    return
  }

  const completion = await prisma.completion.create({
    data: { habitId: id, date },
  })
  res.status(201).json(completion)
}

// DELETE /api/habits/:id/complete
export const uncompleteHabit = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const date: string = req.body.date ?? new Date().toISOString().split('T')[0]

  const habit = await prisma.habit.findFirst({
    where: { id, userId: req.user!.userId },
  })
  if (!habit) {
    res.status(404).json({ message: 'Привычка не найдена' })
    return
  }

  await prisma.completion.deleteMany({ where: { habitId: id, date } })
  res.status(204).send()
}