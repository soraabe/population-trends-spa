import { describe, it, expect } from 'vitest'
import { toYearlySeries } from './transform'
import type { PopulationResponse } from '../types/api'

const mock: PopulationResponse = {
  boundaryYear: 2020,
  data: [
    {
      label: '総人口',
      data: [
        { year: 1980, value: 100 },
        { year: 1990, value: 120 },
      ],
    },
    { label: '年少人口', data: [] },
  ],
}

describe('toYearlySeries', () => {
  it('指定ラベルの {year,value} 配列を返す', () => {
    expect(toYearlySeries(mock, '総人口')).toEqual([
      { year: 1980, value: 100 },
      { year: 1990, value: 120 },
    ])
  })

  it('存在しないラベルは空配列', () => {
    expect(toYearlySeries(mock, '老年人口')).toEqual([])
  })
})
