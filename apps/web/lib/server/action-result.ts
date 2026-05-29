type ActionResult<T = unknown> =
  | {
      data: T
      ok: true
      message?: string
    }
  | {
      errors?: unknown
      ok: false
      message: string
      status?: number
    }

function actionSuccess<T>(data: T, message?: string): ActionResult<T> {
  return {
    data,
    message,
    ok: true,
  }
}

function actionError(error: unknown): ActionResult<never> {
  if (error instanceof Response) {
    return {
      message: error.statusText || "Request failed",
      ok: false,
      status: error.status,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      ok: false,
    }
  }

  return {
    message: "An error occurred",
    ok: false,
  }
}

export { actionError, actionSuccess }
export type { ActionResult }
