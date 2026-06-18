"use client"

import {
  Alert02Icon,
  Home01Icon,
  Loading03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useSyncExternalStore } from "react"

type GlobalFallbackProps =
  | { kind: "error"; onRetry: () => void }
  | { kind: "not-found"; onRetry?: never }

const copy = {
  en: {
    errorDescription:
      "The storefront hit an unexpected problem. Try again, or return to the home page.",
    errorTitle: "Something went wrong",
    home: "Return home",
    notFoundDescription:
      "We could not find the page you requested. It may have moved or no longer be available.",
    notFoundTitle: "Page not found",
    retry: "Try again",
  },
  ar: {
    errorDescription:
      "واجه المتجر مشكلة غير متوقعة. حاول مرة أخرى أو عد إلى الصفحة الرئيسية.",
    errorTitle: "حدث خطأ ما",
    home: "العودة للرئيسية",
    notFoundDescription:
      "تعذر العثور على الصفحة التي طلبتها. ربما تم نقلها أو لم تعد متاحة.",
    notFoundTitle: "الصفحة غير موجودة",
    retry: "حاول مرة أخرى",
  },
} as const

function getLocale(): "ar" | "en" {
  if (typeof document === "undefined") return "en"
  return document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/)?.[1] === "ar"
    ? "ar"
    : "en"
}

function subscribe() {
  return () => {}
}

function GlobalFallback(props: GlobalFallbackProps) {
  const locale = useSyncExternalStore(subscribe, getLocale, (): "en" => "en")
  const text = copy[locale]
  const isError = props.kind === "error"

  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground"
    >
      <section className="w-full max-w-lg rounded-3xl border bg-card p-8 text-center shadow-sm sm:p-10">
        <div
          className={
            isError
              ? "mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              : "mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary"
          }
        >
          <HugeiconsIcon
            icon={isError ? Alert02Icon : Search01Icon}
            className="size-10"
          />
        </div>
        <p
          className={
            isError
              ? "mt-6 text-sm font-semibold text-destructive"
              : "mt-6 text-sm font-semibold text-primary"
          }
        >
          {isError ? "Error" : "404"}
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          {isError ? text.errorTitle : text.notFoundTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isError ? text.errorDescription : text.notFoundDescription}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {isError && (
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              onClick={props.onRetry}
            >
              <HugeiconsIcon icon={Loading03Icon} className="size-4" />
              {text.retry}
            </button>
          )}
          <a
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
            href={locale === "ar" ? "/ar" : "/"}
          >
            <HugeiconsIcon icon={Home01Icon} className="size-4" />
            {text.home}
          </a>
        </div>
      </section>
    </main>
  )
}

export { GlobalFallback }
