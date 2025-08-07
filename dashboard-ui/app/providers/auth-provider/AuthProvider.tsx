'use client'
import {
  createContext,
  FC,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react'
import { IContext, TypeUserState } from './auth.interface'
import Cookies from 'js-cookie'
import { AuthService } from '@/services/auth/auth.service'
import { usePathname } from 'next/navigation'

export const AuthContext = createContext({} as IContext)

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<TypeUserState>(null)

  const pathname = usePathname()

  useEffect(() => {
    const accessToken = Cookies.get('accessToken')
    if (accessToken) {
      const userString = localStorage.getItem('user')
      if (userString) {
        setUser(JSON.parse(userString))
      }
    }
  }, [])

  useEffect(() => {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken && !user) {
      AuthService.logout()
      setUser(null)
    }
  }, [pathname, user])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
