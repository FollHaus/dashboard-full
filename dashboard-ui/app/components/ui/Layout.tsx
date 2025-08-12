'use client'
import { FC, PropsWithChildren } from 'react'
import Header from './header/Header'
import ProtectedRoute from '@/providers/auth-provider/ProtectedRoute'
import { motion } from 'framer-motion'
import { FADE_IN } from '@/utils/animations/fade'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ProtectedRoute>
      <motion.div {...FADE_IN}>
        <Header />
        <main className='p-4'>{children}</main>
      </motion.div>
    </ProtectedRoute>
  )
}

export default Layout
