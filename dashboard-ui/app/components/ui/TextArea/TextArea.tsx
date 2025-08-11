import { forwardRef } from "react";
import styles from "./TextArea.module.scss";
import {ITextArea} from "@/ui/TextArea/text-area-interface";


const TextArea = forwardRef<HTMLTextAreaElement, ITextArea>(
    ({ error, style, ...rest }, ref) => {
        return (
            <div className={styles.editor} style={style}>
                <textarea className={styles.textarea} ref={ref} {...rest} />
                {error && <div className={styles.error}>{error}</div>}
            </div>
        )
    }
)

TextArea.displayName = "TextArea";

export default TextArea;
