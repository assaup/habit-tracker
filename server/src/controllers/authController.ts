import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../lib/prisma'

const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message })
    return
  }

  const { email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ message: 'Email уже занят' })
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashed },
  })

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email },
  })
}

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Некорректные данные' })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ message: 'Неверный email или пароль' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ message: 'Неверный email или пароль' })
    return
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  res.json({
    token,
    user: { id: user.id, email: user.email },
  })
}