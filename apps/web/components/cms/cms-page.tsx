import { notFound } from "next/navigation"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import { AspectRatio } from "@ecommerce/ui/components/aspect-ratio"
import { Separator } from "@ecommerce/ui/components/separator"

import { getCmsPage } from "@/lib/server/cms-pages"

type CmsPageProps = {
  locale: string
  slug: string
}

function HtmlBlock({ html, className }: { html?: string | null; className?: string }) {
  if (!html) return null

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function imageSrc(image?: { path?: string | null; url?: string | null } | null) {
  return image?.path ?? image?.url ?? null
}

export async function CmsPageView({ locale, slug }: CmsPageProps) {
  const page = await getCmsPage(slug, locale)

  if (!page) {
    notFound()
  }

  const sections = [...(page.sections ?? [])].sort(
    (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  )
  const pageImage = imageSrc(page.image)

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {page.title}
        </h1>
        <HtmlBlock
          html={page.content}
          className="text-base leading-8 text-muted-foreground"
        />
      </header>

      {pageImage && (
        <AspectRatio ratio={16 / 7} className="overflow-hidden rounded-lg bg-muted ring-1 ring-border">
          <Image
            src={pageImage}
            alt={page.title ?? page.slug}
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
            priority
          />
        </AspectRatio>
      )}

      {sections.length > 0 && (
        <div className="space-y-5">
          <Separator />
          {sections.map((section) => (
            <Card key={section.id} className="rounded-lg py-0 shadow-none">
              <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="py-5">
                  {section.title && (
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                  )}
                  <CardContent>
                    <HtmlBlock
                      html={section.content}
                      className="text-sm leading-7 text-muted-foreground"
                    />
                  </CardContent>
                </div>
                {imageSrc(section.image) && (
                  <AspectRatio ratio={4 / 3} className="h-full min-h-56 overflow-hidden bg-muted md:min-h-full">
                    <Image
                      src={imageSrc(section.image) ?? ""}
                      alt={section.title ?? page.title ?? page.slug}
                      fill
                      sizes="(min-width: 768px) 260px, 100vw"
                      className="object-cover"
                    />
                  </AspectRatio>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
