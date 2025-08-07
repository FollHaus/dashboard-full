import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { getSequelizeConfig } from './config/db.config'
import { join } from 'path'
import { AuthModule } from './auth/auth.module'
import { ProductModule } from './product/product.module'
import { SaleModule } from './sale/sale.module'
import { TaskModule } from './task/task.module'
import { CategoryModule } from './category/category.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { ReportModule } from './report/report.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: join(__dirname, '..', '.env')
		}),
                SequelizeModule.forRootAsync({
                        imports: [ConfigModule],
                        inject: [ConfigService],
                        useFactory: getSequelizeConfig
                }),
                PassportModule.register({ defaultStrategy: 'jwt' }),
                AuthModule,
                ProductModule,
                SaleModule,
                TaskModule,
                CategoryModule,
                AnalyticsModule,
                ReportModule
        ],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
