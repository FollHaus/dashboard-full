import {FieldError} from "react-hook-form";
import {InputHTMLAttributes} from "react";


export interface IFieldProps {
    error?: FieldError | undefined
    label?: string
}

type TypeInputPropsField = InputHTMLAttributes<HTMLInputElement> & IFieldProps


export type IField = TypeInputPropsField