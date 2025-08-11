'use client'

import { useState } from 'react'
import classNames from 'classnames'
import Layout from '@/ui/Layout'
import SalesTab from './SalesTab'
import WarehouseTab from './WarehouseTab'
import TasksTab from './TasksTab'

const tabs = [
  { key: 'sales', label: 'Sales' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'tasks', label: 'Tasks' },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function ReportsPage() {
  const [active, setActive] = useState<TabKey>('sales')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  return (
    <Layout>
      <div className='space-y-6'>
        <div className='flex flex-wrap gap-2'>
          <label className='flex flex-col'>
            <span className='text-sm'>Start date</span>
            <input
              type='date'
              value={start}
              onChange={e => setStart(e.target.value)}
              className='border border-neutral-300 rounded px-2 py-1'
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-sm'>End date</span>
            <input
              type='date'
              value={end}
              onChange={e => setEnd(e.target.value)}
              className='border border-neutral-300 rounded px-2 py-1'
            />
          </label>
        </div>

        <div className='flex space-x-4 border-b'>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={classNames('py-2 px-4 -mb-px', {
                'border-b-2 border-primary-500 font-medium': active === t.key,
              })}
            >
              {t.label}
            </button>
          ))}
        </div>

        {active === 'sales' && <SalesTab start={start} end={end} />}
        {active === 'warehouse' && <WarehouseTab start={start} end={end} />}
        {active === 'tasks' && <TasksTab start={start} end={end} />}
      </div>
    </Layout>
  )
}
