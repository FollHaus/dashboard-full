import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class AuthDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsEmail()
	email: string

        @MinLength(8, {
                message: 'Минимальная длина пароля — 8 символов.'
        })
	@IsString()
	password: string
}
