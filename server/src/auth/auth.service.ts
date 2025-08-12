import {
        BadRequestException,
        Injectable,
        UnauthorizedException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { UserModel } from './user.model'
import { JwtService } from '@nestjs/jwt'
import { AuthDto } from './dto/auth.dto'
import { compare, genSalt, hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import * as nodemailer from 'nodemailer'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(UserModel)
		private readonly userModel: typeof UserModel,
		private readonly jwtService: JwtService
	) {}

	/**
	 * Авторизация пользователя.
	 * Проверяет данные, возвращает пользователя и токен доступа.
	 */
        async login(dto: AuthDto) {
                const user = await this.validateUser(dto)

                return {
                        user: this.returnUserFields(user),
                        accessToken: await this.issueAccessToken(user.id)
                }
        }

	/**
	 * Регистрация нового пользователя.
	 * Создаёт запись в БД и возвращает пользователя и токен.
	 */
        async register(dto: AuthDto) {
                const oldUser = await this.userModel.findOne({
                        where: { email: dto.email }
                })

                if (oldUser)
                        throw new BadRequestException(
                                'Пользователь с таким email уже существует'
                        )

                const salt = await genSalt(10)
                const token = randomUUID()

                await this.userModel.create({
                        email: dto.email,
                        name: dto.name ? dto.name : '',
                        password: await hash(dto.password, salt),
                        isConfirmed: false,
                        confirmationToken: token,
                        confirmationTokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000)
                })

                await this.sendConfirmationEmail(dto.email, token)

                return { message: 'Письмо для подтверждения отправлено' }
        }

        async confirmEmail(token: string) {
                const user = await this.userModel.findOne({
                        where: { confirmationToken: token }
                })

                if (!user || !user.confirmationTokenExpires || user.confirmationTokenExpires < new Date()) {
                        throw new BadRequestException('Токен недействителен или просрочен')
                }

                user.isConfirmed = true
                user.confirmationToken = null
                user.confirmationTokenExpires = null
                await user.save()

                return { message: 'Email подтверждён' }
        }

        async resendConfirmation(email: string) {
                const user = await this.userModel.findOne({ where: { email } })

                if (!user) throw new BadRequestException('Пользователь не найден')
                if (user.isConfirmed) throw new BadRequestException('Email уже подтверждён')

                const token = randomUUID()
                user.confirmationToken = token
                user.confirmationTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)
                await user.save()

                await this.sendConfirmationEmail(email, token)

                return { message: 'Письмо отправлено повторно' }
        }

	/**
	 * Проверяет существование пользователя и корректность пароля.
	 * Возвращает пользователя при успешной проверке.
	 */
        async validateUser(dto: AuthDto) {
                const user = await this.userModel.findOne({
                        where: { email: dto.email },
                        attributes: ['id', 'email', 'password', 'name', 'isConfirmed']
                })

                if (!user) throw new UnauthorizedException('Пользователь не найден')

                const isValidPassword = await compare(dto.password, user.get().password)

                if (!isValidPassword)
                        throw new UnauthorizedException('Некорректные email или пароль')

                if (!user.isConfirmed)
                        throw new UnauthorizedException('Email не подтверждён')

                return user
        }

	/**
	 * Генерирует JWT-токен для указанного пользователя.
	 */
	async issueAccessToken(userId: string) {
		const data = { id: userId }

		return await this.jwtService.signAsync(data, {
			expiresIn: '31d'
		})
	}

	/**
	 * Возвращает только нужные поля пользователя (без пароля).
	 */
        returnUserFields(user: UserModel) {
                const userData = user.get({ plain: true })
                return {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email
                }
        }

private async sendConfirmationEmail(email: string, token: string) {
if (
!process.env.MAIL_HOST ||
!process.env.MAIL_USER ||
!process.env.MAIL_PASSWORD
) {
console.warn(
'Mail service is not configured. Skipping confirmation email.'
)
return
}

const transporter = nodemailer.createTransport({
host: process.env.MAIL_HOST,
port: Number(process.env.MAIL_PORT) || 587,
secure: false,
auth: {
user: process.env.MAIL_USER,
pass: process.env.MAIL_PASSWORD
}
})

const confirmUrl = `${
process.env.SERVER_URL || 'http://localhost:4000'
}/auth/confirm/${token}`

try {
await transporter.sendMail({
to: email,
from: process.env.MAIL_FROM,
subject: 'Подтверждение регистрации',
html: `<a href="${confirmUrl}">Подтвердить email</a>`
})
} catch (err) {
console.error('Failed to send confirmation email', err)
}
}
}
