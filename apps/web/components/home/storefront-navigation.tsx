"use client"

import { Menu02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ecommerce/ui/components/accordion"
import { Button } from "@ecommerce/ui/components/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@ecommerce/ui/components/drawer"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@ecommerce/ui/components/navigation-menu"
import type { CollectionTreeItem } from "@/hooks/api/use-products"

function StorefrontNavigation({
  collections,
}: {
  collections: CollectionTreeItem[]
}) {
  return (
    <>
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Collections</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[760px] grid-cols-4 gap-5 p-5">
                {collections.map((root) => (
                  <div key={root.id} className="space-y-2">
                    <NavigationMenuLink
                      render={
                        <Link href={ROUTES.collections.bySlug(root.slug)} />
                      }
                      className="font-semibold"
                    >
                      {root.image ? (
                        <Image
                          src={root.image}
                          alt=""
                          width={32}
                          height={32}
                          className="size-8 rounded-md object-cover"
                        />
                      ) : null}
                      {root.name}
                    </NavigationMenuLink>
                    {root.children?.map((child) => (
                      <div key={child.id} className="space-y-1">
                        <NavigationMenuLink
                          render={
                            <Link
                              href={ROUTES.collections.bySlug(child.slug)}
                            />
                          }
                          className="text-xs font-medium"
                        >
                          {child.image ? (
                            <Image
                              src={child.image}
                              alt=""
                              width={24}
                              height={24}
                              className="size-6 rounded object-cover"
                            />
                          ) : null}
                          {child.name}
                        </NavigationMenuLink>
                        {child.children?.map((leaf) => (
                          <NavigationMenuLink
                            key={leaf.id}
                            render={
                              <Link
                                href={ROUTES.collections.bySlug(leaf.slug)}
                              />
                            }
                            className="py-1 ps-4 text-xs text-muted-foreground"
                          >
                            {leaf.image ? (
                              <Image
                                src={leaf.image}
                                alt=""
                                width={20}
                                height={20}
                                className="size-5 rounded object-cover"
                              />
                            ) : null}
                            {leaf.name}
                          </NavigationMenuLink>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menu"
            className="lg:hidden"
          >
            <HugeiconsIcon icon={Menu02Icon} strokeWidth={2} />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Shop collections</DrawerTitle>
            <DrawerDescription>
              Browse every collection and category.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <Button
              render={<Link href={ROUTES.collections.root} />}
              variant="outline"
              className="mb-3 w-full"
            >
              View all collections
            </Button>
            <Accordion>
              {collections.map((root) => (
                <AccordionItem key={root.id} value={root.id}>
                  <AccordionTrigger>{root.name}</AccordionTrigger>
                  <AccordionContent className="space-y-2 ps-3">
                    <Link
                      href={ROUTES.collections.bySlug(root.slug)}
                      className="font-semibold"
                    >
                      View all {root.name}
                    </Link>
                    {root.children?.map((child) => (
                      <div key={child.id} className="space-y-1">
                        <Link
                          href={ROUTES.collections.bySlug(child.slug)}
                          className="block font-medium"
                        >
                          {child.name}
                        </Link>
                        {child.children?.map((leaf) => (
                          <Link
                            key={leaf.id}
                            href={ROUTES.collections.bySlug(leaf.slug)}
                            className="block ps-3 text-muted-foreground"
                          >
                            {leaf.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export { StorefrontNavigation }
