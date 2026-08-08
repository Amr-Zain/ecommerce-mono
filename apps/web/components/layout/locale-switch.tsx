"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@ecommerce/ui/components/dropdown-menu"
import { Button } from "@ecommerce/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

export function LocaleSwitch() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function changeLocale(next: string) {
    router.replace(pathname, { locale: next })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1 px-1.5 text-xs" />
        }
      >
        {locale === "ar" ? "العربية" : "English"}
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={locale}>
          <DropdownMenuRadioItem value="en" onClick={() => changeLocale("en")}>
            English
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ar" onClick={() => changeLocale("ar")}>
            العربية
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}