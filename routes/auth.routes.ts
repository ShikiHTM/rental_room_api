import { Router } from "express";
import {register, login} from '../controllers/auth.controller.js'
import {verifyToken, type AuthRequest} from '../middlewares/auth.middleware.js'

const router: Router = Router();

// POST /auth/register
router.post('/register', register);

// POST /auth/login
router.post('/login', login);

router.get('/me', verifyToken, (req: AuthRequest, res) => {
    res.json({message: "Hddt bi gay", user: req.user});
})

export default router;