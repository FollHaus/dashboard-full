'use client'
import { FC, PropsWithChildren, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePathname, useRouter } from 'next/navigation'

const ProtectedRoute: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) {
      router.replace(`/login?redirect=${pathname}`)
    }
  }, [user, pathname, router])

  if (!user) return null

  return <>{children}</>
}

export default ProtectedRoute
