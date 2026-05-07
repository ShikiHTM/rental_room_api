import { Router } from "express";
import * as reviewCtrl from "../controllers/review.controller.js";
import { checkBanned, verifyToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get('/:roomId', reviewCtrl.index);
router.post('/', verifyToken, checkBanned, reviewCtrl.store);
router.put('/:reviewId', verifyToken, checkBanned, reviewCtrl.update);
router.delete('/:reviewId', verifyToken, checkBanned, reviewCtrl.destroy);

export default router;