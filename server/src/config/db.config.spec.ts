import { getSequelizeConfig } from './db.config'

const makeConfigService = (values: Record<string, any>) => ({
  get: jest.fn((key: string, def?: any) =>
    key in values ? values[key] : def
  ),
}) as any

describe('getSequelizeConfig', () => {
  it('returns config when env vars set', () => {
    const configService = makeConfigService({
      DB_HOST: 'localhost',
      DB_PORT: 5433,
      DB_DATABASE: 'db',
      DB_USERNAME: 'user',
      DB_PASSWORD: 'pass',
      NODE_ENV: 'development',
    })

    const cfg = getSequelizeConfig(configService)
    expect(cfg).toMatchObject({
      host: 'localhost',
      port: 5433,
      database: 'db',
      username: 'user',
      password: 'pass',
      synchronize: true,
    })
  })

  it('throws when required vars missing', () => {
    const configService = makeConfigService({})
    expect(() => getSequelizeConfig(configService)).toThrow(
      /DB_DATABASE, DB_USERNAME или DB_PASSWORD/
    )
  })
})
