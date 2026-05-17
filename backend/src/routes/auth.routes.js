// backend/src/Routes/auth.routes.js
import { Router } from 'express'
import { register, login } from '../controllers/auth.controller.js'

const router = Router()

router.post('/users', register)
router.post('/users/login', login)

export default router
