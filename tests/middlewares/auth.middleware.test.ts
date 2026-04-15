import { describe, vi, expect, it, beforeEach} from 'vitest'
import jwt from 'jsonwebtoken'
import { type Response, type Request, type NextFunction } from 'express'
import { verifyToken, type AuthRequest } from '../../middlewares/auth.middleware.js'

vi.mock('jsonwebtoken')

describe('Auth middlwares', () => {
    let mockReq: Partial<AuthRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    // Reset testcase
    beforeEach(() => {
        mockReq = {
            header: vi.fn()
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
    })

    it('should return 401 if no token is provided', () => {
        (mockReq.header as any).mockReturnValue(undefined);

        verifyToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.'});
        expect(mockNext).not.toHaveBeenCalled();
    });
})