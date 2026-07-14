import type { SidebarSide } from '@/types/dashboard-preferences'

export type LayoutDirection = 'ltr' | 'rtl'

/**
 * The sidebar stays before the inset in the DOM so peer-based shell styles work.
 * Reverse only the visual flex flow needed to keep the configured side physical.
 */
export function shouldReverseSidebarLayout(
  side: SidebarSide,
  direction: LayoutDirection,
): boolean {
  return (side === 'right') !== (direction === 'rtl')
}
