import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface IErrorResponse {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // For HttpExceptions (including ValidationPipe errors), getResponse() returns
    // the full body — which may contain an array of field-level validation messages.
    // Falling back to exception.message would discard those details.
    let message: string | string[];
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message =
        typeof response === 'object' &&
        response !== null &&
        'message' in response
          ? (response as { message: string | string[] }).message
          : exception.message;
    } else {
      message = 'Internal server error';
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: IErrorResponse = {
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }
}
