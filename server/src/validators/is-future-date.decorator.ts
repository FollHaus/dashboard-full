import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return false
          const date = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return date >= today
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} не может быть в прошлом`
        },
      },
    })
  }
}
