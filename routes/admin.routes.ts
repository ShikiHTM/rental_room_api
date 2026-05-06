import { Router } from "express";
import * as adminCtrl from '../controllers/admin.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';

const router: Router = Router();

// PATCH /api/admin/rooms/:roomId/approve
router.patch('/rooms/:roomId/approve', verifyToken, isAdmin, adminCtrl.approveRoom);
router.patch('/rooms/:roomId/reject', verifyToken, isAdmin, adminCtrl.rejectRoom); 

export default router;
