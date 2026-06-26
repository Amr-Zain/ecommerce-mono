import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type PaginationSearchParams = Record<string, string | string[] | undefined>

function pageUrl(
  pathname: string,
  searchParams: PaginationSearchParams,
  page: number
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || key === "page") continue
    for (const item of Array.isArray(value) ? value : [value]) {
      params.append(key, item)
    }
  }

  params.set("page", String(page))
  return `${pathname}?${params.toString()}`
}

function PaginationLink({
  children,
  disabled,
  href,
  label,
}: {
  children: React.ReactNode
  disabled: boolean
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border bg-background text-sm font-semibold transition-all hover:border-foreground/30 hover:bg-muted",
        disabled && "pointer-events-none opacity-35"
      )}
    >
      {children}
    </Link>
  )
}

function ListingPagination({
  pathname,
  searchParams,
  currentPage,
  totalPages,
  className,
}: {
  pathname: string
  searchParams: PaginationSearchParams
  currentPage: number
  totalPages: number
  className?: string
}) {
  if (totalPages <= 1) return null

  return (
    <div className={cn("mt-auto flex items-center justify-center gap-2 pt-6", className)}>
      <PaginationLink
        disabled={currentPage <= 1}
        href={pageUrl(pathname, searchParams, currentPage - 1)}
        label="Previous page"
      >
        {"<"}
      </PaginationLink>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <Link
          key={page}
          href={pageUrl(pathname, searchParams, page)}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-all",
            currentPage === page
              ? "border-foreground bg-foreground text-background shadow-sm"
              : "bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground"
          )}
        >
          {page}
        </Link>
      ))}
      <PaginationLink
        disabled={currentPage >= totalPages}
        href={pageUrl(pathname, searchParams, currentPage + 1)}
        label="Next page"
      >
        {">"}
      </PaginationLink>
    </div>
  )
}

export { ListingPagination, pageUrl }
export type { PaginationSearchParams }
