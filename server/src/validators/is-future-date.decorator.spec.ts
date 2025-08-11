import { validate } from 'class-validator'
import { IsFutureDate } from './is-future-date.decorator'

class TestDto {
  @IsFutureDate()
  date!: string
}

describe('IsFutureDate', () => {
  it('accepts today or future date', async () => {
    const dto = new TestDto()
    dto.date = new Date().toISOString()
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('rejects past date', async () => {
    const dto = new TestDto()
    dto.date = new Date(Date.now() - 86400000).toISOString()
    const errors = await validate(dto)
    expect(errors[0].constraints?.IsFutureDate).toBe('date не может быть в прошлом')
  })

  it('rejects missing value', async () => {
    const dto = new TestDto()
    const errors = await validate(dto)
    expect(errors[0].constraints?.IsFutureDate).toBe('date не может быть в прошлом')
  })
})
