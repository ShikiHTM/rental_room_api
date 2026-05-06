import { UserPayload } from "./types.js";

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
