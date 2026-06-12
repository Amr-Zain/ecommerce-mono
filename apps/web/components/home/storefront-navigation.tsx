"use client"

import { Menu02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

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

function StorefrontNavigation({ collections }: { collections: CollectionTreeItem[] }) {
  return (
    <>
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Shops</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[760px] grid-cols-4 gap-5 p-5">
                {collections.map((root) => (
                  <div key={root.id} className="space-y-2">
                    <NavigationMenuLink render={<Link href={`/collections/${root.slug}`} />} className="font-semibold">
                      {root.name}
                    </NavigationMenuLink>
                    {root.children?.map((child) => (
                      <div key={child.id} className="space-y-1">
                        <NavigationMenuLink render={<Link href={`/collections/${child.slug}`} />} className="text-xs font-medium">
                          {child.name}
                        </NavigationMenuLink>
                        {child.children?.map((leaf) => (
                          <NavigationMenuLink key={leaf.id} render={<Link href={`/collections/${leaf.slug}`} />} className="py-1 ps-4 text-xs text-muted-foreground">
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
          <Button variant="ghost" size="icon" aria-label="Menu" className="lg:hidden">
            <HugeiconsIcon icon={Menu02Icon} strokeWidth={2} />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Shop collections</DrawerTitle>
            <DrawerDescription>Browse every collection and category.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <Button render={<Link href="/collections" />} variant="outline" className="mb-3 w-full">
              View all collections
            </Button>
            <Accordion>
              {collections.map((root) => (
                <AccordionItem key={root.id} value={root.id}>
                  <AccordionTrigger>{root.name}</AccordionTrigger>
                  <AccordionContent className="space-y-2 ps-3">
                    <Link href={`/collections/${root.slug}`} className="font-semibold">View all {root.name}</Link>
                    {root.children?.map((child) => (
                      <div key={child.id} className="space-y-1">
                        <Link href={`/collections/${child.slug}`} className="block font-medium">{child.name}</Link>
                        {child.children?.map((leaf) => (
                          <Link key={leaf.id} href={`/collections/${leaf.slug}`} className="block ps-3 text-muted-foreground">
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
