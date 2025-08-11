'use client'

import { FC } from 'react'

interface RevenueItem {
  date: string
  value: number
}

interface TopProduct {
  name: string
  revenue: number
}

interface SalesTabProps {
  revenueData: RevenueItem[]
  topProducts: TopProduct[]
  totalRevenue: number
}

const SalesTab: FC<SalesTabProps> = ({ revenueData, topProducts, totalRevenue }) => {
  const topRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0)
  const share = totalRevenue ? (topRevenue / totalRevenue) * 100 : 0
  const maxRevenue = Math.max(0, ...topProducts.map(p => p.revenue))
  const maxValue = Math.max(0, ...revenueData.map(r => r.value))

  const linePoints = revenueData
    .map((r, idx) => {
      const x = (idx / Math.max(1, revenueData.length - 1)) * 100
      const y = maxValue ? 100 - (r.value / maxValue) * 100 : 100
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
                style={{ width: `${maxRevenue ? (p.revenue / maxRevenue) * 100 : 0}%` }}
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
