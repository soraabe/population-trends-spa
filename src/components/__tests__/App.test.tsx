import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../../App'

describe('App', () => {
  it('should render application title', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: '都道府県別人口推移グラフ' }),
    ).toBeDefined()
  })

  it('should render application layout', () => {
    render(<App />)
    // ページの基本構造が存在することを確認
    expect(screen.getAllByText('読み込み中...').length).toBeGreaterThan(0)
  })
})
