import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function GlobalNotFound() {
  return <html lang="en"><body><main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground"><section className="w-full max-w-lg rounded-3xl border bg-card p-10 text-center shadow-sm"><HugeiconsIcon icon={Search01Icon} className="mx-auto size-14 text-primary" /><h1 className="mt-6 text-2xl font-bold">Page not found</h1><p className="mt-3 text-sm text-muted-foreground">We could not find the page you requested.</p><a className="mt-7 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" href="/">Return home</a></section></main></body></html>
}
