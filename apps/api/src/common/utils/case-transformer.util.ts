export class CaseTransformer {
  /**
   * Convert a string from camelCase to snake_case
   */
  static toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert a string from snake_case to camelCase
   */
  static toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
  }

  /**
   * Deep convert all object keys to snake_case
   */
  static transformToSnake(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;

    // Pass-through standard JS/Prisma complex types
    if (obj instanceof Date || obj instanceof Buffer) {
      return obj;
    }

    // Handle BigInt
    if (typeof obj === 'bigint') {
      return obj.toString();
    }

    // Handle Array
    if (Array.isArray(obj)) {
      return obj.map((item: unknown) => this.transformToSnake(item));
    }

    // Handle plain Objects
    if (typeof obj === 'object') {
      // Check if it's a Prisma.Decimal or custom class
      const constructorName = obj.constructor ? obj.constructor.name : '';
      if (constructorName === 'Decimal') {
        return Number((obj as { toString: () => string }).toString());
      }

      const transformed: Record<string, unknown> = {};
      const keys = Object.keys(obj);
      for (const key of keys) {
        transformed[this.toSnakeCase(key)] = this.transformToSnake((obj as Record<string, unknown>)[key]);
      }
      return transformed;
    }

    return obj;
  }

  /**
   * Deep convert all object keys to camelCase
   */
  static transformToCamel(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;

    // Pass-through standard JS/Prisma complex types
    if (obj instanceof Date || obj instanceof Buffer) {
      return obj;
    }

    // Handle Array
    if (Array.isArray(obj)) {
      return obj.map((item: unknown) => this.transformToCamel(item));
    }

    // Handle plain Objects
    if (typeof obj === 'object') {
      const constructorName = obj.constructor ? obj.constructor.name : '';
      if (constructorName === 'Decimal') {
        return obj;
      }

      const transformed: Record<string, unknown> = {};
      const keys = Object.keys(obj);
      for (const key of keys) {
        transformed[this.toCamelCase(key)] = this.transformToCamel((obj as Record<string, unknown>)[key]);
      }
      return transformed;
    }

    return obj;
  }
}
