export class SuccessResponseDto<T> {
    success: true;
    data: T;
    message?: string;
}

export class ErrorResponseDto {
    success: false;
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

export type ApiResponseDto<T> = SuccessResponseDto<T> | ErrorResponseDto;