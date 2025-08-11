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
  arrival: number
  departure: number
}

interface WarehouseTabProps {
  stats: Stats
  movement: MovementItem[]
}

const WarehouseTab: FC<WarehouseTabProps> = ({ stats, movement }) => {
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

      <div
        className='p-4 bg-white rounded shadow cursor-pointer'
        onClick={() => alert('Открыть движение товара')}
      >
        <div className='font-medium mb-2'>Движение товара</div>
        <div className='flex items-end space-x-2 h-32'>
          {movement.map(m => (
            <div key={m.date} className='flex-1 flex flex-col justify-end'>
              <div className='bg-green-500' style={{ height: `${m.arrival}px` }} />
              <div className='bg-red-500' style={{ height: `${m.departure}px` }} />
              <span className='text-xs text-center'>{new Date(m.date).getDate()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WarehouseTab
