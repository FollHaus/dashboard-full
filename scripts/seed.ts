/**
 * Demo data seeder.
 * Usage:
 * npx ts-node scripts/seed.ts --yes --categories=15 --products=120 --sales=300 --tasks=60 --days=365 --locale=ru
 */


>>>>>>> 3f268282fab4197d064229051f8b3a656e5165cb
import { Sequelize } from '../server/node_modules/sequelize-typescript'
import * as dotenv from 'dotenv'
import { Faker, allLocales } from '@faker-js/faker'
import * as readline from 'node:readline'
import { CategoryModel } from '../server/src/category/category.model'
import { ProductModel } from '../server/src/product/product.model'
import { SaleModel } from '../server/src/sale/sale.model'
import { TaskModel, TaskStatus, TaskPriority } from '../server/src/task/task.model'

let faker: Faker

dotenv.config()

interface SeedOptions {
  categories: number
  products: number
  sales: number
  tasks: number
  days: number
  locale: string
  append: boolean
  yes: boolean
  dryRun: boolean
}

function parseArgs(): SeedOptions {
  const opts: SeedOptions = {
    categories: 15,
    products: 120,
    sales: 300,
    tasks: 60,
    days: 365,
    locale: 'ru',
    append: false,
    yes: false,
    dryRun: false,
  }

  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith('--')) continue
    const [key, value] = arg.slice(2).split('=')
    switch (key) {
      case 'categories':
      case 'products':
      case 'sales':
      case 'tasks':
      case 'days':
        if (value) (opts as any)[key] = Number(value)
        break
      case 'locale':
        if (value) opts.locale = value
        break
      case 'append':
      case 'yes':
      case 'dryRun':
        ;(opts as any)[key] = value !== 'false'
        break
    }
  }
  return opts
}

async function confirm(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(/^y(es)?$/i.test(answer.trim()))
    })
  })
}

const DAY_MS = 24 * 60 * 60 * 1000

const usedCategoryNames = new Set<string>()
function buildCategory(): { name: string } {
  let name: string
  do {
    name = Array.from({ length: faker.number.int({ min: 2, max: 3 }) }, () => faker.word.sample()).join(' ')
  } while (usedCategoryNames.has(name))
  usedCategoryNames.add(name)
  return { name }
}

const usedArticles = new Set<string>()
function buildProduct(cat: CategoryModel): {
  name: string
  categoryId: number
  articleNumber: string
  purchasePrice: number
  salePrice: number
  remains: number
} {
  const name = Array.from({ length: faker.number.int({ min: 2, max: 3 }) }, () => faker.word.sample()).join(' ')
  let article: string
  do {
    article = faker.string.alphanumeric({ length: 8 }).toUpperCase()
  } while (usedArticles.has(article))
  usedArticles.add(article)
  const salePrice = Number(faker.finance.amount({ min: 100, max: 10000, dec: 2 }))
  const purchasePrice = Number((salePrice * faker.number.float({ min: 0.5, max: 0.8 })).toFixed(2))
  const remains = faker.number.int({ min: 0, max: 500 })
  return { name, categoryId: cat.id!, articleNumber: article, purchasePrice, salePrice, remains }
}

function buildTask(): {
  title: string
  description?: string
  deadline: Date
  status: TaskStatus
  priority: TaskPriority
  executor?: string
} {
  const title = Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => faker.word.sample()).join(' ')
  const description = faker.number.int({ min: 0, max: 1 }) ? faker.lorem.sentences({ min: 1, max: 2 }) : undefined
  const offset = faker.number.int({ min: -14, max: 14 })
  const deadline = new Date(Date.now() + offset * DAY_MS)
  const status = faker.helpers.arrayElement(Object.values(TaskStatus))
  const priority = faker.helpers.arrayElement(Object.values(TaskPriority))
  const executor = faker.number.int({ min: 0, max: 1 }) ? faker.person.fullName() : undefined
  return { title, description, deadline, status, priority, executor }
}

let saleMin: Date | null = null
let saleMax: Date | null = null
let saleSum = 0
function buildSale(product: ProductModel, days: number): {
  saleDate: string
  productId: number
  quantitySold: number
  totalPrice: number
} {
  const dayOffset = faker.number.int({ min: 0, max: Math.max(days - 1, 0) })
  const date = new Date(Date.now() - dayOffset * DAY_MS)
  saleMin = !saleMin || date < saleMin ? date : saleMin
  saleMax = !saleMax || date > saleMax ? date : saleMax
  const quantitySold = faker.number.int({ min: 1, max: 5 })
  product.remains = Math.max(0, product.remains - quantitySold)
  const totalPrice = Number((product.salePrice * quantitySold).toFixed(2))
  saleSum += totalPrice
  return {
    saleDate: date.toISOString().slice(0, 10),
    productId: product.id!,
    quantitySold,
    totalPrice,
  }
}

async function main() {
  const opts = parseArgs()
  const localeDef = (allLocales as Record<string, any>)[opts.locale] || allLocales['en']
  faker = new Faker({ locale: [localeDef, allLocales['en'], allLocales['base']] })

  if (!opts.yes) {
    const ok = await confirm('Seed database with demo data? (y/N) ')
    if (!ok) {
      console.log('Aborted.')
      return
    }
  }

  if (opts.dryRun) {
    const sampleCategory = buildCategory()
    const sampleProduct = buildProduct({ id: 1 } as CategoryModel)
    const sampleSale = buildSale({ ...sampleProduct, id: 1 } as any as ProductModel, opts.days)
    const sampleTask = buildTask()
    console.log(`Dry run. Would insert ${opts.categories} categories, ${opts.products} products, ${opts.sales} sales, ${opts.tasks} tasks.`)
    console.log('Sample category:', sampleCategory)
    console.log('Sample product:', sampleProduct)
    console.log('Sample sale:', sampleSale)
    console.log('Sample task:', sampleTask)
    return
  }

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE || 'postgres',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    models: [CategoryModel, ProductModel, SaleModel, TaskModel],
    logging: false,
    define: { underscored: false },
  })

  await sequelize.authenticate()

  if (!opts.append) {
    await SaleModel.truncate({ cascade: true, restartIdentity: true })
    await ProductModel.truncate({ cascade: true, restartIdentity: true })
    await CategoryModel.truncate({ cascade: true, restartIdentity: true })
    await TaskModel.truncate({ cascade: true, restartIdentity: true })
  }

  const stats = { categories: 0, products: 0, sales: 0, tasks: 0 }

  await sequelize.transaction(async (t: any) => {
    let categories: CategoryModel[] = []
    if (opts.categories > 0) {
      const data = Array.from({ length: opts.categories }, buildCategory)
      categories = await CategoryModel.bulkCreate(data, { transaction: t })
      stats.categories = categories.length
    }

    let products: ProductModel[] = []
    if (opts.products > 0 && categories.length) {
      const data: any[] = []
      for (let i = 0; i < opts.products; i++) {
        const cat = faker.helpers.arrayElement(categories)
        data.push(buildProduct(cat))
      }
      products = await ProductModel.bulkCreate(data, { transaction: t })
      stats.products = products.length
    } else if (opts.products > 0) {
      console.log('No categories found. Skipping products.')
    }

    if (opts.tasks > 0) {
      const data = Array.from({ length: opts.tasks }, buildTask)
      await TaskModel.bulkCreate(data, { transaction: t })
      stats.tasks = data.length
    }

    if (opts.sales > 0 && products.length) {
      saleMin = null
      saleMax = null
      saleSum = 0
      const data: any[] = []
      for (let i = 0; i < opts.sales; i++) {
        const prod = faker.helpers.arrayElement(products)
        data.push(buildSale(prod, opts.days))
      }
      await SaleModel.bulkCreate(data, { transaction: t })
      stats.sales = data.length
      for (const prod of products) {
        await prod.save({ transaction: t })
      }
    } else if (opts.sales > 0) {
      console.log('No products found. Skipping sales.')
    }
  })

  console.log('Seeding completed:')
  console.log(`  Categories: ${stats.categories}`)
  console.log(`  Products: ${stats.products}`)
  console.log(`  Tasks: ${stats.tasks}`)
  console.log(`  Sales: ${stats.sales}`)
  if (stats.sales > 0 && saleMin && saleMax) {
    console.log(`  Sales range: ${saleMin.toISOString().slice(0, 10)} - ${saleMax.toISOString().slice(0, 10)}`)
    console.log(`  Avg sale amount: ${(saleSum / stats.sales).toFixed(2)}`)
  }

  await sequelize.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
