import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'

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

}
