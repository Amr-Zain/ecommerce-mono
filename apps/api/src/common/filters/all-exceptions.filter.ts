import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nContext, I18nValidationException, I18nValidationError } from 'nestjs-i18n';
import { Prisma } from '@prisma/client';
import { PRISMA_ERROR_CODES } from '../constants/prisma.constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ headersSent?: boolean }>();
    const i18n = I18nContext.current(host);

    if (response.headersSent) {
      this.logger.error('Exception occurred after response headers were sent', exception);
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Record<string, string> = {};
    let translationKey = 'errors.INTERNAL_SERVER_ERROR';
    let args: Record<string, unknown> = {};

    // ─── Prisma errors (DB constraint violations) ───────────────────────
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaResult = this.handlePrismaError(exception);
      status = prismaResult.status;
      message = prismaResult.message;
      translationKey = prismaResult.translationKey;
      args = prismaResult.args;
    } else if (exception instanceof I18nValidationException) {
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
          message = this.toSafeMessage(res.message || exception.message);
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
        message = this.toSafeMessage(exception.message);
        translationKey = `errors.${message}`;
      }
    } else {
      const safeMessage =
        exception instanceof Error
          ? exception.message
          : typeof exception === 'string'
            ? exception
            : 'Unknown non-error exception';
      const safeStack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(safeMessage, safeStack);
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

  private toSafeMessage(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value instanceof Error) return value.message;
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const nested = record.message ?? record.error ?? record.description ?? record.reason;
      if (nested && nested !== value) return this.toSafeMessage(nested);
      try {
        return JSON.stringify(value);
      } catch {
        return 'Unexpected error';
      }
    }
    return 'Unexpected error';
  }

  /**
   * Maps Prisma error codes to HTTP status + user-friendly message.
   * Extracts field/model info from Prisma's meta for specific error messages.
   */
  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    translationKey: string;
    args: Record<string, unknown>;
  } {
    const meta = exception.meta as Record<string, unknown> | undefined;

    switch (exception.code) {
      // Foreign key constraint violation
      case PRISMA_ERROR_CODES.foreignKeyViolation: {
        // meta.field_name can be "cities_country_id_fkey" or undefined
        // Also try parsing from exception.message which contains the constraint name
        const rawField = (meta?.field_name as string) || '';
        let field = this.extractFieldName(rawField);

        // If meta didn't give us a useful field, parse from the error message
        if (!field) {
          const constraintMatch = exception.message.match(/constraint:\s*`([^`]+)`/);
          if (constraintMatch) {
            field = this.extractFieldName(constraintMatch[1]);
          }
        }

        const model = this.extractModelName(meta?.modelName as string | undefined, exception.message);
        const displayField = field || 'related record';
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `${model ? model + ': ' : ''}The ${displayField} does not exist`,
          translationKey: 'errors.FOREIGN_KEY_VIOLATION',
          args: { field: displayField, model },
        };
      }

      // Record not found (update/delete on non-existent row)
      case PRISMA_ERROR_CODES.recordNotFound: {
        const model = (meta?.modelName as string) || '';
        const cause = (meta?.cause as string) || 'Record not found';
        return {
          status: HttpStatus.NOT_FOUND,
          message: model ? `${model} not found` : cause,
          translationKey: 'errors.RECORD_NOT_FOUND',
          args: { model, cause },
        };
      }

      // Unique constraint violation
      case PRISMA_ERROR_CODES.uniqueConstraint: {
        const target = (meta?.target as string[]) || [];
        const model = (meta?.modelName as string) || '';
        const fields = target.length > 0 ? target.join(', ') : 'field';
        return {
          status: HttpStatus.CONFLICT,
          message: `${model ? model + ': ' : ''}A record with this ${fields} already exists`,
          translationKey: 'errors.UNIQUE_CONSTRAINT_VIOLATION',
          args: { field: fields, model },
        };
      }

      // Required relation not found (connect failed)
      case PRISMA_ERROR_CODES.relationNotFound: {
        const relation = (meta?.relation_name as string) || '';
        const model = (meta?.modelName as string) || '';
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `${model ? model + ': ' : ''}The related ${relation || 'record'} does not exist`,
          translationKey: 'errors.RELATION_NOT_FOUND',
          args: { relation, model },
        };
      }

      default:
        this.logger.error(`Unhandled Prisma error ${exception.code}: ${exception.message}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
          translationKey: 'errors.DATABASE_ERROR',
          args: {},
        };
    }
  }

  /**
   * Extracts a clean field name from Prisma's FK constraint name.
   * "cities_country_id_fkey" → "country"
   * "City_countryId_fkey" → "country"
   * "countryId" → "country"
   */
  private extractFieldName(raw: string): string {
    if (!raw) return '';
    // Pattern: table_field_id_fkey (snake_case DB constraint)
    const snakeFkeyMatch = raw.match(/^\w+?_(.+?)_fkey$/);
    if (snakeFkeyMatch) {
      // "cities_country_id_fkey" → "country_id" → "country"
      const fieldPart = snakeFkeyMatch[1];
      return fieldPart.replace(/_id$/, '').replace(/_/g, ' ');
    }
    // Pattern: ModelName_fieldName_fkey (camelCase)
    const camelFkeyMatch = raw.match(/_(.+?)_fkey$/);
    if (camelFkeyMatch) {
      // "City_countryId_fkey" → "countryId" → "country"
      return camelFkeyMatch[1]
        .replace(/Id$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
    }
    // Fallback: strip "Id" suffix
    return raw.replace(/Id$/, '').replace(/_id$/, '').replace(/_/g, ' ');
  }

  /**
   * Extracts model name from meta or falls back to parsing the error message.
   */
  private extractModelName(metaModel: string | undefined, errorMessage: string): string {
    if (metaModel) return metaModel;
    // Try to extract from message like "... on the model `City`"
    const match = errorMessage.match(/model\s+`?(\w+)`?/i);
    return match ? match[1] : '';
  }
}
