import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('ExceptionsFilter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof HttpException
            ? exception.getResponse()
            : { message: 'Internal server error', statusCode: status };

        // Log the error
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`[${request.method}] ${request.url} - Error: ${JSON.stringify(exception)}`);
        }

        response.status(status).json({
            ...(typeof message === 'object' ? message : { message }),
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
