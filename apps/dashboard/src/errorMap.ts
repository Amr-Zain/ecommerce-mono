import { z } from 'zod/v4'
import { customGlobalError, TFn } from './lib/schema/validation'

export const makeErrorMap = (_t: TFn) => customGlobalError

export const setupZodI18n = (_t: TFn) => {
  z.config({ customError: customGlobalError })
}
