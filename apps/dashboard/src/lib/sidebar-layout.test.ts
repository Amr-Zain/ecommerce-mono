import { describe, expect, it } from 'vitest'

import { shouldReverseSidebarLayout } from './sidebar-layout'

describe('shouldReverseSidebarLayout', () => {
  it.each([
    { side: 'left', direction: 'ltr', expected: false },
    { side: 'right', direction: 'ltr', expected: true },
    { side: 'left', direction: 'rtl', expected: true },
    { side: 'right', direction: 'rtl', expected: false },
  ] as const)(
    'keeps a $side sidebar on its physical side in $direction',
    ({ side, direction, expected }) => {
      expect(shouldReverseSidebarLayout(side, direction)).toBe(expected)
    },
  )
})
