import { IsDateString, IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

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
}

export class GenerateReportDto {
        @IsEnum(ReportType)
        type: ReportType

        @ValidateNested()
        @Type(() => ReportParamsDto)
        params: ReportParamsDto
}
