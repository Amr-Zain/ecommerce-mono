import { proxyClientApiRequest } from "@/lib/server/client-api-registry"

type RouteContext = {
  params: Promise<{
    path: string[]
  }>
}

async function readRequestBody(request: Request) {
  if (request.method === "GET" || request.method === "DELETE") {
    return undefined
  }

  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    return request.formData()
  }

  return request.json().catch(() => null)
}

async function handleRequest(request: Request, context: RouteContext) {
  const { path } = await context.params
  const url = new URL(request.url)
  const method = request.method.toUpperCase()
  const body = await readRequestBody(request)

  return proxyClientApiRequest({
    body,
    method: method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: path.join("/"),
    searchParams: url.searchParams,
  })
}

export function GET(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export function POST(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export function PUT(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export function PATCH(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export function DELETE(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}
