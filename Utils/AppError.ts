export class AppError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly errors?: unknown
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', errors?: unknown) {
        super(400, message, errors);
        this.name = 'BadRequestError';
    }
}

export class ValidationError extends AppError {
    constructor(errors: unknown) {
        super(400, 'Validation failed', errors);
        this.name = 'ValidationError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(403, message);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Not found') {
        super(404, message);
        this.name = 'NotFoundError';
    }
}
