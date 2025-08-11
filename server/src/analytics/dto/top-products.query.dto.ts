import { AnalyticsQueryDto } from './analytics.query.dto'
import { Transform } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

export class TopProductsQueryDto extends AnalyticsQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  limit?: number
}
