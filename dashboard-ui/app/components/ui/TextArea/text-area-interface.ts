import { TextareaHTMLAttributes} from "react";

import{ IFieldProps} from "@/ui/Field/field.interface";

type TypeInputPropsField = TextareaHTMLAttributes<HTMLTextAreaElement> & IFieldProps;

export type ITextArea = TypeInputPropsField