'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import cn from 'classnames'
import { CategoryService } from '@/services/category/category.service'
import { ICategory } from '@/shared/interfaces/category.interface'
import useDebounce from '@/hooks/useDebounce'
import fieldStyles from '@/ui/Field/Field.module.scss'

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
  const inputId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })

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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [])

  useEffect(() => {
    if (!open || !wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    setMenuPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    })
  }, [open])

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
    <div className={fieldStyles.field}>
      <label htmlFor={inputId} className={fieldStyles.label}>
        Категория
      </label>
      <div className='relative' ref={wrapperRef}>
        <input
          id={inputId}
          role='combobox'
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          placeholder='Введите или выберите категорию…'
          className={cn(fieldStyles.input, {
            [fieldStyles.inputError]: error,
          })}
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            onChange(null)
            setOpen(true)
          }}
          onKeyDown={handleKey}
          onFocus={() => setOpen(true)}
        />
        {query && !loading && (
          <button
            type='button'
            className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700'
            onClick={() => {
              setQuery('')
              onChange(null)
            }}
            aria-label='Очистить'
          >
            ×
          </button>
        )}
        {loading && (
          <span
            className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-neutral-300 border-t-primary-500 rounded-full animate-spin'
            aria-hidden='true'
          />
        )}
      </div>
      {error && (
        <div className={fieldStyles.error} id={`${inputId}-error`}>
          {error}
        </div>
      )}
      {open &&
        createPortal(
          <ul
            role='listbox'
            id={listId}
            style={{
              position: 'absolute',
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
            className='max-h-60 overflow-auto border border-neutral-300 rounded-lg bg-white shadow-md dark:bg-neutral-800 dark:border-neutral-700 z-50'
          >
            {loading && (
              <li className='p-2 text-sm text-neutral-500'>Загрузка…</li>
            )}
            {loadError && (
              <li className='p-2 text-sm text-error flex justify-between'>
                Ошибка загрузки
                <button className='underline' onClick={load}>
                  Повторить
                </button>
              </li>
            )}
            {!loading &&
              !loadError &&
              options.map((item, i) => (
                <li
                  key={item.id}
                  id={`${listId}-${i}`}
                  role='option'
                  aria-selected={active === i}
                  className={cn(
                    'px-2 py-1 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    active === i && 'bg-neutral-100 dark:bg-neutral-700'
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
              <li className='p-2 text-sm text-neutral-500'>Нет совпадений</li>
            )}
            {!loading && !loadError && showCreate && (
              <li
                id={`${listId}-${options.length}`}
                role='option'
                aria-selected={active === options.length}
                className={cn(
                  'px-2 py-1 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  active === options.length && 'bg-neutral-100 dark:bg-neutral-700'
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
          </ul>,
          document.body
        )}
    </div>
  )
}

export default CategoryCombobox
