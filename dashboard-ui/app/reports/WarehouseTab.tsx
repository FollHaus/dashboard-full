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
          onClick={() => alert('Open initial balance')}
        >
          <div className='text-sm'>Initial stock balance</div>
          <div className='text-xl font-semibold'>{stats.initial}</div>
        </div>
        <div
          className='p-4 bg-white rounded shadow cursor-pointer'
          onClick={() => alert('Open arrivals')}
        >
          <div className='text-sm'>Stock arrival</div>
          <div className='text-xl font-semibold text-green-600'>{stats.arrival}</div>
        </div>
        <div
          className='p-4 bg-white rounded shadow cursor-pointer'
          onClick={() => alert('Open departures')}
        >
          <div className='text-sm'>Stock departure</div>
          <div className='text-xl font-semibold text-red-600'>{stats.departure}</div>
        </div>
        <div
          className='p-4 bg-white rounded shadow cursor-pointer'
          onClick={() => alert('Open final balance')}
        >
          <div className='text-sm'>Final stock balance</div>
          <div className='text-xl font-semibold'>{stats.final}</div>
        </div>
      </div>

      <div
        className='p-4 bg-white rounded shadow cursor-pointer'
        onClick={() => alert('Open stock movement details')}
      >
        <div className='font-medium mb-2'>Stock movement</div>
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
