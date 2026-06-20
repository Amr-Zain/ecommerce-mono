const CACHE_TYPE_KEY = '__cacheType';

type EncodedCacheValue = null | string | number | boolean | EncodedCacheValue[] | { [key: string]: EncodedCacheValue };

type TypedCacheValue = {
  [CACHE_TYPE_KEY]: 'bigint' | 'date' | 'decimal';
  value: string;
};

export function encodeCacheValue(value: unknown): EncodedCacheValue {
  if (typeof value === 'bigint') {
    return { [CACHE_TYPE_KEY]: 'bigint', value: value.toString() };
  }

  if (value instanceof Date) {
    return { [CACHE_TYPE_KEY]: 'date', value: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return value.map((item) => encodeCacheValue(item));
  }

  if (!value || typeof value !== 'object') {
    return value as EncodedCacheValue;
  }

  if (isDecimalLike(value)) {
    return { [CACHE_TYPE_KEY]: 'decimal', value: value.toString() };
  }

  const result: Record<string, EncodedCacheValue> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = encodeCacheValue(item);
  }
  return result;
}

export function decodeCacheValue<T>(value: unknown): T {
  return decode(value) as T;
}

function decode(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => decode(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (isTypedValue(value)) {
    if (value[CACHE_TYPE_KEY] === 'bigint') return BigInt(value.value);
    if (value[CACHE_TYPE_KEY] === 'date') return new Date(value.value);
    return Number(value.value);
  }

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = decode(item);
  }
  return result;
}

function isTypedValue(value: object): value is TypedCacheValue {
  const typed = value as Record<string, unknown>;
  return (
    typeof typed[CACHE_TYPE_KEY] === 'string' &&
    typeof typed.value === 'string' &&
    ['bigint', 'date', 'decimal'].includes(typed[CACHE_TYPE_KEY])
  );
}

function isDecimalLike(value: object): value is { toString(): string } {
  if (!('d' in value) || !('s' in value) || typeof (value as { toString?: unknown }).toString !== 'function') {
    return false;
  }
  const text = (value as { toString(): string }).toString();
  return text !== '[object Object]' && Number.isFinite(Number(text));
}
