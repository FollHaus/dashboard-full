'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import cn from 'classnames'
import { CategoryService } from '@/services/category/category.service'
import { ICategory } from '@/shared/interfaces/category.interface'
import useDebounce from '@/hooks/useDebounce'

interface Props {
  value: { id?: number; name: string } | null
  onChange: (val: { id?: number; name: string } | null) => void
  error?: string | null
}

const CategoryCombobox = ({ value, onChange, error }: Props) => {
  const [query, setQuery] = useState(value?.name || '')
  const [options, setOptions] = useState<ICategory[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [active, setActive] = useState<number>(-1)

  const debounced = useDebounce(query, 300)
  const listId = useId()
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(() => {
    setLoading(true)
    setLoadError(null)
    CategoryService.getAll()
      .then(data => {
        const term = debounced.trim().toLowerCase()
        const filtered = data.filter(cat =>
          cat.name.toLowerCase().includes(term)
        )
        setOptions(filtered)
        const exact = data.find(
          c => c.name.trim().toLowerCase() === term && term !== ''
        )
        if (exact) {
          onChange({ id: exact.id, name: exact.name })
          setQuery(exact.name)
        }
      })
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false))
  }, [debounced, onChange])

  useEffect(() => {
    if (!open) return
    load()
  }, [debounced, open, load])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [])

  const select = (cat: { id?: number; name: string }) => {
    onChange(cat)
    setQuery(cat.name)
    setOpen(false)
  }

  const showCreate = options.length === 0 && debounced.trim() !== ''

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && e.key !== 'Tab' && e.key !== 'Shift') setOpen(true)
    if (!open) return
    const count = options.length + (showCreate ? 1 : 0)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(count - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active < options.length) {
        const item = options[active]
        if (item) select(item)
      } else if (showCreate && active === options.length) {
        select({ name: debounced.trim() })
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
  <div className="mb-4 relative" ref={ref}>
    <label className="block mb-1">Категория</label>
    <input
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
      placeholder="Введите или выберите категорию…"
      className="w-full border border-neutral-300 rounded px-2 py-1"
      value={query}
      onChange={e => {
        setQuery(e.target.value)
        onChange(null)
        setOpen(true)
      }}
      onKeyDown={handleKey}
      onFocus={() => setOpen(true)}
    />
    {error && <div className="text-error mt-1">{error}</div>}
    {open && (
      <ul
        role="listbox"
        id={listId}
        className="mt-1 max-h-60 overflow-auto border border-neutral-300 rounded bg-white shadow absolute z-10 w-full"
      >
        {loading && (
          <li className="p-2 text-sm text-neutral-500">Загрузка…</li>
        )}
        {loadError && (
          <li className="p-2 text-sm text-error flex justify-between">
            Ошибка загрузки
            <button className="underline" onClick={load}>Повторить</button>
          </li>
        )}
        {!loading && !loadError &&
          options.map((item, i) => (
            <li
              key={item.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={active === i}
              className={cn(
                'px-2 py-1 cursor-pointer hover:bg-neutral-100',
                active === i && 'bg-neutral-100'
              )}
              onMouseEnter={() => setActive(i)}
              onMouseDown={e => {
                e.preventDefault()
                select(item)
              }}
            >
              {item.name}
            </li>
          ))}
        {!loading && !loadError && options.length === 0 && (
          <li className="p-2 text-sm text-neutral-500">Нет совпадений</li>
        )}
        {!loading && !loadError && showCreate && (
          <li
            id={`${listId}-${options.length}`}
            role="option"
            aria-selected={active === options.length}
            className={cn(
              'px-2 py-1 cursor-pointer hover:bg-neutral-100',
              active === options.length && 'bg-neutral-100'
            )}
            onMouseEnter={() => setActive(options.length)}
            onMouseDown={e => {
              e.preventDefault()
              select({ name: debounced.trim() })
            }}
          >
            {`Создать категорию «${debounced.trim()}»`}
          </li>
        )}
      </ul>
    )}
  </div>
  )
}

export default CategoryCombobox
