import { buttonVariants } from "@ecommerce/ui/components/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@ecommerce/ui/components/pagination"

import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type PaginationSearchParams = Record<string, string | string[] | undefined>
type PaginationItem = number | "ellipsis-start" | "ellipsis-end"

function pageUrl(
  pathname: string,
  searchParams: PaginationSearchParams,
  page: number,
  pageParam = "page"
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || key === pageParam) continue
    for (const item of Array.isArray(value) ? value : [value]) {
      params.append(key, item)
    }
  }

  params.set(pageParam, String(page))
  return `${pathname}?${params.toString()}`
}

function ListingPaginationLink({
  children,
  disabled,
  href,
  label,
  active = false,
}: {
  children: React.ReactNode
  disabled: boolean
  href: string
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      data-slot="pagination-link"
      data-active={active}
      className={cn(
        buttonVariants({
          variant: active ? "outline" : "ghost",
          size: "icon",
        }),
        disabled && "pointer-events-none opacity-35"
      )}
    >
      {children}
    </Link>
  )
}

function paginationItems(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, index) => index + 1)

  const pages = new Set<number>([1, totalPages, currentPage])
  if (currentPage > 1) pages.add(currentPage - 1)
  if (currentPage < totalPages) pages.add(currentPage + 1)

  if (currentPage <= 4) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
    pages.add(5)
  }

  if (currentPage >= totalPages - 3) {
    pages.add(totalPages - 1)
    pages.add(totalPages - 2)
    pages.add(totalPages - 3)
    pages.add(totalPages - 4)
  }

  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
  const items: PaginationItem[] = []

  for (const page of sorted) {
    const previous = items[items.length - 1]
    if (typeof previous === "number" && page - previous > 1) {
      items.push(previous === 1 ? "ellipsis-start" : "ellipsis-end")
    }
    items.push(page)
  }

  return items
}

function ListingPagination({
  pathname,
  searchParams,
  currentPage,
  totalPages,
  className,
  pageParam = "page",
  nextLabel = "Next page",
  previousLabel = "Previous page",
}: {
  pathname: string
  searchParams: PaginationSearchParams
  currentPage: number
  totalPages: number
  className?: string
  pageParam?: string
  nextLabel?: string
  previousLabel?: string
}) {
  if (totalPages <= 1) return null
  const page = Math.min(Math.max(1, currentPage), totalPages)

  return (
    <Pagination className={cn("mt-auto justify-center pt-6", className)}>
      <PaginationContent>
        <PaginationItem>
          <ListingPaginationLink
            disabled={page <= 1}
            href={pageUrl(pathname, searchParams, page - 1, pageParam)}
            label={previousLabel}
          >
            {"<"}
          </ListingPaginationLink>
        </PaginationItem>
        {paginationItems(page, totalPages).map((item) =>
          typeof item === "number" ? (
            <PaginationItem key={item}>
              <ListingPaginationLink
                active={page === item}
                disabled={false}
                href={pageUrl(pathname, searchParams, item, pageParam)}
                label={`Page ${item}`}
              >
                {item}
              </ListingPaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationEllipsis />
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <ListingPaginationLink
            disabled={page >= totalPages}
            href={pageUrl(pathname, searchParams, page + 1, pageParam)}
            label={nextLabel}
          >
            {">"}
          </ListingPaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export { ListingPagination, pageUrl }
export type { PaginationSearchParams }
