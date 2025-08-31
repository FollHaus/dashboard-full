'use client'

import { useEffect, useRef, useState } from 'react'
import useDebounce from '@/hooks/useDebounce'
import { TaskFilters } from '@/hooks/useTaskFilters'
import SearchInput from '@/components/ui/SearchInput'
import { Calendar, Zap, RotateCcw } from 'lucide-react'

interface Props {
  filters: TaskFilters
  setFilters: (changes: Partial<TaskFilters>) => void
}

const TaskFiltersToolbar = ({ filters, setFilters }: Props) => {
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 350)
  const [dateOpen, setDateOpen] = useState(false)
  const dateRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setFilters({ search: debouncedSearch })
  }, [debouncedSearch, setFilters])

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node))
        setDateOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDateOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  function formatDisplay(date: string) {
    if (!date) return ''
    return date.split('-').reverse().join('.')
  }

  const rangeDisplay = `${formatDisplay(filters.from)} — ${formatDisplay(
    filters.to,
  )}`

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 rounded-2xl bg-neutral-200 shadow-card px-3 py-2 mb-3">
      <div className="relative" ref={dateRef}>
        <button
          type="button"
          className="h-10 pl-9 pr-3 rounded-xl border border-neutral-300 bg-neutral-100 focus:ring-2 focus:ring-primary-300 cursor-pointer"
          aria-label="Дата"
          title={rangeDisplay}
          onClick={() => setDateOpen(o => !o)}
        >
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-800 pointer-events-none" />
          {rangeDisplay}
        </button>
        {dateOpen && (
          <div className="absolute z-10 mt-1 p-2 bg-white shadow-lg rounded-xl border border-neutral-300 flex items-center gap-2">
            <input
              type="date"
              value={filters.from}
              onChange={e => setFilters({ from: e.target.value })}
              className="h-8 border border-neutral-300 rounded px-2 focus:ring-2 focus:ring-primary-300"
              aria-label="Дата начала"
              title="Дата начала"
            />
            <span aria-hidden>—</span>
            <input
              type="date"
              value={filters.to}
              onChange={e => setFilters({ to: e.target.value })}
              className="h-8 border border-neutral-300 rounded px-2 focus:ring-2 focus:ring-primary-300"
              aria-label="Дата окончания"
              title="Дата окончания"
            />
          </div>
        )}
      </div>
      <div className="flex items-center">
        <Zap className="w-4 h-4 mr-1.5 text-neutral-800" />
        <select
          value={filters.priority}
          onChange={e => setFilters({ priority: e.target.value })}
          className="h-10 px-3 rounded-xl border border-neutral-300 bg-neutral-100 cursor-pointer focus:ring-2 focus:ring-primary-300"
          aria-label="Приоритет"
          title="Приоритет"
        >
          <option value="">Все</option>
          <option value="Высокий">Высокий</option>
          <option value="Средний">Средний</option>
          <option value="Низкий">Низкий</option>
        </select>
      </div>
      <div className="flex items-center">
        <RotateCcw className="w-4 h-4 mr-1.5 text-neutral-800" />
        <select
          value={filters.status}
          onChange={e => setFilters({ status: e.target.value })}
          className="h-10 px-3 rounded-xl border border-neutral-300 bg-neutral-100 cursor-pointer focus:ring-2 focus:ring-primary-300"
          aria-label="Статус"
          title="Статус"
        >
          <option value="">Все</option>
          <option value="Выполняется">Выполняется</option>
          <option value="Ожидает">Ожидает</option>
          <option value="Готово">Готово</option>
          <option value="Просроченные">Просроченные</option>
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <SearchInput
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Поиск…"
          aria-label="Поиск"
          title="Поиск"
        />
      </div>
    </div>
  )
}

export default TaskFiltersToolbar
