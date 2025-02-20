import { ErrorTracker } from './error-tracker';

export class AppError extends Error {
    constructor(
        message: string,
        public status: number = 500,
        public code?: string,
        context: string = 'application'
    ) {
        super(message);
        this.name = 'AppError';
        ErrorTracker.track(this, context);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, context: string = 'validation') {
        super(message, 400, 'VALIDATION_ERROR', context);
        this.name = 'ValidationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Unauthorized', context: string = 'auth') {
        super(message, 401, 'AUTHORIZATION_ERROR', context);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, context: string = 'database') {
        super(`${resource} not found`, 404, 'NOT_FOUND', context);
        this.name = 'NotFoundError';
    }
}