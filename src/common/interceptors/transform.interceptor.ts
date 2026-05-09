import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { flattenAllTranslations, flattenAllTranslationsArray } from '../utils/translation.util';
import { EntityWithTranslations } from '../types/i18n/translation.types';
import { ApiResponse, ControllerPayload, DataWithMessagePayload, PaginatedPayload } from '../types/http/response.types';
import { PaginationMeta } from '../dto/pagination.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<ControllerPayload<T>, ApiResponse<T | T[]>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T | T[]>> {
    const request = context.switchToHttp().getRequest<Request>();
    const acceptLanguage = (request.headers['accept-language'] as string) || 'en';
    const requestedLangId = acceptLanguage.split(',')[0].split('-')[0].trim();

    return next.handle().pipe(
      map((payload: ControllerPayload<T>) => {
        const normalized = this.normalizePayload(payload);
        const transformedData = this.applyTranslationTransformation(normalized.data, requestedLangId);

        return {
          success: true,
          data: transformedData as T | T[],
          timestamp: new Date().toISOString(),
          message: normalized.message,
          meta: normalized.meta,
        };
      }),
    );
  }

  private normalizePayload(payload: ControllerPayload<T>): {
    data: unknown;
    message?: string;
    meta?: PaginationMeta;
  } {
    if (!this.isObjectRecord(payload)) {
      return { data: payload };
    }

    const maybeObject = payload as Record<string, unknown>;

    if (this.isPaginatedPayload(maybeObject)) {
      const paginated = maybeObject;
      return {
        data: paginated.items,
        meta: paginated.meta,
      };
    }

    if (this.isDataWithMessagePayload(maybeObject)) {
      const withMessage = maybeObject;
      return {
        data: withMessage.data,
        message: withMessage.message,
      };
    }

    return { data: payload };
  }

  /**
   * Apply translation transformation to response data.
   * Supports entities and arrays of entities with translations.
   */
  private applyTranslationTransformation(data: unknown, requestedLangId: string): unknown {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      if (this.isTranslationEntityArray(data)) {
        return flattenAllTranslationsArray(data, requestedLangId);
      }
      return data;
    }

    if (this.isTranslationEntity(data)) {
      return flattenAllTranslations(data, requestedLangId);
    }

    return data;
  }

  private isPaginatedPayload(value: unknown): value is PaginatedPayload<T> {
    if (!this.isObjectRecord(value)) {
      return false;
    }

    return Array.isArray(value['items']) && this.isPaginationMeta(value['meta']);
  }

  private isDataWithMessagePayload(value: unknown): value is DataWithMessagePayload<T> {
    if (!this.isObjectRecord(value)) {
      return false;
    }

    return 'data' in value && ('message' in value || Object.keys(value).length <= 2);
  }

  private isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isPaginationMeta(value: unknown): value is PaginationMeta {
    if (!this.isObjectRecord(value)) {
      return false;
    }

    return (
      typeof value['page'] === 'number' &&
      typeof value['limit'] === 'number' &&
      typeof value['total'] === 'number' &&
      typeof value['totalPages'] === 'number' &&
      typeof value['hasNextPage'] === 'boolean' &&
      typeof value['hasPreviousPage'] === 'boolean'
    );
  }

  private isTranslationEntity(value: unknown): value is EntityWithTranslations {
    if (!this.isObjectRecord(value)) {
      return false;
    }

    const translations = value['translations'];
    return Array.isArray(translations) && translations.length > 0;
  }

  private isTranslationEntityArray(value: unknown[]): value is EntityWithTranslations[] {
    return value.length > 0 && this.isTranslationEntity(value[0]);
  }
}
