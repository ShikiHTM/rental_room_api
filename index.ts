import dotenv from 'dotenv';
import express, {type Express} from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'
import roomRoutes from './routes/room.routes.js'
import bookingRoutes from './routes/booking.routes.js'

export const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/room', roomRoutes)
app.use('/api/bookings', bookingRoutes)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});