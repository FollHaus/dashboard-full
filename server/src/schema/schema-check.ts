import { Sequelize } from 'sequelize-typescript'
import { ConfigService } from '@nestjs/config'
import { getSequelizeConfig } from '../config/db.config'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { QueryInterface, DataTypes } from 'sequelize'
import fs from 'node:fs'
import { CategoryModel } from '../category/category.model'
import { ProductModel } from '../product/product.model'
import { SaleModel } from '../sale/sale.model'
import { TaskModel } from '../task/task.model'
import { ReportModel } from '../report/report.model'
import { UserModel } from '../auth/user.model'

loadEnv()

const configService = new ConfigService(process.env)
const sequelizeConfig = getSequelizeConfig(configService)

const sequelize = new Sequelize({ ...sequelizeConfig, logging: false })

async function loadModels() {
        const models = [
                CategoryModel,
                ProductModel,
                SaleModel,
                TaskModel,
                ReportModel,
                UserModel
        ]
        sequelize.addModels(models)
        const loaded = sequelize.modelManager.models.map((m) => m.name)
        console.log(`Loaded ${loaded.length} models: ${loaded.join(', ')}`)
        if (loaded.length === 0) {
                throw new Error('No models were loaded')
        }
}

interface MigrationInfo {
        file: string
        problem: string
}

interface ColumnAttr {
        fieldName: string
        modelDef: any
        dbDef?: any
}

function simplifyType(type: string): string {
        return type.replace(/\s+/g, '').toLowerCase()
}

function dataTypeFromColumn(attr: any): string {
        const type: any = attr.type
        if (!type) return 'DataTypes.STRING'
        const key = type.key
        if (key === 'DECIMAL' && (type.options?.precision || type.options?.scale)) {
                const precision = type.options?.precision || 10
                const scale = type.options?.scale || 0
                return `DataTypes.DECIMAL(${precision}, ${scale})`
        }
        if (key === 'STRING' && type.options?.length) {
                return `DataTypes.STRING(${type.options.length})`
        }
        return `DataTypes.${key}`
}

function dataTypeFromDb(column: any): string {
        const type = column.type as string
        const upper = type.toUpperCase()
        if (upper.startsWith('CHARACTER VARYING')) {
                const match = upper.match(/CHARACTER VARYING\((\d+)\)/)
                return match ? `DataTypes.STRING(${match[1]})` : 'DataTypes.STRING'
        }
        if (upper.startsWith('INTEGER')) return 'DataTypes.INTEGER'
        if (upper.startsWith('BIGINT')) return 'DataTypes.BIGINT'
        if (upper.startsWith('BOOLEAN')) return 'DataTypes.BOOLEAN'
        if (upper.startsWith('DOUBLE PRECISION')) return 'DataTypes.DOUBLE'
        if (upper.startsWith('REAL')) return 'DataTypes.FLOAT'
        if (upper.startsWith('NUMERIC') || upper.startsWith('DECIMAL')) {
                const match = upper.match(/\((\d+),(\d+)\)/)
                return match
                        ? `DataTypes.DECIMAL(${match[1]}, ${match[2]})`
                        : 'DataTypes.DECIMAL'
        }
        if (upper.startsWith('DATE')) return 'DataTypes.DATE'
        if (upper.startsWith('TIMESTAMP')) return 'DataTypes.DATE'
        if (upper.startsWith('TEXT')) return 'DataTypes.TEXT'
        return `Sequelize.literal('${type}')`
}

function attributeToDefinition(attr: any): string {
        const parts: string[] = []
        parts.push(`type: ${dataTypeFromColumn(attr)}`)
        if (attr.allowNull === false) parts.push('allowNull: false')
        if (attr.defaultValue !== undefined && attr.defaultValue !== null) {
                parts.push(`defaultValue: ${JSON.stringify(attr.defaultValue)}`)
        }
        if (attr.unique) parts.push('unique: true')
        return `{ ${parts.join(', ')} }`
}

function dbColumnToDefinition(column: any): string {
        const parts: string[] = []
        parts.push(`type: ${dataTypeFromDb(column)}`)
        if (!column.allowNull) parts.push('allowNull: false')
        if (column.defaultValue !== undefined && column.defaultValue !== null) {
                parts.push(`defaultValue: ${JSON.stringify(column.defaultValue)}`)
        }
        return `{ ${parts.join(', ')} }`
}

function timestamp(): string {
        return new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
}

function writeMigration(
        table: string,
        action: string,
        upBody: string,
        downBody: string
): string {
        const migrationsDir = path.resolve(__dirname, '../..', 'migrations')
        if (!fs.existsSync(migrationsDir)) fs.mkdirSync(migrationsDir, { recursive: true })
        const file = `${timestamp()}-${table}-${action}.ts`
        const fullPath = path.join(migrationsDir, file)
        const content = `import { QueryInterface, DataTypes } from 'sequelize'\n\nmodule.exports = {\n  up: async (queryInterface: QueryInterface) => {\n    await queryInterface.sequelize.transaction(async (transaction) => {\n      ${upBody}\n    })\n  },\n  down: async (queryInterface: QueryInterface) => {\n    await queryInterface.sequelize.transaction(async (transaction) => {\n      ${downBody}\n    })\n  }\n}`
        fs.writeFileSync(fullPath, content)
        return file
}

async function checkModel(
        queryInterface: QueryInterface,
        model: any
): Promise<MigrationInfo[]> {
        const tableName = model.getTableName() as string
        const issues: MigrationInfo[] = []
        let tableDesc: any
        try {
                tableDesc = await queryInterface.describeTable(tableName)
        } catch (e) {
                const up = `await queryInterface.createTable('${tableName}', { /* columns */ }, { transaction })`
                const down = `await queryInterface.dropTable('${tableName}', { transaction })`
                const file = writeMigration(tableName, 'create-table', up, down)
                issues.push({ file, problem: `Table ${tableName} does not exist` })
                return issues
        }

        const attrs = model.rawAttributes

        for (const [attrName, attr] of Object.entries(attrs) as [string, any][]) {
                const columnName = attr.field || attrName
                const dbCol = tableDesc[columnName]
                if (!dbCol) {
                        const up = `await queryInterface.addColumn('${tableName}', '${columnName}', ${attributeToDefinition(attr)}, { transaction })`
                        const down = `await queryInterface.removeColumn('${tableName}', '${columnName}', { transaction })`
                        const file = writeMigration(
                                tableName,
                                `add-column-${columnName}`,
                                up,
                                down
                        )
                        issues.push({
                                file,
                                problem: `Missing column ${columnName} in table ${tableName}`
                        })
                        continue
                }
                // type compare
                const modelType = simplifyType(attr.type.toSql())
                const dbType = simplifyType(dbCol.type)
                if (modelType !== dbType) {
                        const up = `await queryInterface.changeColumn('${tableName}', '${columnName}', ${attributeToDefinition(attr)}, { transaction })`
                        const down = `await queryInterface.changeColumn('${tableName}', '${columnName}', ${dbColumnToDefinition(dbCol)}, { transaction })`
                        const file = writeMigration(
                                tableName,
                                `change-column-${columnName}`,
                                up,
                                down
                        )
                        issues.push({
                                file,
                                problem: `Different type for column ${columnName} in table ${tableName}`
                        })
                }
                if (!!attr.allowNull !== dbCol.allowNull) {
                        const up = `await queryInterface.changeColumn('${tableName}', '${columnName}', ${attributeToDefinition(attr)}, { transaction })`
                        const down = `await queryInterface.changeColumn('${tableName}', '${columnName}', ${dbColumnToDefinition(dbCol)}, { transaction })`
                        const file = writeMigration(
                                tableName,
                                `change-null-${columnName}`,
                                up,
                                down
                        )
                        issues.push({
                                file,
                                problem: `Different nullability for column ${columnName} in table ${tableName}`
                        })
                }
                const modelDefault = attr.defaultValue ?? null
                const dbDefault = dbCol.defaultValue ?? null
                if (modelDefault !== dbDefault) {
                        const up = `await queryInterface.changeColumn('${tableName}', '${columnName}', ${attributeToDefinition(attr)}, { transaction })`
                        const down = `await queryInterface.changeColumn('${tableName}', '${columnName}', ${dbColumnToDefinition(dbCol)}, { transaction })`
                        const file = writeMigration(
                                tableName,
                                `change-default-${columnName}`,
                                up,
                                down
                        )
                        issues.push({
                                file,
                                problem: `Different default value for column ${columnName} in table ${tableName}`
                        })
                }
        }

        // extra columns
        for (const dbCol of Object.keys(tableDesc)) {
                const exists = Object.entries(attrs).some(
                        ([attrName, attr]: [string, any]) =>
                                (attr.field || attrName) === dbCol
                )
                if (!exists) {
                        const up = `await queryInterface.removeColumn('${tableName}', '${dbCol}', { transaction })`
                        const down = `// TODO: define original column definition to restore`
                        const file = writeMigration(
                                tableName,
                                `remove-column-${dbCol}`,
                                up,
                                down
                        )
                        issues.push({
                                file,
                                problem: `Column ${dbCol} exists in DB but not in model ${tableName}`
                        })
                }
        }

        // indexes
        const modelIndexes = (model.options.indexes || []) as any[]
        const dbIndexes = (await queryInterface.showIndex(tableName)) as any[]
        for (const idx of modelIndexes) {
                const fields = (idx.fields || []).map((f: any) =>
                        typeof f === 'string' ? f : f.name
                )
                const found = dbIndexes.some((d: any) => {
                        const dbFields = (d.fields || []).map(
                                (f: any) => f.attribute || f.name
                        )
                        return (
                                fields.length === dbFields.length &&
                                fields.every((f: string, i: number) => f === dbFields[i]) &&
                                !!idx.unique === !!d.unique
                        )
                })
                if (!found) {
                        const up = `await queryInterface.addIndex('${tableName}', [${fields
                                .map((f: string) => `'${f}'`)
                                .join(', ')}], { unique: ${
                                idx.unique ? 'true' : 'false'
                        }, transaction })`
                        const down = `await queryInterface.removeIndex('${tableName}', [${fields
                                .map((f: string) => `'${f}'`)
                                .join(', ')}], { transaction })`
                        const file = writeMigration(
                                tableName,
                                `add-index-${fields.join('-')}`,
                                up,
                                down
                        )
                        issues.push({
                                file,
                                problem: `Missing index (${fields.join(',')}) on table ${tableName}`
                        })
                }
        }

        // foreign keys
        const foreignKeys = (await queryInterface.getForeignKeyReferencesForTable(
                tableName
        )) as any[]
        for (const [attrName, attr] of Object.entries(attrs) as [string, any][]) {
                if (attr.references) {
                        const columnName = attr.field || attrName
                        const exists = foreignKeys.some(
                                (fk: any) =>
                                        fk.columnName === columnName &&
                                        fk.referencedTableName === attr.references.model &&
                                        fk.referencedColumnName === attr.references.key
                        )
                        if (!exists) {
                                const up = `await queryInterface.addConstraint('${tableName}', { fields: ['${columnName}'], type: 'foreign key', references: { table: '${attr.references.model}', field: '${attr.references.key}' }, transaction })`
                                const down = `await queryInterface.removeConstraint('${tableName}', '${tableName}_${columnName}_fkey', { transaction })`
                                const file = writeMigration(
                                        tableName,
                                        `add-fk-${columnName}`,
                                        up,
                                        down
                                )
                                issues.push({
                                        file,
                                        problem: `Missing foreign key for column ${columnName} on table ${tableName}`
                                })
                        }
                }
        }

        // timestamps and paranoid
        if (model.options.timestamps !== false) {
                if (!tableDesc['createdAt']) {
                        const up = `await queryInterface.addColumn('${tableName}', 'createdAt', { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, { transaction })`
                        const down = `await queryInterface.removeColumn('${tableName}', 'createdAt', { transaction })`
                        const file = writeMigration(tableName, 'add-column-createdAt', up, down)
                        issues.push({ file, problem: `Missing createdAt in ${tableName}` })
                }
                if (!tableDesc['updatedAt']) {
                        const up = `await queryInterface.addColumn('${tableName}', 'updatedAt', { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, { transaction })`
                        const down = `await queryInterface.removeColumn('${tableName}', 'updatedAt', { transaction })`
                        const file = writeMigration(tableName, 'add-column-updatedAt', up, down)
                        issues.push({ file, problem: `Missing updatedAt in ${tableName}` })
                }
        }
        if (model.options.paranoid) {
                const deletedName =
                        typeof model.options.deletedAt === 'string'
                                ? model.options.deletedAt
                                : 'deletedAt'
                if (!tableDesc[deletedName]) {
                        const up = `await queryInterface.addColumn('${tableName}', '${deletedName}', { type: DataTypes.DATE }, { transaction })`
                        const down = `await queryInterface.removeColumn('${tableName}', '${deletedName}', { transaction })`
                        const file = writeMigration(
                                tableName,
                                `add-column-${deletedName}`,
                                up,
                                down
                        )
                        issues.push({
                                file,
                                problem: `Missing paranoid column ${deletedName} in ${tableName}`
                        })
                }
        }

        return issues
}

async function run() {
        await loadModels()
        await sequelize.authenticate()
        const queryInterface = sequelize.getQueryInterface()
        const allIssues: MigrationInfo[] = []
        for (const model of sequelize.modelManager.models) {
                // eslint-disable-next-line no-await-in-loop
                const issues = await checkModel(queryInterface, model)
                allIssues.push(...issues)
        }
        if (allIssues.length === 0) {
                console.log('Database schema matches Sequelize models')
        } else {
                console.log('Found mismatches:')
                for (const issue of allIssues) {
                        console.log(`- ${issue.problem} (migration: ${issue.file})`)
                }
                console.log('\nRun `npm run db:migrate` to apply generated migrations.')
        }
        await sequelize.close()
}

run().catch((err) => {
        console.error(err)
        process.exit(1)
})

