import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { TaskModel } from './task.model'
import { CreateTaskDto } from './dto/task.dto'
import { UpdateTaskDto } from './dto/update.task.dto'

@Injectable()
export class TaskService {
	constructor(
		@InjectModel(TaskModel) private readonly taskRepo: typeof TaskModel
	) {}

	async create(dto: CreateTaskDto): Promise<TaskModel> {
		return this.taskRepo.create({ ...dto })
	}

        async findAll(start?: string, end?: string): Promise<TaskModel[]> {
                const where: any = {}
                if (start && end) {
                        where.deadline = {
                                [Op.between]: [new Date(start), new Date(end)]
                        }
                }
                return this.taskRepo.findAll({ where })
        }

	async findOne(id: number): Promise<TaskModel> {
		const task = await this.taskRepo.findByPk(id)
                if (!task) {
                        throw new NotFoundException(`Задача с ID ${id} не найдена.`)
                }
		return task
	}

	async update(id: number, dto: UpdateTaskDto): Promise<TaskModel> {
		const task = await this.findOne(id)
		return task.update(dto)
	}

	async remove(id: number): Promise<void> {
		const task = await this.findOne(id)
		await task.destroy()
	}
}
