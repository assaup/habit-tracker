import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { getOverview, getStreaks } from '../controllers/statsController'

const router = Router()

router.use(authMiddleware)

router.get('/overview', getOverview)
router.get('/streaks', getStreaks)

export default router