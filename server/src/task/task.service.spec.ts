import { Test, TestingModule } from '@nestjs/testing'
import { TaskService } from './task.service'
import { getModelToken } from '@nestjs/sequelize'
import { TaskModel } from './task.model'
import { NotFoundException } from '@nestjs/common'
import { Op } from 'sequelize'

const mockTask = { id: 1, title: 'Test', update: jest.fn(), destroy: jest.fn() }

describe('TaskService', () => {
  let service: TaskService
  let repo: {
    create: jest.Mock
    findAll: jest.Mock
    findByPk: jest.Mock
  }

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockResolvedValue(mockTask),
      findAll: jest.fn().mockResolvedValue([mockTask]),
      findByPk: jest.fn().mockResolvedValue(mockTask)
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getModelToken(TaskModel), useValue: repo }
      ]
    }).compile()

    service = module.get<TaskService>(TaskService)
    mockTask.update.mockResolvedValue({ ...mockTask, title: 'Updated' })
  })

  it('create', async () => {
    const dto = { title: 'Test' }
    await service.create(dto as any)
    expect(repo.create).toHaveBeenCalledWith({ ...dto })
  })

  it('findAll without params', async () => {
    const res = await service.findAll()
    expect(res).toEqual([mockTask])
    expect(repo.findAll).toHaveBeenCalledWith({ where: {} })
  })

  it('findAll with range', async () => {
    await service.findAll('2024-01-01', '2024-01-07')
    expect(repo.findAll).toHaveBeenCalledWith({
      where: { deadline: { [Op.between]: [new Date('2024-01-01'), new Date('2024-01-07')] } }
    })
  })

  it('findOne success', async () => {
    const res = await service.findOne(1)
    expect(res).toBe(mockTask)
  })

  it('findOne not found', async () => {
    repo.findByPk.mockResolvedValue(null)
    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException)
  })

  it('update', async () => {
    const dto = { title: 'New' }
    const res = await service.update(1, dto as any)
    expect(repo.findByPk).toHaveBeenCalledWith(1)
    expect(mockTask.update).toHaveBeenCalledWith(dto)
    expect(res).toEqual({ ...mockTask, title: 'Updated' })
  })

  it('remove', async () => {
    await service.remove(1)
    expect(repo.findByPk).toHaveBeenCalledWith(1)
    expect(mockTask.destroy).toHaveBeenCalled()
  })
})

