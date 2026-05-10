import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { ResponseHelper } from '../helpers/response.helper';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): Observable<never> {
        host.switchToRpc();
        let response;

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            const message = typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message || 'Error';

            this.logger.debug(`HttpException caught: ${message} (status: ${status})`);
            response = ResponseHelper.error(message, status);
        } else if (exception instanceof RpcException) {
            const error = exception.getError();
            const errorMessage = typeof error === 'string'
                ? error
                : JSON.stringify(error);

            this.logger.debug(`RpcException caught: ${errorMessage}`);
            response = ResponseHelper.internalError(errorMessage);
        } else if (exception instanceof Error) {
            // Database constraint violation (unique constraint)
            if ((exception as any).code === '23505') {
                const detail = (exception as any).detail || 'Duplicate key constraint violated';
                this.logger.debug(`Database constraint violation: ${detail}`);
                response = ResponseHelper.conflict(detail);
            } else {
                this.logger.error(`Unhandled Error exception: ${exception.message}`);
                response = ResponseHelper.internalError(exception.message);
            }
        } else {
            this.logger.error(  `Unknown exception type: ${exception}`);
            response = ResponseHelper.internalError('An unexpected error occurred');
        }

        this.logger.debug(`Returning RPC error response: ${JSON.stringify(response)}`);
        return throwError(() => new RpcException(response));
    }
}