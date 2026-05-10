import { SuccessResponseDto, ErrorResponseDto } from '../dtos/response.dto';

export class ResponseHelper {
    static success<T>(data: T, message?: string): SuccessResponseDto<T> {
        return {
            success: true,
            data,
            ...(message && { message }),
        };
    }

    static error(
        message: string,
        statusCode: number,
        errors?: Record<string, string[]>,
    ): ErrorResponseDto {
        return {
            success: false,
            message,
            statusCode,
            ...(errors && { errors }),
        };
    }

    static notFound(resource: string): ErrorResponseDto {
        return this.error(`${resource} not found`, 404);
    }

    static badRequest(
        message: string = 'Bad request',
        errors?: Record<string, string[]>,
    ): ErrorResponseDto {
        return this.error(message, 400, errors);
    }

    static conflict(message: string = 'Conflict'): ErrorResponseDto {
        return this.error(message, 409);
    }

    static internalError(message: string = 'Internal server error'): ErrorResponseDto {
        return this.error(message, 500);
    }
}