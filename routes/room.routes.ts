import { Router } from "express";
import * as roomCrtl from '../controllers/room.controller.js'
import { checkBanned, verifyToken } from "../middlewares/auth.middleware.js";
import * as role from "../middlewares/role.middleware.js";

const router: Router = Router();

// Public Routes

router.get('/', roomCrtl.getRooms);
router.get('/:id', roomCrtl.getRoom);

// Protected Routes

router.post('/apply', verifyToken, checkBanned, roomCrtl.applyToBeHost);
router.post('/create', verifyToken, checkBanned, roomCrtl.createRoom);

// Host/Admin Routes

router.put('/:id', verifyToken, checkBanned, roomCrtl.updateRoom);
router.delete('/:id', verifyToken, checkBanned, roomCrtl.deleteRoom);

export default router;
