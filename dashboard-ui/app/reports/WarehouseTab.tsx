'use client'

import { FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnalyticsService } from '@/services/analytics/analytics.service'
import { IProduct } from '@/shared/interfaces/product.interface'

interface Filters {
  categories: number[]
}

interface Props {
  filters: Filters
}

const WarehouseTab: FC<Props> = ({ filters }) => {
  const {
    data: remains,
    isLoading: remainsLoading,
    error: remainsError,
    refetch: refetchRemains,
  } = useQuery<number, Error>({
    queryKey: ['reports', 'warehouse', 'remains', filters],
    queryFn: () => AnalyticsService.getProductRemains(),
  })

  const {
    data: lowStock,
    isLoading: lowLoading,
    error: lowError,
    refetch: refetchLow,
  } = useQuery<IProduct[], Error>({
    queryKey: ['reports', 'warehouse', 'low', filters],
    queryFn: () => AnalyticsService.getLowStock(10, filters.categories),
  })

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl bg-neutral-200 p-4 shadow-card'>
        {remainsLoading ? (
          <div className='text-sm text-neutral-500'>Загрузка...</div>
        ) : remainsError ? (
          <div className='text-sm text-red-600'>
            Ошибка{' '}
            <button className='underline' onClick={() => refetchRemains()}>
              Повторить
            </button>
          </div>
        ) : (
          <div className='text-sm'>Общий остаток: {remains}</div>
        )}
      </div>

      <div className='rounded-2xl bg-neutral-200 p-4 shadow-card'>
        <h3 className='font-medium mb-2'>Мало/нет на складе</h3>
        {lowLoading ? (
          <div className='text-sm text-neutral-500'>Загрузка...</div>
        ) : lowError ? (
          <div className='text-sm text-red-600'>
            Ошибка{' '}
            <button className='underline' onClick={() => refetchLow()}>
              Повторить
            </button>
          </div>
        ) : lowStock && lowStock.length > 0 ? (
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-left'>
                <th className='py-1 pr-2'>Товар</th>
                <th className='py-1 pr-2 text-right'>Остаток</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id} className='border-t'>
                  <td className='py-1 pr-2'>{p.name}</td>
                  <td className='py-1 pr-2 text-right'>{p.remains}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='text-sm text-neutral-500'>Нет данных</div>
        )}
      </div>
    </div>
  )
}

export default WarehouseTab

