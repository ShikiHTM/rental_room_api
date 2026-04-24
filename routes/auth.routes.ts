import { Router } from "express";
import * as auth from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import type { Request, Response } from 'express'
import rateLimit from "express-rate-limit";

const router: Router = Router();
const rateLimiter = rateLimit({
    windowMs: 15,
    limit: 100,
    message: 'Too many request!'
})

// POST /auth/register
router.post('/register', auth.register);

// POST /auth/login
router.post('/login', auth.login);

// GET /auth/me
router.get('/me', verifyToken, auth.getMe);

// POST /auth/forgot-password
router.post('/forgot-password', rateLimiter, auth.sendResetLinkEmail)

// POST /auth/reset-password
router.post('/reset-password', auth.reset)

export default router;
