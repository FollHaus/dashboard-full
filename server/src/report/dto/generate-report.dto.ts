import {
        IsArray,
        IsDateString,
        IsEnum,
        IsInt,
        IsOptional,
        IsString,
        ValidateNested
} from 'class-validator'
import { Type, Transform } from 'class-transformer'

export enum ReportType {
        SALES = 'sales',
        INVENTORY_BALANCES = 'inventory balances',
        TASK_EFFICIENCY = 'task efficiency'
}

export class ReportParamsDto {
        @IsOptional()
        @IsDateString()
        startDate?: string

        @IsOptional()
        @IsDateString()
        endDate?: string

        @IsOptional()
        @Transform(({ value }) => {
                if (typeof value === 'string') {
                        return value
                                .split(',')
                                .map((id) => parseInt(id, 10))
                                .filter((n) => !isNaN(n))
                }
                if (Array.isArray(value)) {
                        return value
                                .map((id) => parseInt(id, 10))
                                .filter((n) => !isNaN(n))
                }
                return undefined
        })
        @IsInt({ each: true })
        categories?: number[]

        @IsOptional()
        @Transform(({ value }) => {
                if (typeof value === 'string') {
                        return value.split(',')
                }
                if (Array.isArray(value)) {
                        return value
                }
                return undefined
        })
        @IsString({ each: true })
        @IsArray()
        metrics?: string[]
}

export class GenerateReportDto {
        @IsEnum(ReportType)
        type: ReportType

        @ValidateNested()
        @Type(() => ReportParamsDto)
        params: ReportParamsDto
}
