"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ecommerce/ui/components/breadcrumb"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ecommerce/ui/components/command"
import { Motion } from "@ecommerce/ui/components/motion"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ecommerce/ui/components/popover"
import { Button } from "@ecommerce/ui/components/button"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import {
  useProductNavigation,
  type ProductNavigation,
} from "@/hooks/api/use-products"

function NavigationCombobox({
  label,
  value,
  options,
  onValueChange,
  onInputValueChange,
}: {
  label: string
  value: string
  options: Array<{ id: string; name: string }>
  onValueChange: (value: string) => void
  onInputValueChange?: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const current = options.find((option) => option.id === value)
  const hasAlternativeOptions = options.some((option) => option.id !== value)

  if (!hasAlternativeOptions) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            title={current?.name ?? label}
            className="shrink-0 rounded-full"
          />
        }
      >
        <HugeiconsIcon icon={ArrowDown01Icon} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(30rem,calc(100vw-2rem))] p-1"
      >
        <Command>
          <CommandInput
            placeholder={label}
            aria-label={label}
            onValueChange={(next) => onInputValueChange?.(next)}
          />
          <CommandList>
            <CommandEmpty>{label}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={option.name}
                data-checked={option.id === value}
                onSelect={() => {
                  onValueChange(option.id)
                  setOpen(false)
                }}
              >
                {option.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function ProductBreadcrumbs({
  productId,
  productName,
  navigation,
}: {
  productId: string
  productName: string
  navigation: ProductNavigation
}) {
  const t = useTranslations("Product")
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const deferredSearch = React.useDeferredValue(search)
  const navigationQuery = useProductNavigation(productId, deferredSearch)
  const liveNavigation = navigationQuery.data?.data ?? navigation
  const productOptions = liveNavigation.products.some(
    (item) => item.id === productId
  )
    ? liveNavigation.products
    : [
        {
          id: productId,
          name: productName,
          image: null,
          price: 0,
          available: true,
        },
        ...liveNavigation.products,
      ]

  return (
    <Motion preset="page-header" className="mb-6">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap overflow-x-auto py-1">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.home} />}>
              {t("home")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.collections.root} />}>
              {t("collections")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {liveNavigation.categories.map((category) => (
            <React.Fragment key={category.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-40 truncate">
                  {category.name}
                </BreadcrumbPage>
                <NavigationCombobox
                  label={t("selectCategory")}
                  value={category.id}
                  options={category.options}
                  onValueChange={(id) => {
                    const option = category.options.find(
                      (item) => item.id === id
                    )
                    if (option)
                      router.push(ROUTES.collections.bySlug(option.slug))
                  }}
                />
              </BreadcrumbItem>
            </React.Fragment>
          ))}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-48 truncate font-medium">
              {productName}
            </BreadcrumbPage>
            <NavigationCombobox
              label={t("selectProduct")}
              value={productId}
              options={productOptions}
              onValueChange={(id) =>
                id !== productId && router.push(ROUTES.products.detail(id))
              }
              onInputValueChange={setSearch}
            />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Motion>
  )
}

export { NavigationCombobox, ProductBreadcrumbs }
