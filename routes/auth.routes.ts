import { Router } from "express";
import { register, login } from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import type { Request, Response } from 'express'

const router: Router = Router();

// POST /auth/register
router.post('/register', register);

// POST /auth/login
router.post('/login', login);

router.get('/me', verifyToken, (req: Request, res: Response) => {
    res.json({ message: "Hddt bi gay", user: req.user });
})

export default router;
