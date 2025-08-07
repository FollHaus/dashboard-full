'use client'

import { FC, useState } from 'react'
import { useOutside } from '@/hooks/useOutside'
import { SubmitHandler, useForm } from 'react-hook-form'
import { IAuthFields } from '@/ui/header/login-form/login-form.interface'
import { useAuth } from '@/hooks/useAuth'
import styles from './LoginForm.module.scss'
import { FaRegUserCircle } from 'react-icons/fa'
import Field from '@/ui/Field/Field'
import Button from '@/ui/Button/Button'
import { FADE_IN } from '@/utils/animations/fade'

import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { AuthService } from '@/services/auth/auth.service'

const LoginForm: FC = () => {
  const { ref, isShow, setIsShow } = useOutside<HTMLDivElement>(false)
  const [type, setType] = useState<'login' | 'register'>('login')

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<IAuthFields>({ mode: 'onChange' })

  const { user, setUser } = useAuth()

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: (data: IAuthFields) =>
      AuthService.login(data.email, data.password),
    onSuccess: data => {
      if (setUser) setUser(data.user)
      reset()
      setIsShow(false)
    },
  })

  const registerMutation = useMutation({
    mutationKey: ['register'],
    mutationFn: (data: IAuthFields) =>
      AuthService.register(data.email, data.password),
    onSuccess: data => {
      if (setUser) setUser(data.user)
      reset()
      setIsShow(false)
    },
  })

  const loginSync = loginMutation.mutate
  const registerSync = registerMutation.mutate

  const onSubmit: SubmitHandler<IAuthFields> = data => {
    if (type === 'login') loginSync(data)
    else if (type === 'register') registerSync(data)
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <Button className={styles.button} onClick={() => setIsShow(!isShow)}>
        <FaRegUserCircle />
      </Button>

      {isShow && (
        <motion.div {...FADE_IN}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
          </form>
        </motion.div>
      )}
    </div>
  )
}

export default LoginForm
