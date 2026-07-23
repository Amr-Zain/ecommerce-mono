import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { CaseTransformer } from '../utils/case-transformer.util';

const firstQueryValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);

/**
 * Custom decorator to parse nested query parameters
 * Handles formats like: ?sort[createdAt]=desc&filters[isActive]=1
 */
export const ParsedQuery = createParamDecorator(async (dtoClass: ClassConstructor<unknown>, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const query = request.query as Record<string, unknown>;

  const parsed: Record<string, unknown> = {};

  for (const key in query) {
    const match = key.match(/^(\w+)\[(.+)\]$/);

    if (match) {
      const [, parentKey, childKey] = match;

      if (!parsed[parentKey]) {
        parsed[parentKey] = {};
      }

      (parsed[parentKey] as Record<string, unknown>)[CaseTransformer.toCamelCase(childKey)] = firstQueryValue(query[key]);
    } else {
      parsed[CaseTransformer.toCamelCase(key)] = firstQueryValue(query[key]);
    }
  }

  const dtoInstance = plainToInstance(dtoClass, parsed);

  const errors = await validate(dtoInstance as object);
  if (errors.length > 0) {
    console.log('ParsedQuery - Validation errors:', errors);
  }

  return dtoInstance;
});
