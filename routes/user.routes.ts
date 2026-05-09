import { Router } from "express";
import * as userCtrl from '../controllers/user.controller.js';
import { checkBanned, verifyToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.get('/', verifyToken, checkBanned, userCtrl.me);
router.patch('/', verifyToken, checkBanned, userCtrl.update);
router.get('/reviews', verifyToken, checkBanned, userCtrl.getReviews);

export default router;
