import { Transform } from 'class-transformer'
import { IsIn, IsInt } from 'class-validator'

export class SalesPeriodQueryDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsIn([7, 14, 30, 365])
  period: number
}
