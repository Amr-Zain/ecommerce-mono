import { SetMetadata } from '@nestjs/common';

export type ApiContextType = 'admin' | 'client';
export const API_CONTEXT_KEY = 'apiContext';
export const ApiContext = (context: ApiContextType) => SetMetadata(API_CONTEXT_KEY, context);