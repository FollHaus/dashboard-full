import { Transform } from 'class-transformer'
import { IsInt, IsOptional } from 'class-validator'

export class LowStockQueryDto {
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
        @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : undefined))
        @IsInt()
        threshold = 10
}
