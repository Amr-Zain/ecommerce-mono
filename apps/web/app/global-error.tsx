"use client"

import { Alert02Icon, Home01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect } from "react"

export default function GlobalError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => console.error(error), [error])
  return <html lang="en"><body><main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground"><section className="w-full max-w-lg rounded-3xl border bg-card p-10 text-center shadow-sm"><HugeiconsIcon icon={Alert02Icon} className="mx-auto size-14 text-destructive" /><h1 className="mt-6 text-2xl font-bold">Something went wrong</h1><p className="mt-3 text-sm text-muted-foreground">The storefront hit an unexpected problem. Try loading it again.</p><div className="mt-7 flex justify-center gap-3"><button className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" onClick={unstable_retry}><HugeiconsIcon icon={Loading03Icon} className="size-4" />Try again</button><a className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium" href="/"><HugeiconsIcon icon={Home01Icon} className="size-4" />Home</a></div></section></main></body></html>
}
