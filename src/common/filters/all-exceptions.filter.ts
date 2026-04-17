import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext, I18nValidationException } from 'nestjs-i18n';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // Let the validation filter handle its own exceptions if possible,
    // though Nest usually defers to the closest matching filter.
    if (exception instanceof I18nValidationException) {
      // Just parse its specific payload if we accidentally catch it
      const responseBody = {
        statusCode: exception.getStatus(),
        message: 'Validation failed',
        errors: exception.errors,
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, exception.getStatus());
      return;
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseMessage: string | any = 'Internal server error';
    let translationKey = 'errors.INTERNAL_SERVER_ERROR';
    let args = {};

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      
      // If it's our custom AppException, extract key and args
      if ('key' in exception) {
        translationKey = (exception as any).key;
        args = (exception as any).args || {};
        responseMessage = translationKey;
      } else {
        // Standard NestJS HttpException
        responseMessage =
          typeof response === 'object' && response !== null && 'message' in response
            ? (response as any).message
            : exception.message;

        // Automatically form translation keys for standard HTTP errors if desired
        // e.g. "Not Found" -> "errors.Not Found"
        translationKey = `errors.${Array.isArray(responseMessage) ? responseMessage[0] : responseMessage}`;
      }
    } else {
      // Log unhandled non-HTTP exceptions (like DB errors)
      this.logger.error(exception);
    }

    // Process Internationalization
    const i18n = I18nContext.current(host);
    const originalMessage = Array.isArray(responseMessage) ? responseMessage[0] : responseMessage;
    
    let localizedMessage = originalMessage;

    if (i18n) {
      // The t() function returns the key itself if no translation is found. 
      // We fall back to the original message if translation fails (result equals key).
      const translation = i18n.t(translationKey, { args, defaultValue: originalMessage });
      localizedMessage = translation;
    }

    const responseBody = {
      statusCode: httpStatus,
      message: localizedMessage,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
