import { toNestErrors } from '@hookform/resolvers'
import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverOptions,
} from 'react-hook-form'
import type { z } from 'zod/v4'
import { formatValidationIssueMessage } from './validation'

type ZodIssueLike = {
  code?: string
  message: string
  path: PropertyKey[]
  errors?: ZodIssueLike[][]
}

const issuePath = (issue: ZodIssueLike) =>
  issue.path.map((pathPart) => String(pathPart)).join('.')

const flattenIssues = (issues: readonly ZodIssueLike[]): ZodIssueLike[] =>
  issues.flatMap((issue) => {
    if (issue.code === 'invalid_union' && issue.errors?.length) {
      return issue.errors.flatMap((unionIssues) =>
        unionIssues.map((unionIssue) => ({
          ...unionIssue,
          path: [...issue.path, ...unionIssue.path],
        })),
      )
    }

    return issue
  })

const issuesToFieldErrors = (
  issues: readonly ZodIssueLike[],
): Record<string, FieldError> => {
  const errors: Record<string, FieldError> = {}

  flattenIssues(issues).forEach((issue) => {
    const path = issuePath(issue)
    if (!path || errors[path]) return

    errors[path] = {
      type: issue.code ?? 'validation',
      message: formatValidationIssueMessage(issue) ?? issue.message,
    }
  })

  return errors
}

export const zodFormResolver =
  <T extends FieldValues>(schema: z.ZodType<unknown>): Resolver<T, unknown, T> =>
  async (values: T, _context: unknown, options: ResolverOptions<T>) => {
    const result = await schema.safeParseAsync(values)

    if (result.success) {
      return {
        errors: {},
        values: result.data as T,
      }
    }

    return {
      values: {},
      errors: toNestErrors(
        issuesToFieldErrors(result.error.issues),
        options,
      ) as FieldErrors<T>,
    }
  }
