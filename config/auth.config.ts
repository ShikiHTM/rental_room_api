import * as dotenv from 'dotenv';
dotenv.config();

export const authConfig = {
    JWTSecret: process.env.JWT_SECRET ?? 'fallback_secret',
    expiresIn: '7d'
} as const;