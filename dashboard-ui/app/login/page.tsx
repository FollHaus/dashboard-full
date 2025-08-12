'use client'
import LoginForm from '@/ui/header/login-form/LoginForm'
import { FADE_IN } from '@/utils/animations/fade'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.replace('/')
  }, [user, router])

  return (
    <motion.div
      {...FADE_IN}
      className='flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 bg-fixed'
    >
      <LoginForm inPage />
    </motion.div>
  )
}
