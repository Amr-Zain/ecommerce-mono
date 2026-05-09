import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
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

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseMessage: string = 'Internal server error';
    let translationKey = 'errors.INTERNAL_SERVER_ERROR';
    let args: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      const responseUnknown: unknown = exception.getResponse();

      // If it's our custom AppException, extract key and args
      if ('key' in exception) {
        const appEx = exception as { key: string; args?: Record<string, unknown> };
        translationKey = appEx.key;
        args = appEx.args ?? {};
        responseMessage = translationKey;
      } else {
        // Standard NestJS HttpException
        const rawMessage =
          typeof responseUnknown === 'object' && responseUnknown !== null && 'message' in responseUnknown
            ? (responseUnknown as { message: unknown }).message
            : exception.message;

        responseMessage =
          typeof rawMessage === 'string'
            ? rawMessage
            : Array.isArray(rawMessage) && typeof rawMessage[0] === 'string'
              ? rawMessage[0]
              : String(exception.message ?? 'HTTP exception');

        // Automatically form translation keys for standard HTTP errors if desired
        // e.g. "Not Found" -> "errors.Not Found"
        translationKey = `errors.${responseMessage}`;
      }
    } else {
      // Log unhandled non-HTTP exceptions (like DB errors)
      this.logger.error(exception);
    }

    // Process Internationalization
    const i18n = I18nContext.current(host);

    let localizedMessage: string = responseMessage;

    if (i18n) {
      // nestjs-i18n `t()` can return primitives; avoid String(object) ([object Object]).
      const translationResult: unknown = i18n.t(translationKey, {
        args,
        defaultValue: responseMessage,
      });
      localizedMessage = this.localizeFromTranslationResult(translationResult, responseMessage);
    }

    const requestUrlUnknown: unknown = httpAdapter.getRequestUrl(ctx.getRequest());

    const responseBody = {
      statusCode: httpStatus,
      message: localizedMessage,
      timestamp: new Date().toISOString(),
      path: typeof requestUrlUnknown === 'string' ? requestUrlUnknown : '',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private localizeFromTranslationResult(result: unknown, fallback: string): string {
    if (typeof result === 'string') {
      return result;
    }

    if (typeof result === 'number' || typeof result === 'boolean' || typeof result === 'bigint') {
      return String(result);
    }

    return fallback;
  }
}
