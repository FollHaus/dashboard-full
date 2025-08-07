import {Dispatch, RefObject, useState, useEffect, SetStateAction, useRef} from "react";

type TypeOut<T extends HTMLElement> = {
    // ссылка на DOM элемент
    ref: RefObject<T | null>
    // флаг видимости
    isShow: boolean
    // функция для изменения флага видимости
    setIsShow: Dispatch<SetStateAction<boolean>>
}


export const useOutside = <T extends HTMLElement>(initialIsVisible: boolean): TypeOut<T> => {
    const [isShow, setIsShow] = useState(initialIsVisible)
    const ref = useRef<T>(null)

    const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            setIsShow(false)
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleClickOutside, true)
        return () => {
            document.removeEventListener("click", handleClickOutside, true)
        }
    }, [])

    return {ref, isShow, setIsShow}
}