import { IUserPayload } from "./types.js";

declare global {
    namespace Express {
        interface Request {
            user?: IUserPayload;
        }
    }
}
