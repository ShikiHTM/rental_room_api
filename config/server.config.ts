import * as dotenv from 'dotenv';
dotenv.config();

const raw = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const frontendUrl = raw.includes(',')
    ? raw.split(',').map(u => u.trim()).filter(Boolean)
    : raw.trim();

export const serverConfig = {
    port: process.env.PORT ?? 3000,
    frontendUrl,
}
