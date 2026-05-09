import * as dotenv from 'dotenv';
dotenv.config();

export const serverConfig = {
    port: process.env.PORT ?? 3000,
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000'
}
