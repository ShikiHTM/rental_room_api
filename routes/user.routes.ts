import { Router } from "express";
import * as userCtrl from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.get('/', verifyToken, userCtrl.me);
router.patch('/', verifyToken, userCtrl.update);
router.get('/reviews', verifyToken, userCtrl.getReviews);

export default router;
