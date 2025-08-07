import cn from 'classnames'
import {FC, PropsWithChildren} from 'react'


import {IButton} from "@/ui/Button/button.interface";

import styles from './Button.module.scss'


const Button: FC<PropsWithChildren<IButton>> =
    ({children, className, ...props}
    ) => {
        return (
            <button className={cn(styles.button, className)} {...props}>
                {children}
            </button>
        )
    }

export default Button

/*
* cn - утилита для удобного объединения классов (из библиотеки 'classnames')

    className формируется с помощью cn():
        styles.button - класс из CSS-модуля
        className - переданные извне классы
    {...props} - распаковывает все остальные пропсы в кнопку
    {children} - отображает содержимое кнопки
*
*/