import { Router } from "express";
import * as auth from '../controllers/auth.controller.js'
import rateLimit from "express-rate-limit";

const router: Router = Router();
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: 'Too many request!'
})

// POST /auth/register
router.post('/register', auth.register);

// POST /auth/login
router.post('/login', auth.login);

// GET /auth/verify?token=...
router.get('/verify', auth.verifyEmail);

// POST /auth/forgot-password
router.post('/forgot-password', rateLimiter, auth.forgotPassword)

// POST /auth/reset-password
router.post('/reset-password', auth.resetPassword)

// POST /auth/logout
router.post('/logout', auth.logout)

export default router;
