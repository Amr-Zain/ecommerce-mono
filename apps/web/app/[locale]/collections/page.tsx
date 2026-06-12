import Link from "next/link"

import { Button } from "@ecommerce/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import type { CollectionTreeItem } from "@/hooks/api/use-products"
import { backendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"

export default async function CollectionsPage() {
  const response = await backendGet<{ data: CollectionTreeItem[] }>("/client/collections/tree", {
    revalidate: 60,
    tags: [cacheTags.categories],
    retries: 0,
  })

  return (
    <div className="space-y-10 py-8">
      <div>
        <h1 className="text-3xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground">Browse the complete collection hierarchy.</p>
      </div>
      {response.data.map((root) => (
        <section key={root.id} className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Link href={`/collections/${root.slug}`} className="text-xl font-semibold hover:underline">{root.name}</Link>
              {root.description ? <p className="text-sm text-muted-foreground">{root.description}</p> : null}
            </div>
            <Button render={<Link href={`/collections/${root.slug}`} />} variant="outline">
              View all ({root._count?.products ?? 0})
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(root.children ?? []).map((child) => (
              <Card key={child.id}>
                <CardHeader>
                  <CardTitle><Link href={`/collections/${child.slug}`} className="hover:underline">{child.name}</Link></CardTitle>
                  <CardDescription>{child._count?.products ?? 0} products</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {child.children?.map((leaf) => (
                    <Button key={leaf.id} render={<Link href={`/collections/${leaf.slug}`} />} variant="ghost" className="justify-between">
                      <span>{leaf.name}</span><span className="text-muted-foreground">{leaf._count?.products ?? 0}</span>
                    </Button>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button render={<Link href={`/collections/${child.slug}`} />} variant="link">View {child.name}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
