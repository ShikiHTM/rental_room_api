import { Router } from "express";
import * as PaymentCtrl from "../controllers/payment.controller.js";
import { checkBanned, verifyToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// POST /payments
router.post("/", verifyToken, checkBanned, PaymentCtrl.createPayment);

export default router;
