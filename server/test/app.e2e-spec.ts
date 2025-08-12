import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule, PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import request from 'supertest'
import { AppController } from '../src/app.controller'
import { AppService } from '../src/app.service'

class TestJWTStrategy extends PassportStrategy(Strategy) {
        constructor() {
                super({
                        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                        secretOrKey: 'test'
                })
        }

        async validate(payload: any) {
                return payload
        }
}

describe('AppController (e2e)', () => {
        let app: INestApplication

        beforeAll(async () => {
                const moduleFixture: TestingModule = await Test.createTestingModule({
                        imports: [
                                PassportModule.register({ defaultStrategy: 'jwt' }),
                                JwtModule.register({ secret: 'test' })
                        ],
                        controllers: [AppController],
                        providers: [AppService, TestJWTStrategy]
                }).compile()

                app = moduleFixture.createNestApplication()
                await app.init()
        })

        it('GET / returns 200', () => {
                return request(app.getHttpServer()).get('/').expect(200)
        })
})

