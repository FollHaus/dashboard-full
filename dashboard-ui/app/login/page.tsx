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
      className='flex h-screen items-center justify-center'
    >
      <LoginForm inPage />
    </motion.div>
  )
}
