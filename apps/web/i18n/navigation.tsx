import { createNavigation } from "next-intl/navigation"
import type { ComponentProps } from "react"

import { routing } from "./routing"

const { Link: I18nLink, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)

type LinkProps = ComponentProps<typeof I18nLink>

function Link({ prefetch = false, ...props }: LinkProps) {
  return <I18nLink prefetch={prefetch} {...props} />
}

export { Link, redirect, usePathname, useRouter, getPathname }
