'use client'

import { FC, useState } from 'react'
import { useOutside } from '@/hooks/useOutside'
import { SubmitHandler, useForm } from 'react-hook-form'
import { IAuthFields } from '@/ui/header/login-form/login-form.interface'
import { useAuth } from '@/hooks/useAuth'
import styles from './LoginForm.module.scss'
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa'
import Field from '@/ui/Field/Field'
import Button from '@/ui/Button/Button'
import { FADE_IN } from '@/utils/animations/fade'
import cn from 'classnames'

import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { AuthService } from '@/services/auth/auth.service'
import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  inPage?: boolean
}

const LoginForm: FC<Props> = ({ inPage = false }) => {
  const { ref, isShow, setIsShow } = useOutside<HTMLDivElement>(false)
  const [type, setType] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<IAuthFields>({ mode: 'onChange' })

  const { user, setUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: (data: IAuthFields) =>
      AuthService.login(data.email, data.password),
    onSuccess: data => {
      if (setUser) setUser(data.user)
      reset()
      setIsShow(false)
      router.replace(redirect)
    },
    onError: (e: any) => setError(e.message),
  })

  const registerMutation = useMutation({
    mutationKey: ['register'],
    mutationFn: (data: IAuthFields) =>
      AuthService.register(data.email, data.password),
    onSuccess: data => {
      setMessage(data.message)
      setError(null)
      reset()
    },
    onError: (e: any) => {
      setError(e.message)
      setMessage(null)
    },
  })

  const loginSync = loginMutation.mutate
  const registerSync = registerMutation.mutate

  const onSubmit: SubmitHandler<IAuthFields> = data => {
    if (type === 'login') loginSync(data)
    else if (type === 'register') registerSync(data)
  }

  const logoutHandler = () => {
    AuthService.logout()
    if (setUser) setUser(null)
    router.replace('/login')
  }

  const isVisible = inPage || isShow

  return (
    <div
      className={cn(inPage ? styles.wrapperPage : styles.wrapper)}
      ref={ref}
    >
      {!inPage && (
        <Button className={styles.button} onClick={() => setIsShow(!isShow)}>
          {user ? <FaUserCircle /> : <FaRegUserCircle />}
        </Button>
      )}

      {isVisible && (
        <motion.div {...FADE_IN}>
          {user ? (
            <Button className={'w-full'} onClick={logoutHandler}>
              Выйти
            </Button>
          ) : (
            <form
              className={cn(inPage ? styles.formPage : styles.form)}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Field
                {...register('email', {
                  required: 'Введите email',
                  pattern: {
                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                    message: 'Введите корректный email',
                  },
                })}
                placeholder="Введите email"
                error={errors.email}
              />
              <Field
                {...register('password', {
                  required: 'Введите password',
                  minLength: {
                    value: 8,
                    message: 'Минимальная длина пароля 8 символов',
                  },
                })}
                placeholder="Введите пароль"
                error={errors.password}
                type={'password'}
              />
              <div className={styles.login}>
                <Button
                  className={'w-full'}
                  type="submit"
                  onClick={() => setType('login')}
                >
                  Войти
                </Button>
              </div>
              <Button
                className={styles.register}
                type="submit"
                onClick={() => setType('register')}
              >
                Регистрация
              </Button>
              {error && <p className="text-error text-sm mt-2">{error}</p>}
              {message && <p className="text-success text-sm mt-2">{message}</p>}
            </form>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default LoginForm
