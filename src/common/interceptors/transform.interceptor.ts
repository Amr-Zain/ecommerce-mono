import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  // timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const acceptLanguage = (request.headers['accept-language'] as string) || 'en';
    const requestedLangId = acceptLanguage.split(',')[0].split('-')[0].trim();

    return next.handle().pipe(
      map((data: unknown) => {
        // 1. Recursively transform translations throughout the object
        const transformedData = this.deepTransform(data, requestedLangId);

        // 2. Format paginated results (flatten 'data' to 'items')
        let finalData = transformedData;
        if (this.isPaginated(transformedData)) {
          const paginated = transformedData as Record<string, unknown>;
          const { data: items, ...rest } = paginated;
          finalData = { items, ...rest };
        }

        return {
          success: true,
          data: finalData as T,
          // timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private isPaginated(data: unknown): boolean {
    return (
      data !== null &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      Array.isArray((data as Record<string, unknown>).data) &&
      !!(data as Record<string, unknown>).meta
    );
  }

  /**
   * Recursively traverses an object/array to flatten 'translations' everywhere.
   */
  private deepTransform(data: unknown, langId: string): unknown {
    if (!data || typeof data !== 'object' || data instanceof Date || data instanceof Buffer) {
      return data;
    }

    // Handle Arrays
    if (Array.isArray(data)) {
      return data.map((item: unknown) => this.deepTransform(item, langId));
    }

    // Handle Objects
    const result = { ...(data as Record<string, unknown>) };

    // 1. Recurse into all child properties first
    for (const key in result) {
      const value = result[key];
      if (key !== 'translations' && value && typeof value === 'object') {
        result[key] = this.deepTransform(value, langId);
      }
    }

    // 2. Flatten current object's translations
    const translations = result['translations'];
    if (Array.isArray(translations)) {
      translations.forEach((t: unknown) => {
        if (t && typeof t === 'object' && !Array.isArray(t)) {
          const translation = t as Record<string, unknown>;
          const { langId: tLang, ...fields } = translation;

          if (typeof tLang === 'string') {
            // Add language-specific key (e.g., result.en = { name: '...' })
            result[tLang] = fields;

            // If this is the requested language, promote fields to root
            if (tLang === langId) {
              Object.assign(result, fields);
            }
          }
        }
      });

      // Remove the original translations array
      delete result['translations'];
    }

    return result;
  }
}
