import {
        IsDateString,
        IsEnum,
        IsNotEmpty,
        IsOptional,
        IsString
} from 'class-validator'
import { TaskStatus, TaskPriority } from '../task.model'
import { IsFutureDate } from '../../validators/is-future-date.decorator'

export class CreateTaskDto {
	@IsString()
	@IsNotEmpty()
	title: string

	@IsString()
	@IsOptional()
	description?: string

        @IsDateString()
        @IsFutureDate()
        deadline: string

        @IsEnum(TaskStatus)
        @IsOptional()
        status?: TaskStatus

        @IsEnum(TaskPriority)
        @IsOptional()
        priority?: TaskPriority

        @IsString()
        @IsOptional()
        executor?: string
}
