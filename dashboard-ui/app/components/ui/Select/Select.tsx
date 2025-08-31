import { useEffect, useRef, useState } from 'react'
import { ISelectOption, ISelectProps } from './select.interface'

function shorten(str: string, max = 20) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = '',
  loading,
  error,
  onRetry,
  dropdownClassName,
}: ISelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [])

  const toggle = () => setOpen(o => !o)

  const handleSelect = (val: number) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const selectedLabels = options
    .filter(o => value.includes(o.value))
    .map(o => shorten(o.label))
    .join(', ')

  return (
    <div className='relative w-full' ref={ref}>
      <div
        className='border border-neutral-300 rounded-lg px-3 py-2 w-full cursor-pointer flex items-center justify-between min-w-0'
        onClick={toggle}
      >
        <span className='truncate'>{selectedLabels || placeholder}</span>
        {value.length > 0 && (
          <button
            className='ml-2 text-neutral-500 hover:text-neutral-700'
            onClick={clear}
            aria-label='clear selection'
          >
            ×
          </button>
        )}
      </div>
      {open && (
        <div
          className={`absolute z-10 mt-1 overflow-auto bg-white border border-neutral-300 rounded shadow w-full ${
            dropdownClassName || 'max-h-60'
          }`}
        >
          {loading ? (
            <div className='p-2 text-sm text-neutral-500'>Loading...</div>
          ) : error ? (
            <div className='p-2 text-sm text-red-600 space-y-2'>
              <div>{error}</div>
              {onRetry && (
                <button
                  className='text-blue-500 underline'
                  onClick={onRetry}
                >
                  Обновить
                </button>
              )}
            </div>
          ) : (
            options.map((opt: ISelectOption) => (
              <label
                key={opt.value}
                className='flex items-center px-2 py-1 cursor-pointer hover:bg-neutral-100'
              >
                <input
                  type='checkbox'
                  className='mr-2'
                  checked={value.includes(opt.value)}
                  onChange={() => handleSelect(opt.value)}
                />
                <span className='truncate'>{opt.label}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}
