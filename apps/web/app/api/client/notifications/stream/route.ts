import { withAuthHeaders } from "@/lib/server/backend"

export async function GET() {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return Response.json(
      { message: "API_BASE_URL is required" },
      { status: 500 }
    )
  }

  let headers: Headers
  try {
    ;({ headers } = await withAuthHeaders({
      cache: "no-store",
      headers: { accept: "text/event-stream" },
      requireAuth: true,
    }))
  } catch (error) {
    if (error instanceof Response) return error
    throw error
  }
  const response = await fetch(new URL("/client/notifications/stream", baseUrl), {
    cache: "no-store",
    headers,
  })

  if (!response.ok || !response.body) {
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
    })
  }

  return new Response(response.body, {
    status: response.status,
    headers: {
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "content-type": response.headers.get("content-type") ?? "text/event-stream",
    },
  })
}
