import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { CreateCategoryDto } from './category.dto'

describe('CreateCategoryDto', () => {
  it('should validate successfully with name', () => {
    const dto = plainToInstance(CreateCategoryDto, { name: 'Food' })
    const errors = validateSync(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation with empty name', () => {
    const dto = plainToInstance(CreateCategoryDto, { name: '' })
    const errors = validateSync(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should fail validation when name is missing', () => {
    const dto = plainToInstance(CreateCategoryDto, {})
    const errors = validateSync(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})
