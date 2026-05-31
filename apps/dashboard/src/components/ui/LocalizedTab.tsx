import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import type { TabItem } from '@/components/ui/AnimatedTabs'
import { Table, TableBody, TableCell, TableRow } from '@ecommerce/ui/components/table'

type Row = {
  label: string
  value: string | null | undefined
  html?: boolean
}

export type LocalizedTab = {
  id: string
  label: string
  rows: Row[]
}

export function LocalizedTabs({
  tabs,
  defaultTabId,
  empty = '—',
  listClassName = 'flex w-full !h-12 p-1 items-center justify-center',
}: {
  tabs: LocalizedTab[]
  defaultTabId?: string
  empty?: string
  listClassName?: string
}) {
  const firstId = tabs[0]?.id
  const defaultValue = defaultTabId ?? firstId ?? 'en'

  const items: TabItem[] = tabs.map((t) => ({
    value: t.id,
    label: t.label,
    content: (
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
    ),
  }))

  return (
    <AnimatedTabs
      defaultValue={defaultValue}
      items={items}
      tabsListClassName={listClassName}
    />
  )
}
