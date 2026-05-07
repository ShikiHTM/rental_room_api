import { Router } from "express";
import * as reviewCtrl from "../controllers/review.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get('/reviews', reviewCtrl.index);
router.post('/reviews', verifyToken, reviewCtrl.store);
router.put('/reviews/:reviewId', verifyToken, reviewCtrl.update);
router.delete('/reviews/:reviewId', verifyToken, reviewCtrl.destroy);

export default router;