import { Transform } from 'class-transformer'
import { IsDateString, IsInt, IsOptional } from 'class-validator'

export class AnalyticsQueryDto {
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
}
