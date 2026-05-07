import { Router } from "express";
import * as reviewCtrl from "../controllers/review.controller.js";
import { checkBanned, verifyToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get('/reviews', reviewCtrl.index);
router.post('/reviews', verifyToken, checkBanned, reviewCtrl.store);
router.put('/reviews/:reviewId', verifyToken, checkBanned, reviewCtrl.update);
router.delete('/reviews/:reviewId', verifyToken, checkBanned, reviewCtrl.destroy);

export default router;