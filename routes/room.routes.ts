import { Router } from "express";
import * as roomCrtl from '../controllers/room.controller.js'
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isHost, isAdmin } from "../middlewares/role.middleware.js";

const router:Router = Router();

// Public Routes

router.get('/', roomCrtl.getAllRooms);
router.get('/:id', roomCrtl.getRoomById);

// Protected Routes

router.post('/apply', verifyToken, roomCrtl.applyToBeHost);
router.post('/create', verifyToken, isHost, roomCrtl.createRoom);

// Host/Admin Routes

router.put('/:id', verifyToken, roomCrtl.updateRoom);
router.delete('/:id', verifyToken, roomCrtl.deleteRoom);

export default router;