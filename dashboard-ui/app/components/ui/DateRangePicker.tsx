'use client'

import React, { useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import cn from 'classnames'

interface Props {
  initial?: DateRange
  onConfirm: (r: { from: Date; to: Date }) => void
  onCancel: () => void
}

const DateRangePicker: React.FC<Props> = ({ initial, onConfirm, onCancel }) => {
  const [range, setRange] = useState<DateRange | undefined>(initial)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded p-4 shadow-md space-y-4">
        <DayPicker
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          pagedNavigation
        />
        <div className="flex justify-end gap-2">
          <button
            className="h-9 px-3 rounded-full text-sm font-medium bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            disabled={!range?.from || !range?.to}
            className={cn(
              'h-9 px-3 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-300',
              range?.from && range?.to
                ? 'bg-primary-500 text-neutral-50 hover:bg-primary-600'
                : 'bg-neutral-100 text-neutral-900 cursor-not-allowed',
            )}
            onClick={() =>
              range?.from &&
              range?.to &&
              onConfirm({ from: range.from, to: range.to })
            }
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateRangePicker

