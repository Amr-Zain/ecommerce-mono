import { type ReactNode, type ComponentType, useId, useState } from 'react'
import { Tabs, TabsList } from '@ecommerce/ui/components/tabs'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TabItem {
  value: string
  label?: ReactNode
  trigger?: ReactNode
  content?: ReactNode
  icon?: ComponentType<{ className?: string }>
  className?: string
}

interface AnimatedTabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  tabsListClassName?: string
  contentClassName?: string
  renderTabsList?: (items: TabItem[], activeValue: string | undefined, onChange: (value: string) => void) => ReactNode
  orientation?: 'horizontal' | 'vertical'
}

export function AnimatedTabs({
  items,
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  tabsListClassName,
  contentClassName,
  renderTabsList,
  orientation,
}: AnimatedTabsProps) {
  const groupId = useId()
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState(
    () => defaultValue ?? items[0]?.value ?? ''
  )
  const activeValue = isControlled ? controlledValue : internalValue

  const handleChange = (val: string) => {
    if (!isControlled) {
      setInternalValue(val)
    }
    onValueChange?.(val)
  }

  const defaultTabsList = (
    <LayoutGroup id={groupId}>
      <TabsList className={cn(orientation !== 'vertical' && '!h-12', tabsListClassName)}>
        {items.map((tab) => (
          <TabsPrimitive.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              'relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-1.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors hover:text-foreground data-active:text-foreground [&_svg]:size-4',
              tab.className,
            )}
            render={(tabProps: any) => {
              const isActive = tab.value === activeValue
              return (
                <button {...tabProps} className={cn(tabProps.className, 'relative')}>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 bg-background rounded-md shadow-sm z-0"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5 w-full">
                    {tab.trigger ?? (
                      <>
                        {tab.icon && <tab.icon className="h-4 w-4" />}
                        {tab.label && <span>{tab.label}</span>}
                      </>
                    )}
                  </span>
                </button>
              )
            }}
          />
        ))}
      </TabsList>
    </LayoutGroup>
  )

  const hasContent = items.some((tab) => tab.content)

  return (
    <Tabs value={activeValue} onValueChange={handleChange} className={className} orientation={orientation}>
      {renderTabsList ? renderTabsList(items, activeValue, handleChange) : defaultTabsList}

      {hasContent && (
        <AnimatePresence mode="wait">
          {items.map((tab) =>
            tab.value === activeValue && tab.content ? (
              <motion.div
                key={tab.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={contentClassName}
              >
                {tab.content}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      )}
    </Tabs>
  )
}
