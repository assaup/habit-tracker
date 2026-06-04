import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
} from '../controllers/habitsController'

const router = Router()

router.use(authMiddleware)

router.get('/', getHabits)
router.post('/', createHabit)
router.put('/:id', updateHabit)
router.delete('/:id', deleteHabit)

router.post('/:id/complete', completeHabit)
router.delete('/:id/complete', uncompleteHabit)

export default router