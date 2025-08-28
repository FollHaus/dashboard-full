'use client'
import { FC } from 'react'
import Logo from '@/ui/header/Logo'
import LoginForm from '@/ui/header/login-form/LoginForm'
import styles from './Header.module.scss'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

const Header: FC = () => {
  const { user } = useAuth()

  return (
    <header className={styles.header}>
      <Logo />
      {user && (
        <>
          <Link href='/' className={styles.link}>
            Главная
          </Link>
          <Link href='/products' className={styles.link}>
            Склад
          </Link>
          <Link href='/tasks' className={styles.link}>
            Задачи
          </Link>
          <Link href='/reports/new' className={styles.link}>
            Отчёты
          </Link>
        </>
      )}
      <LoginForm />
    </header>
  )
}

export default Header
