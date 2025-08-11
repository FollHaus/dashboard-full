import { Test } from '@nestjs/testing'
import { getModelToken } from '@nestjs/sequelize'
import { CategoryService } from './category.service'
import { CategoryModel } from './category.model'
import { ProductModel } from '../product/product.model'
import { NotFoundException } from '@nestjs/common'

describe('CategoryService', () => {
  let service: CategoryService
  const repo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getModelToken(CategoryModel), useValue: repo }
      ]
    }).compile()
    service = module.get(CategoryService)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create category', async () => {
      const dto = { name: 'test' }
      const created = { id: 1, ...dto }
      repo.create.mockResolvedValue(created)
      await expect(service.create(dto)).resolves.toEqual(created)
      expect(repo.create).toHaveBeenCalledWith({ name: dto.name })
    })
  })

  describe('findAll', () => {
    it('should return all categories with products', async () => {
      const result = []
      repo.findAll.mockResolvedValue(result)
      expect(await service.findAll()).toBe(result)
      expect(repo.findAll).toHaveBeenCalledWith({ include: [ProductModel] })
    })
  })

  describe('findOne', () => {
    it('should return category', async () => {
      const category = { id: 1 }
      repo.findByPk.mockResolvedValue(category)
      expect(await service.findOne(1)).toBe(category)
      expect(repo.findByPk).toHaveBeenCalledWith(1, { include: [ProductModel] })
    })

    it('should throw NotFoundException', async () => {
      repo.findByPk.mockResolvedValue(null)
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update category', async () => {
      const dto = { name: 'updated' }
      const updated = { id: 1, ...dto }
      const category = { update: jest.fn().mockResolvedValue(updated) }
      repo.findByPk.mockResolvedValue(category)
      expect(await service.update(1, dto)).toBe(updated)
      expect(category.update).toHaveBeenCalledWith(dto)
    })
  })

  describe('remove', () => {
    it('should remove category', async () => {
      repo.destroy.mockResolvedValue(1)
      await expect(service.remove(1)).resolves.toBeUndefined()
      expect(repo.destroy).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should throw NotFoundException', async () => {
      repo.destroy.mockResolvedValue(0)
      await expect(service.remove(1)).rejects.toThrow(NotFoundException)
    })
  })
})
