import { describe, expect, it } from 'vitest'

import { searchParamsValidate } from './general'

describe('searchParamsValidate', () => {
  it('keeps pagination values used by list API requests', () => {
    expect(
      searchParamsValidate({
        page: 3,
        limit: 50,
        search: 'shoes',
      }),
    ).toEqual({
      page: '3',
      limit: '50',
      search: 'shoes',
    })
  })

  it('removes missing pagination values and unknown parameters', () => {
    expect(
      searchParamsValidate({
        page: undefined,
        limit: null,
        ignored: 'value',
      }),
    ).toEqual({})
  })
})
