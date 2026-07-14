import { describe, expect, it } from 'vitest'

import {
  getPaginationLimit,
  getPaginationPage,
  getPaginationPageCount,
} from './pagination'

describe('pagination metadata normalization', () => {
  it('uses page and limit metadata returned by offset-style list APIs', () => {
    const meta = { page: 3, limit: 50, total: 126, total_pages: 3 }

    expect(getPaginationPage(meta)).toBe(3)
    expect(getPaginationLimit(meta, 10)).toBe(50)
    expect(getPaginationPageCount(meta, 10)).toBe(3)
  })

  it('supports Laravel current_page and per_page metadata', () => {
    const meta = { current_page: 2, per_page: 20, total: 81, last_page: 5 }

    expect(getPaginationPage(meta)).toBe(2)
    expect(getPaginationLimit(meta, 10)).toBe(20)
    expect(getPaginationPageCount(meta, 10)).toBe(5)
  })

  it('prefers the canonical limit and derives a page count when needed', () => {
    const meta = { page: 1, limit: 25, per_page: 10, total: 51 }

    expect(getPaginationLimit(meta, 10)).toBe(25)
    expect(getPaginationPageCount(meta, 10)).toBe(3)
  })
})
