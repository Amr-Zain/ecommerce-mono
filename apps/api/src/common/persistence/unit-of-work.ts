export const UNIT_OF_WORK = Symbol('UnitOfWork');

/** Opaque application transaction handle inspected only by persistence adapters. */
export abstract class TransactionContext {
  protected readonly transactionContextBrand = true;
}

export type TransactionIsolation = 'default' | 'serializable';

export interface TransactionOptions {
  isolation?: TransactionIsolation;
  maxRetries?: number;
}

export interface UnitOfWork {
  execute<T>(work: (context: TransactionContext) => Promise<T>, options?: TransactionOptions): Promise<T>;
}
