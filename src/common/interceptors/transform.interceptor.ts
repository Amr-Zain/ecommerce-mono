import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaseTransformer } from '../utils/case-transformer.util';
import { API_CONTEXT_KEY, ApiContextType } from '../decorators/api-context.decorator';

const CLIENT_WHITELIST: Record<string, Set<string>> = {
  country: new Set(['id', 'name', 'phoneCode', 'phoneLength', 'phoneStartWith', 'flag']),
  city: new Set(['id', 'name', 'countryId', 'country']),
  slider: new Set(['id', 'title', 'slide', 'sortOrder', 'startDate', 'endDate']),
  faq: new Set(['id', 'question', 'answer', 'sortOrder']),
  collection: new Set(['id', 'name', 'parentId', 'children', 'sortOrder', 'image']),
  product: new Set(['id', 'name', 'description', 'hasVariants', 'collectionId', 'image', 'gallery', 'variants']),
  productVariant: new Set(['id', 'price', 'compareAtPrice', 'costPrice', 'discountType', 'discountValue', 'stockQuantity', 'barcode', 'sku', 'attributes', 'gallery']),
  attribute: new Set(['id', 'name', 'values']),
  attributeValue: new Set(['id', 'name']),
  staticPage: new Set(['id', 'slug', 'title', 'content', 'sections', 'image']),
  pageSection: new Set(['id', 'title', 'content', 'sortOrder']),
  review: new Set(['id', 'rating', 'comment', 'isVerified', 'createdAt', 'user']),
  address: new Set(['id', 'address', 'cityId', 'countryId', 'streetName', 'buildingNumber', 'isDefault', 'city', 'country']),
};

function detectEntityType(obj: Record<string, unknown>): string | null {
  const keys = new Set(Object.keys(obj));
  if (keys.has('phoneStartWith')) return 'country';
  if (keys.has('slug') && keys.has('sections')) return 'staticPage';
  if (keys.has('hasVariants')) return 'product';
  if (keys.has('price') && keys.has('stockQuantity')) return 'productVariant';
  if (keys.has('parentId') && keys.has('sortOrder') && !keys.has('price')) return 'collection';
  if (keys.has('startDate')) return 'slider';
  if (keys.has('rating') && keys.has('productId')) return 'review';
  if (keys.has('attributeId')) return 'attributeValue';
  if (keys.has('staticPageId')) return 'pageSection';
  if (keys.has('countryId') && !keys.has('userId')) return 'city';
  if (keys.has('streetName')) return 'address';
  if (keys.has('question') && keys.has('answer')) return 'faq';
  if (keys.has('values') && !keys.has('price')) return 'attribute';
  return null;
}

export interface Response<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const acceptLanguage = (request.headers['accept-language'] as string) || 'en';
    const requestedLangId = acceptLanguage.split(',')[0].split('-')[0].trim();

    const apiContext =
      this.reflector.get<ApiContextType>(API_CONTEXT_KEY, context.getHandler()) ||
      this.reflector.get<ApiContextType>(API_CONTEXT_KEY, context.getClass()) ||
      'admin';

    return next.handle().pipe(
      map((data: unknown) => {
        const transformedData = this.deepTransform(data, requestedLangId, apiContext);

        const dataWithFullPaths = this.transformMediaPaths(transformedData);

        let finalData = dataWithFullPaths;
        if (this.isPaginated(dataWithFullPaths)) {
          const paginated = dataWithFullPaths as Record<string, unknown>;
          const { data: items, ...rest } = paginated;
          finalData = { items, ...rest };
        }

        const snakeCaseData = CaseTransformer.transformToSnake(finalData);

        return {
          success: true,
          data: snakeCaseData as T,
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
  private deepTransform(data: unknown, langId: string, apiContext: ApiContextType = 'admin'): unknown {
    if (!data || typeof data !== 'object' || data instanceof Date || data instanceof Buffer) {
      return data;
    }

    // Handle Prisma Decimal (Decimal.js objects)
    if (data && typeof data === 'object' && 'd' in data && 's' in data) {
      const decimalObj = data as { toString(): string };
      const toStringVal = decimalObj.toString();
      if (toStringVal !== '[object Object]') {
        return Number(toStringVal);
      }
    }

    // Handle BigInt
    if (typeof data === 'bigint') {
      return (data as bigint).toString();
    }

    // Handle Arrays
    if (Array.isArray(data)) {
      return data.map((item: unknown) => this.deepTransform(item, langId, apiContext));
    }

    // Handle Objects
    const result = { ...(data as Record<string, unknown>) };

    // 1. Recurse into all child properties first
    for (const key in result) {
      const value = result[key];
      if (key !== 'translations') {
        result[key] = this.deepTransform(value, langId, apiContext);
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
            if (apiContext === 'client') {
              if (tLang === langId) {
                const { id: _id, recordId: _recordId, ...promotableFields } = fields;
                Object.assign(result, promotableFields);
              }
            } else {
              result[tLang] = fields;

              if (tLang === langId) {
                const { id: _id, recordId: _recordId, ...promotableFields } = fields;
                Object.assign(result, promotableFields);
              }
            }
          }
        }
      });

      delete result['translations'];
    }

    // 3. Apply whitelist for client context
    if (apiContext === 'client') {
      const entityType = detectEntityType(result);
      if (entityType && CLIENT_WHITELIST[entityType]) {
        const allowed = CLIENT_WHITELIST[entityType];
        for (const key of Object.keys(result)) {
          if (!allowed.has(key)) {
            delete result[key];
          }
        }
      } else {
        for (const field of new Set(['isActive', 'createdAt', 'updatedAt', 'deletedAt', 'shippingPrice'])) {
          delete result[field];
        }
      }
    }

    return result;
  }

  /**
   * Recursively traverses an object/array to append base URL to 'path' if it's a media path.
   */
  private transformMediaPaths(data: unknown): unknown {
    if (!data || typeof data !== 'object' || data instanceof Date || data instanceof Buffer) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item: unknown) => this.transformMediaPaths(item));
    }

    const result = { ...(data as Record<string, unknown>) };

    // If this object has a 'path' and looks like a Media object
    if (
      typeof result['path'] === 'string' &&
      result['path'].startsWith('/uploads') &&
      (result['filename'] || result['mimeType']) // Heuristic for Media record
    ) {
      const baseUrl = process.env.APP_URL || 'http://localhost:3030';
      result['path'] = `${baseUrl}${result['path']}`;
    }

    // Recurse into all properties
    for (const key in result) {
      const value = result[key];
      if (value && typeof value === 'object') {
        result[key] = this.transformMediaPaths(value);
      }
    }

    return result;
  }
}
