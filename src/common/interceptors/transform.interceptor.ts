import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { flattenAllTranslations, flattenAllTranslationsArray, EntityWithTranslations } from '../utils/translation.util';

export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface PaginatedData {
  data: EntityWithTranslations[];
  [key: string]: unknown;
}

interface NestedPaginatedData {
  data: PaginatedData;
  [key: string]: unknown;
}

type ResponseData = EntityWithTranslations | EntityWithTranslations[] | PaginatedData | NestedPaginatedData;

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const acceptLanguage = (request.headers['accept-language'] as string) || 'en';
    const requestedLangId = acceptLanguage.split(',')[0].split('-')[0].trim();

    return next.handle().pipe(
      map((data: T) => {
        const transformedData = this.applyTranslationTransformation(data as ResponseData, requestedLangId);

        return {
          success: true,
          data: transformedData as unknown as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  /**
   * Apply translation transformation to response data
   * Handles various response structures (simple, array, paginated, nested)
   */
  private applyTranslationTransformation(data: ResponseData, requestedLangId: string): ResponseData {
    if (!data) {
      return data;
    }

    // Check if data is an array of entities with translations
    if (Array.isArray(data)) {
      const arr = data;
      const hasTranslations = arr.length > 0 && Array.isArray(arr[0]?.translations) && arr[0].translations.length > 0;
      if (hasTranslations) {
        return flattenAllTranslationsArray(arr, requestedLangId);
      }
      return data;
    }

    const obj = data as Record<string, unknown>;

    // Check if data is a simple object with translations
    if (Array.isArray(obj['translations']) && (obj['translations'] as unknown[]).length > 0) {
      return flattenAllTranslations(obj as EntityWithTranslations, requestedLangId);
    }

    // Check for nested paginated structure: { data: { data: [...], meta: {...} } }
    if (
      obj['data'] &&
      typeof obj['data'] === 'object' &&
      !Array.isArray(obj['data']) &&
      Array.isArray((obj['data'] as Record<string, unknown>)['data'])
    ) {
      const inner = obj['data'] as Record<string, unknown>;
      const nestedData = inner['data'] as EntityWithTranslations[];
      const hasTranslations =
        nestedData.length > 0 && Array.isArray(nestedData[0]?.translations) && nestedData[0].translations.length > 0;
      if (hasTranslations) {
        return {
          ...obj,
          data: {
            ...inner,
            data: flattenAllTranslationsArray(nestedData, requestedLangId),
          },
        };
      }
      return data;
    }

    // Check for paginated structure: { data: [...], meta: {...} }
    if (Array.isArray(obj['data'])) {
      const arr2 = obj['data'] as WithTranslations[];
      const hasTranslations =
        arr2.length > 0 && Array.isArray(arr2[0]?.translations) && arr2[0].translations.length > 0;
      if (hasTranslations) {
        return {
          ...obj,
          data: flattenAllTranslationsArray(arr2, requestedLangId),
        };
      }
      return data;
    }

    return data;
  }
}
