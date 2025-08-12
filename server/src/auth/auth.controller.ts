import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'
import { EmailDto } from './dto/email.dto'

/**
 * Контроллер для авторизации и регистрации пользователей.
 */
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Метод для входа (логина) пользователя.
	 * Принимает email и пароль, возвращает токен и данные пользователя.
	 */
        @HttpCode(200)
        @Post('login')
        async login(@Body() dto: AuthDto) {
                return this.authService.login(dto)
        }

	/**
	 * Метод для регистрации нового пользователя.
	 * Принимает имя, email и пароль, создаёт запись в БД и возвращает токен.
	 */
        @HttpCode(200)
        @Post('register')
        async register(@Body() dto: AuthDto) {
                return this.authService.register(dto)
        }

        @HttpCode(200)
        @Get('confirm/:token')
        async confirm(@Param('token') token: string) {
                return this.authService.confirmEmail(token)
        }

        @HttpCode(200)
        @Post('resend')
        async resend(@Body() dto: EmailDto) {
                return this.authService.resendConfirmation(dto.email)
        }
}
