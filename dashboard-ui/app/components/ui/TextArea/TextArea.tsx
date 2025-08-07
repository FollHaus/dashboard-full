import { forwardRef } from "react";
import styles from "./text-area.module.css";
import {ITextArea} from "@/ui/TextArea/text-area-interface";


const TextArea = forwardRef<HTMLTextAreaElement, ITextArea>(
    ({ error, style, ...rest }, ref) => {
        return (
            <div className={styles['editor']}  style={style}>
                <textarea ref={ref} {...rest}/>
                {error && <div className={styles.error}>{error}</div>}
            </div>
        )
    }
)

TextArea.displayName = "TextArea";

export default TextArea;