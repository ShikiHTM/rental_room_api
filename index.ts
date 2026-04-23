import express, { type Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'
import roomRoutes from './routes/room.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import { errorMiddleware } from './middlewares/error.middleware.js';
import { serverConfig } from './config/server.config.js';
import { logger } from './services/logger.service.js';

export const app: Express = express();

app.use(cors());
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/room', roomRoutes)
app.use('/api/bookings', bookingRoutes)

app.use(errorMiddleware);

app.listen(serverConfig.port, () => {
    logger.info(`Server is running at http://localhost:${serverConfig.port}`)
});
