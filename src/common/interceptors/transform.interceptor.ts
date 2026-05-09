import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { flattenAllTranslations, flattenAllTranslationsArray } from '../utils/translation.util';

/**
 * Response transformation interceptor
 * Wraps all responses in a standard format
 */
export interface Response<T> {
    success: boolean;
    data: T;
    timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        // Extract Accept-Language from request
        const request = context.switchToHttp().getRequest();
        const acceptLanguage = request.headers['accept-language'] || 'en';

        // Parse Accept-Language header to get primary language code
        const requestedLangId = acceptLanguage.split(',')[0].split('-')[0].trim();

        return next.handle().pipe(
            map((data) => {
                // Apply translation transformation before wrapping response
                const transformedData = this.applyTranslationTransformation(data, requestedLangId);

                return {
                    success: true,
                    data: transformedData,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }

    /**
     * Apply translation transformation to response data
     * Handles various response structures (simple, array, paginated, nested)
     */
    private applyTranslationTransformation(data: any, requestedLangId: string): any {
        if (!data) {
            return data;
        }

        // Check if data is an array of entities with translations
        if (Array.isArray(data)) {
            const hasTranslations = data.length > 0 && data[0]?.translations && data[0].translations.length > 0;
            if (hasTranslations) {
                return flattenAllTranslationsArray(data, requestedLangId);
            }
            return data;
        }

        // Check if data is a simple object with translations
        if (data.translations && Array.isArray(data.translations) && data.translations.length > 0) {
            return flattenAllTranslations(data, requestedLangId);
        }

        // Check for nested paginated structure: { data: { data: [...], meta: {...} } }
        if (data.data && typeof data.data === 'object' && data.data.data && Array.isArray(data.data.data)) {
            const nestedData = data.data.data;
            const hasTranslations = nestedData.length > 0 && nestedData[0]?.translations && nestedData[0].translations.length > 0;
            if (hasTranslations) {
                return {
                    ...data,
                    data: {
                        ...data.data,
                        data: flattenAllTranslationsArray(nestedData, requestedLangId),
                    },
                };
            }
            return data;
        }

        // Check for paginated structure: { data: [...], meta: {...} }
        if (data.data && Array.isArray(data.data)) {
            const hasTranslations = data.data.length > 0 && data.data[0]?.translations && data.data[0].translations.length > 0;
            if (hasTranslations) {
                return {
                    ...data,
                    data: flattenAllTranslationsArray(data.data, requestedLangId),
                };
            }
            return data;
        }

        // No translations found, return data unchanged
        return data;
    }
}
