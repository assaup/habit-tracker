import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import habitRoutes from './routes/habits'
import statsRoutes from './routes/stats'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/stats', statsRoutes)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ message: 'Внутренняя ошибка сервера' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})