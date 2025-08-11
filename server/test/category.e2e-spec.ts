import { Test } from '@nestjs/testing'
import {
	INestApplication,
	ValidationPipe,
	NotFoundException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import request from 'supertest'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { CategoryModule } from '../src/category/category.module'
import { CategoryService } from '../src/category/category.service'
import { CategoryModel } from '../src/category/category.model'

describe('Category (e2e)', () => {
	let app: INestApplication
	const service = { create: jest.fn(), findOne: jest.fn() }

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [CategoryModule]
		})
			.overrideProvider(CategoryService)
			.useValue(service)
			.overrideProvider(getModelToken(CategoryModel))
			.useValue({})
			.overrideProvider(getConnectionToken())
			.useValue({})
			.overrideGuard(AuthGuard('jwt'))
			.useValue({ canActivate: () => true })
			.compile()

		app = moduleRef.createNestApplication()
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
		await app.init()
	})

	afterAll(async () => app.close())

	it('/category (POST)', async () => {
		service.create.mockResolvedValue({ id: 1, name: 'Food' })
		await request(app.getHttpServer())
			.post('/category')
			.send({ name: 'Food' })
			.expect(201)
			.expect({ id: 1, name: 'Food' })
		expect(service.create).toHaveBeenCalledWith({ name: 'Food' })
	})

	it('/category/:id (GET) 404', async () => {
		service.findOne.mockRejectedValue(new NotFoundException())
		await request(app.getHttpServer()).get('/category/1').expect(404)
	})
})
