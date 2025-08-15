/**
 * Truncate project tables in a foreign-key-safe order.
 * Usage:
 * npx ts-node scripts/clear-db.ts --yes
 * npx ts-node scripts/clear-db.ts --only=Product
 */
import * as dotenv from 'dotenv'
import { Sequelize, Model, ModelCtor } from '../server/node_modules/sequelize-typescript'
import { createInterface } from 'node:readline'
import { CategoryModel } from '../server/src/category/category.model'
import { ProductModel } from '../server/src/product/product.model'
import { SaleModel } from '../server/src/sale/sale.model'
import { TaskModel } from '../server/src/task/task.model'
import { ReportModel } from '../server/src/report/report.model'

dotenv.config()

interface ClearOptions {
  yes: boolean
  only?: string
}

function parseArgs(argv: string[]): ClearOptions {
  const opts: ClearOptions = { yes: false }
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue
    const [key, value] = arg.slice(2).split('=')
    switch (key) {
      case 'yes':
        opts.yes = value !== 'false'
        break
      case 'only':
        opts.only = value
        break
    }
  }
  return opts
}

async function confirm(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(/^y(es)?$/i.test(answer.trim()))
    })
  })
}

async function truncateModel(sequelize: Sequelize, model: ModelCtor<Model>): Promise<void> {
  const qi = sequelize.getQueryInterface()
  const table = qi.quoteTable(model.getTableName() as string)
  try {
    await sequelize.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`)
    console.log(`Truncated ${table}`)
  } catch (err) {
    const code = (err as { original?: { code?: string } }).original?.code
    if (code === '42P01') {
      console.warn(`Table ${table} does not exist. Skipping.`)
    } else {
      throw err
    }
  }
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2))

  const allModels: ModelCtor<Model>[] = [
    SaleModel,
    ProductModel,
    CategoryModel,
    TaskModel,
    ReportModel,
  ]

  let targetModels = allModels
  if (opts.only) {
    const name = opts.only.toLowerCase()
    const found = allModels.find((m) => {
      const full = m.name.toLowerCase()
      return full === name || full.replace(/model$/, '') === name
    })
    if (!found) {
      console.warn(`Model ${opts.only} not found. Aborting.`)
      return
    }
    targetModels = [found]
  }

  if (!opts.yes) {
    const ok = await confirm('This will delete ALL data from these tables. Continue? [y/N] ')
    if (!ok) {
      console.log('Aborted.')
      return
    }
  }

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE || 'postgres',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    models: allModels,
    logging: false,
    define: { underscored: false },
  })

  await sequelize.authenticate()

  try {
    await sequelize.query('SET session_replication_role = replica').catch(() => {})
    for (const model of targetModels) {
      await truncateModel(sequelize, model)
    }
  } finally {
    await sequelize.query('SET session_replication_role = DEFAULT').catch(() => {})
    await sequelize.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

