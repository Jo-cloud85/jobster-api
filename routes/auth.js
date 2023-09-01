import { Router } from 'express'
import controllersAuth from '../controllers/auth.js'
import authenticateUser from '../middleware/authentication.js'
import testUser from '../middleware/testUser.js'

import rateLimiter from 'express-rate-limit'

const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        msg: 'Too many requests from this IP, please try again after 15 minutes',
    },
});

const router = Router()
router.post('/register', apiLimiter, controllersAuth.register)
router.post('/login', apiLimiter, controllersAuth.login)
router.patch('/updateUser', authenticateUser, testUser, controllersAuth.updateUser)

export default router
