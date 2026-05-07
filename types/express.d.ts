import { IUserPayload } from "./types.js";

declare global {
    namespace Express {
        interface Request {
            user?: IUserPayload;
            dbUser?: {
                id: string;
                email: string;
                fullName: string;
                phoneNumber: string | null;
                role: 'USER' | 'HOST' | 'ADMIN';
                verifiedAt: Date | null;
                bannedAt: Date | null;
                banReason: string | null;
                banExpiresAt: Date | null;
                createdAt: Date;
            };
        }
    }
}
