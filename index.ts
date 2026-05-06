import express, { type Express } from 'express';
import cors from 'cors';
import v1Router from './routes/v1.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { serverConfig } from './config/server.config.js';
import { logger } from './services/logger.service.js';
import MailWorker from './services/email.service.js';
import cookieParser from 'cookie-parser';
import { authConfig } from './config/auth.config.js';

export const app: Express = express();

MailWorker.instance;

app.use(cors({
    origin: serverConfig.frontendUrl,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser(authConfig.JWTSecret));

app.use('/api/v1', v1Router);

app.use(errorMiddleware);

app.listen(serverConfig.port, () => {
    logger.info(`Server is running at http://localhost:${serverConfig.port}`)
});
