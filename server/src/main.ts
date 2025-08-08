import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
	console.log('> BOOTSTRAP: старт')
	const app = await NestFactory.create(AppModule)
        console.log('> BOOTSTRAP: создан app')

        // Разрешаем запросы с фронтенда.
        // URL фронта задаётся через переменную окружения CLIENT_URL,
        // что позволяет легко менять адрес, не перекомпилируя приложение.
        const config = app.get(ConfigService)
        const clientUrl = config.get<string>('CLIENT_URL', 'http://localhost:3000')

        // Настройка CORS, чтобы фронтенд мог обращаться к бекенду без ошибок.
        // credentials:true позволяет отправлять cookie (например, JWT токен).
        app.enableCors({
                origin: clientUrl,
                credentials: true
        })
        console.log(`> BOOTSTRAP: CORS configured for ${clientUrl}`)

        // Устанавливаем глобальный префикс для всех маршрутов
        app.setGlobalPrefix('api')

        app.useGlobalPipes(
                new ValidationPipe({
                        whitelist: true, // убирает лишние поля
                        forbidNonWhitelisted: true, // бросает ошибку при лишних полях
                        transform: true // автоматически приводит типы
                })
	)
	console.log('> BOOTSTRAP: перед listen')
	await app.listen(4000)
	console.log('> BOOTSTRAP: после listen')
}

bootstrap()
