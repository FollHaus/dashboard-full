import { renderHook } from '@testing-library/react'
import React from 'react'
import { AuthContext } from '@/providers/auth-provider/AuthProvider'
import { useAuth } from './useAuth'
import { vi } from 'vitest'

describe('useAuth', () => {
  it('returns context value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={{ user: { id: 1 } as any, setUser: vi.fn() }}>
        {children}
      </AuthContext.Provider>
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual({ id: 1 })
  })
})
