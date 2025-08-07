import {MotionProps} from "framer-motion";


export const FADE_IN: MotionProps = {
    initial: {opacity: 0},
    whileInView: {opacity: 1},
    viewport: {once: true},
    transition: {duration: 0.6}
}