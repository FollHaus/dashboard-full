'use client'

import { FC } from 'react'

interface Stats {
  initial: number
  arrival: number
  departure: number
  final: number
}

interface MovementItem {
  date: string
  direction: 'arrival' | 'departure'
  product: string
  article: string
  quantity: number
  reason: string
}

interface WarehouseTabProps {
  stats: Stats
  movements: MovementItem[]
}

const WarehouseTab: FC<WarehouseTabProps> = ({ stats, movements }) => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div
          className='p-4 bg-white rounded shadow cursor-pointer'
          onClick={() => alert('Открыть начальный остаток')}
        >
          <div className='text-sm'>Начальный остаток на складе</div>
          <div className='text-xl font-semibold'>{stats.initial}</div>
        </div>
        <div
          className='p-4 bg-white rounded shadow cursor-pointer'
          onClick={() => alert('Открыть поступления')}
        >
          <div className='text-sm'>Поступление товара</div>
          <div className='text-xl font-semibold text-green-600'>{stats.arrival}</div>
        </div>
        <div
          className='p-4 bg-white rounded shadow cursor-pointer'
          onClick={() => alert('Открыть расход')}
        >
          <div className='text-sm'>Списание товара</div>
          <div className='text-xl font-semibold text-red-600'>{stats.departure}</div>
        </div>
        <div
          className='p-4 bg-white rounded shadow cursor-pointer'
          onClick={() => alert('Открыть конечный остаток')}
        >
          <div className='text-sm'>Конечный остаток на складе</div>
          <div className='text-xl font-semibold'>{stats.final}</div>
        </div>
      </div>

      <div className='p-4 bg-white rounded shadow overflow-x-auto'>
        <div className='font-medium mb-2'>Движение товара</div>
        <table className='w-full text-sm'>
          <thead>
            <tr className='text-left'>
              <th className='py-1 pr-2'>Дата</th>
              <th className='py-1 pr-2'>Товар</th>
              <th className='py-1 pr-2'>Артикул</th>
              <th className='py-1 pr-2 text-right'>Приход</th>
              <th className='py-1 pr-2 text-right'>Расход</th>
              <th className='py-1 pr-2'>Причина</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={`${m.date}-${m.article}`} className='border-t'>
                <td className='py-1 pr-2'>{m.date}</td>
                <td className='py-1 pr-2'>{m.product}</td>
                <td className='py-1 pr-2'>{m.article}</td>
                <td className='py-1 pr-2 text-right text-green-600'>
                  {m.direction === 'arrival' ? m.quantity : ''}
                </td>
                <td className='py-1 pr-2 text-right text-red-600'>
                  {m.direction === 'departure' ? m.quantity : ''}
                </td>
                <td className='py-1 pr-2'>{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WarehouseTab
