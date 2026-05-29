import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext, I18nValidationException, I18nValidationError } from 'nestjs-i18n';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<unknown>();
    const i18n = I18nContext.current(host);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Record<string, string> = {};
    let translationKey = 'errors.INTERNAL_SERVER_ERROR';
    let args: Record<string, unknown> = {};

    if (exception instanceof I18nValidationException) {
      status = exception.getStatus();
      translationKey = 'errors.VALIDATION_FAILED';
      message = 'Validation failed';

      // Translate each individual validation error
      errors = this.formatI18nErrors(exception.errors, i18n);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseUnknown = exception.getResponse();

      if (typeof responseUnknown === 'object' && responseUnknown !== null) {
        const res = responseUnknown as Record<string, unknown>;

        // Handle ValidationPipe errors (non-i18n)
        if (Array.isArray(res.message)) {
          translationKey = 'errors.VALIDATION_FAILED';
          message = 'Validation failed';
          (res.message as string[]).forEach((msg: string) => {
            const [field] = msg.split(' ');
            errors[field] = msg;
          });
        } else {
          message = (res.message as string) || exception.message;
        }

        // Custom AppException handling
        if ('key' in exception) {
          const appEx = exception as unknown as { key: string; args?: Record<string, unknown> };
          translationKey = appEx.key;
          args = appEx.args ?? {};
          message = translationKey;
        } else {
          translationKey = `errors.${message}`;
        }
      } else {
        message = exception.message;
        translationKey = `errors.${message}`;
      }
    } else {
      this.logger.error(exception);
    }

    // Process Internationalization for the main message
    if (i18n && translationKey) {
      const translationResult: unknown = i18n.t(translationKey, {
        args,
        defaultValue: message,
      });
      message = typeof translationResult === 'string' ? translationResult : message;
    }

    const isProduction = process.env.NODE_ENV === 'production';

    const responseBody: Record<string, unknown> = {
      statusCode: status,
      message: message,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    // Add dev logs if not in production
    if (!isProduction && exception instanceof Error) {
      responseBody.stack = exception.stack;
      responseBody.details = exception.message;
    }

    httpAdapter.reply(response, responseBody, status);
  }

  private formatI18nErrors(errors: I18nValidationError[], i18n?: I18nContext): Record<string, string> {
    const formattedErrors: Record<string, string> = {};

    errors.forEach((error) => {
      if (error.constraints) {
        const constraints = Object.values(error.constraints);
        if (constraints.length > 0) {
          const rawMessage = constraints[0];
          let translatedMessage = rawMessage;

          // Parse and translate i18n constraint strings (format: key|{json_args})
          if (i18n && rawMessage.includes('|')) {
            try {
              const [key, argsStr] = rawMessage.split('|');
              const args = JSON.parse(argsStr) as Record<string, unknown>;
              const result = i18n.t(key, { args });
              if (typeof result === 'string') {
                translatedMessage = result;
              }
            } catch {
              // Fallback to raw if parsing fails
            }
          }

          formattedErrors[error.property] = translatedMessage;
        }
      }

      // Handle nested errors recursively
      if (error.children && error.children.length > 0) {
        const children = this.formatI18nErrors(error.children, i18n);
        Object.entries(children).forEach(([key, value]) => {
          formattedErrors[`${error.property}.${key}`] = value;
        });
      }
    });

    return formattedErrors;
  }
}
