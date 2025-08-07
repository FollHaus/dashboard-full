import {IUser} from "@/shared/interfaces/user.interface";
import {Dispatch, SetStateAction} from "react";

// Хранит состояние пользователя
export type TypeUserState = IUser | null

export interface IContext {
    // Состояние пользователя
    user: TypeUserState
    // Функция для изменения состояния
    setUser: Dispatch<SetStateAction<TypeUserState>>
}

/*
Dispatch<SetStateAction<T>> :
Это тип, который React предоставляет для описания функции, изменяющей состояние, как в useState.
*/