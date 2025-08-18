import { forwardRef } from 'react'
import cn from 'classnames'

import styles from './Field.module.scss'
import { IField } from '@/ui/Field/field.interface'


const Field = forwardRef<HTMLInputElement, IField>(
  (
    { error, label, type = 'text', style, id, className, ...rest },
    ref,
  ) => {
    return (
      <div className={styles.field} style={style}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(styles.input, className, {
            [styles.inputError]: error,
          })}
          ref={ref}
          type={type}
          {...rest}
        />
        {error && <div className={styles.error}>{error.message}</div>}
      </div>
    )
  },
)


Field.displayName = "Field"


export default Field
