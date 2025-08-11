'use client'

import { FC } from 'react'

interface PeriodProps {
  start: string
  end: string
}

const SalesTab: FC<PeriodProps> = () => {
  const revenueData = [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 120 },
    { date: '2024-01-03', value: 150 },
    { date: '2024-01-04', value: 170 },
    { date: '2024-01-05', value: 160 },
  ]
  const topProducts = [
    { name: 'Product A', revenue: 300 },
    { name: 'Product B', revenue: 260 },
    { name: 'Product C', revenue: 200 },
    { name: 'Product D', revenue: 190 },
    { name: 'Product E', revenue: 150 },
    { name: 'Product F', revenue: 140 },
    { name: 'Product G', revenue: 120 },
    { name: 'Product H', revenue: 110 },
    { name: 'Product I', revenue: 105 },
    { name: 'Product J', revenue: 100 },
  ]
  const totalRevenue = 5000
  const topRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0)
  const share = (topRevenue / totalRevenue) * 100
  const maxRevenue = Math.max(...topProducts.map(p => p.revenue))
  const maxValue = Math.max(...revenueData.map(r => r.value))

  const linePoints = revenueData
    .map((r, idx) => {
      const x = (idx / (revenueData.length - 1)) * 100
      const y = 100 - (r.value / maxValue) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className='space-y-6'>
      <div
        className='p-4 bg-white rounded shadow cursor-pointer'
        onClick={() => alert('Open revenue details')}
      >
        <div className='font-medium mb-2'>Revenue by day</div>
        <svg viewBox='0 0 100 100' className='w-full h-24'>
          <polyline
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            points={linePoints}
            className='text-primary-500'
          />
        </svg>
      </div>

      <div className='p-4 bg-white rounded shadow space-y-2'>
        <div className='font-medium'>Top-10 products by revenue</div>
        {topProducts.map(p => (
          <div
            key={p.name}
            className='flex items-center cursor-pointer'
            onClick={() => alert(`Open ${p.name} details`)}
          >
            <span className='w-32 text-sm'>{p.name}</span>
            <div className='flex-1 bg-neutral-200 h-2 mr-2'>
              <div
                className='bg-primary-500 h-2'
                style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <span className='text-sm'>{p.revenue}</span>
          </div>
        ))}
        <div
          className='text-sm mt-2 cursor-pointer'
          onClick={() => alert('Open top products share details')}
        >
          Share of top-10 products: {share.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

export default SalesTab
