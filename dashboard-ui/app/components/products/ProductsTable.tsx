import { useState } from 'react'
import Button from '@/ui/Button/Button'
import ProductDetails from './ProductDetails'
import { Product } from './product.types'

const products: Product[] = [
  {
    id: 1,
    name: 'Laptop',
    category: 'Electronics',
    balance: 3,
    price: 1500,
    supplier: 'TechCorp',
    movement: ['Received 5 units', 'Sold 2 units'],
    history: ['Purchase 10 units on 2023-08-01', 'Sale 2 units on 2023-08-15']
  },
  {
    id: 2,
    name: 'Office Chair',
    category: 'Furniture',
    balance: 25,
    price: 200,
    supplier: 'FurniCo',
    movement: ['Received 30 units', 'Sold 5 units'],
    history: ['Purchase 30 units on 2023-07-21', 'Sale 5 units on 2023-08-10']
  },
  {
    id: 3,
    name: 'LED Monitor',
    category: 'Electronics',
    balance: 8,
    price: 300,
    supplier: 'DisplayWorld',
    movement: ['Received 10 units', 'Sold 2 units'],
    history: ['Purchase 10 units on 2023-09-01', 'Sale 2 units on 2023-09-05']
  },
  {
    id: 4,
    name: 'Desk Lamp',
    category: 'Accessories',
    balance: 2,
    price: 40,
    supplier: 'LightHouse',
    movement: ['Received 5 units', 'Sold 3 units'],
    history: ['Purchase 5 units on 2023-08-20', 'Sale 3 units on 2023-08-28']
  }
]

const ProductsTable = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)

  const categories = Array.from(new Set(products.map(p => p.category)))

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!category || p.category === category)
  )

  const isLow = (balance: number) => balance <= 5

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search products"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-neutral-300 rounded px-2 py-1"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-primary-500 text-white px-4 py-1">Add product</Button>
          <Button className="bg-primary-500 text-white px-4 py-1">Import/Export list</Button>
        </div>
      </div>

      <table className="min-w-full bg-neutral-100 rounded shadow-md">
        <thead>
          <tr className="text-left border-b border-neutral-300">
            <th className="p-2">Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Balance</th>
            <th className="p-2">Price</th>
            <th className="p-2">Supplier</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(prod => (
            <tr
              key={prod.id}
              onClick={() => setSelected(prod)}
              className={`cursor-pointer border-b border-neutral-200 hover:bg-neutral-200 ${isLow(prod.balance) ? 'bg-warning/20' : ''}`}
            >
              <td className="p-2">{prod.name}</td>
              <td className="p-2">{prod.category}</td>
              <td className="p-2">
                {prod.balance}
                {isLow(prod.balance) && <span className="text-error ml-1">(!)</span>}
              </td>
              <td className="p-2">${prod.price}</td>
              <td className="p-2">{prod.supplier}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && <ProductDetails product={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

export default ProductsTable
