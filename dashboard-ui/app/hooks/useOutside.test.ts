import { renderHook, act } from '@testing-library/react'
import { useOutside } from './useOutside'

describe('useOutside', () => {
  it('toggles visibility when clicking outside', () => {
    const { result } = renderHook(() => useOutside<HTMLDivElement>(true))
    const div = document.createElement('div')
    result.current.ref.current = div
    document.body.appendChild(div)

    act(() => {
      div.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(result.current.isShow).toBe(true)

    act(() => {
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(result.current.isShow).toBe(false)
  })
})
