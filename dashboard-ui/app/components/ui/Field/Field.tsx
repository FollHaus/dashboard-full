import {forwardRef} from "react"

import styles from "./Field.module.scss"
import {IField} from "@/ui/Field/field.interface";


const Field = forwardRef<HTMLInputElement, IField>(
    ({error, type = 'text', style, ...rest}, ref) => {
        return (
            <div className={styles.field} style={style}>
                <input className={styles.input} ref={ref} type={type} {...rest} />
                {error && <div className={styles.error}>{error.message}</div>}
            </div>
        )
    }
)


Field.displayName = "Field"


export default Field