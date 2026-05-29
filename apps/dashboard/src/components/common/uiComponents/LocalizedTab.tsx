// components/common/LocalizedTabs.tsx
import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ecommerce/ui/components/tabs'
import { Table, TableBody, TableCell, TableRow } from '@ecommerce/ui/components/table'

type Row = {
  label: string
  value: string | null | undefined
  /** render this row as HTML (uses dangerouslySetInnerHTML) */
  html?: boolean
}

export type LocalizedTab = {
  /** unique id for the tab (e.g., 'en', 'ar') */
  id: string
  /** visible label for the tab (e.g., 'English', 'العربية') */
  label: string
  /** rows to render inside this tab */
  rows: Row[]
}

export function LocalizedTabs({
  tabs,
  defaultTabId,
  empty = '—',
  listClassName = 'grid w-full grid-cols-2',
}: {
  tabs: LocalizedTab[]
  defaultTabId?: string
  /** placeholder when value is nullish */
  empty?: string
  /** override TabsList class if needed */
  listClassName?: string
}) {
  const firstId = tabs[0]?.id
  const defaultValue = defaultTabId ?? firstId ?? 'en'

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className={listClassName}>
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((t) => (
        <TabsContent key={t.id} value={t.id} className="mt-4">
          <Table>
            <TableBody>
              {t.rows.map((r, i) => (
                <TableRow key={`${t.id}-${i}-${r.label}`}>
                  <TableCell className="w-56 text-muted-foreground">
                    {r.label}
                  </TableCell>

                  {r.html ? (
                    <TableCell
                      className="font-medium prose max-w-none"
                      // ensure content is sanitized upstream if user-generated
                      dangerouslySetInnerHTML={{
                        __html: r.value || empty,
                      }}
                    />
                  ) : (
                    <TableCell className="font-medium">
                      {r.value ?? empty}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      ))}
    </Tabs>
  )
}
