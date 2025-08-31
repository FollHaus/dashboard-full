'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { HiDotsVertical } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'

import Button from '@/ui/Button/Button'
import Modal from '@/ui/Modal/Modal'
import { TaskService } from '@/services/task/task.service'
import {
  ITask,
  TaskPriority,
  TaskStatus,
} from '@/shared/interfaces/task.interface'
import useDebounce from '@/hooks/useDebounce'
import { useTaskFilters } from '@/hooks/useTaskFilters'
import TaskInfoModal from './TaskInfoModal'
import TaskForm from './TaskForm'

const chipBase =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap'

function formatDisplay(date: string) {
  if (!date) return ''
  return date.split('-').reverse().join('.')
}

const TasksTable = () => {
  const { filters, setFilters } = useTaskFilters()
  const [tasks, setTasks] = useState<ITask[]>([])
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 350)
  const [dateOpen, setDateOpen] = useState(false)
  const dateRef = useRef<HTMLDivElement | null>(null)

  const { data, error } = useQuery<ITask[], Error>({
    queryKey: ['tasks', filters],
    queryFn: () =>
      TaskService.getAll({ start: filters.from, end: filters.to }),
  })

  useEffect(() => {
    if (data) setTasks(data)
  }, [data])

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

  const [openMenuTaskId, setOpenMenuTaskId] = useState<number | null>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  )
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLUListElement | null>(null)
  const menuItemsRef = useRef<HTMLElement[]>([])
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [viewTask, setViewTask] = useState<ITask | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ITask | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const pathname = usePathname()

  const closeAdd = () => {
    setIsAddOpen(false)
    returnFocusRef.current?.focus()
  }
  const closeEdit = () => {
    setEditingTask(null)
    returnFocusRef.current?.focus()
  }

  const closeMenu = () => {
    setOpenMenuTaskId(null)
    setAnchorRect(null)
    setMenuPos(null)
    anchorRef.current?.focus()
  }

  useEffect(() => {
    if (openMenuTaskId === null) return
    const handlePointer = (e: PointerEvent) => {
      const target = e.target as Node
      if (
        menuRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      )
        return
      closeMenu()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    const handleScroll = () => closeMenu()
    const handleResize = () => closeMenu()
    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [openMenuTaskId])

  useLayoutEffect(() => {
    if (!anchorRect || !menuRef.current) return
    const { width, height } = menuRef.current.getBoundingClientRect()
    let top = anchorRect.bottom + 4
    let left = anchorRect.right - width
    if (left + width > window.innerWidth) left = window.innerWidth - width
    if (left < 0) left = 0
    if (top + height > window.innerHeight)
      top = anchorRect.top - height - 4
    setMenuPos({ top, left })
  }, [anchorRect, openMenuTaskId])

  useEffect(() => {
    if (openMenuTaskId !== null && menuRef.current) {
      menuItemsRef.current = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
      )
      menuItemsRef.current[0]?.focus()
    }
  }, [openMenuTaskId])

  useEffect(() => {
    closeMenu()
  }, [pathname])

  const handleDelete = async (id: number) => {
    try {
      await TaskService.delete(id)
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (e: unknown) {
      // ignore
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = useMemo(() => {
    return tasks.filter(task => {
      const matchesPriority =
        !filters.priority || task.priority === filters.priority
      let matchesStatus = true
      if (filters.status === 'Просроченные') {
        const d = new Date(task.deadline)
        d.setHours(0, 0, 0, 0)
        matchesStatus = d < today && task.status !== TaskStatus.Completed
      } else if (filters.status) {
        matchesStatus = task.status === filters.status
      }
      const q = filters.search.toLowerCase()
      const matchesSearch =
        !q ||
        `${task.title} ${task.description ?? ''} ${
          task.executor ?? ''
        }`.toLowerCase().includes(q)
      return matchesPriority && matchesStatus && matchesSearch
    })
  }, [tasks, filters, today])

  useEffect(() => {
    if (openMenuTaskId !== null && !filtered.some(t => t.id === openMenuTaskId))
      closeMenu()
  }, [filtered, openMenuTaskId])

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = menuItemsRef.current
    const index = items.indexOf(document.activeElement as any)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(index + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(index - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey)
        items[(index - 1 + items.length) % items.length]?.focus()
      else items[(index + 1) % items.length]?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      ;(document.activeElement as HTMLElement)?.click()
    }
  }

  const rangeDisplay = `${formatDisplay(filters.from)} — ${formatDisplay(
    filters.to,
  )}`

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 md:gap-3 rounded-2xl bg-neutral-200 shadow-card px-3 py-2 mb-4">
        <div className="relative" ref={dateRef}>
          <button
            type="button"
            className="h-10 pl-9 pr-3 rounded-xl border border-neutral-300 bg-neutral-100 focus:ring-2 focus:ring-primary-300 cursor-pointer"
            aria-label="Дата"
            title={rangeDisplay}
            onClick={() => setDateOpen(o => !o)}
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              📅
            </span>
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
          <span className="mr-1.5">⚡</span>
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
          <span className="mr-1.5">🔄</span>
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
        <div className="flex items-center flex-1 min-w-[200px]">
          <span className="mr-1.5">🔍</span>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Поиск…"
            className="h-10 flex-1 min-w-[200px] rounded-xl border border-neutral-300 bg-neutral-100 px-3 cursor-pointer focus:ring-2 focus:ring-primary-300"
            aria-label="Поиск"
            title="Поиск"
          />
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <Button
          className="rounded-2xl px-4 py-2 shadow-card bg-info text-neutral-50 hover:brightness-95 focus:ring-2 focus:ring-info"
          onClick={e => {
            returnFocusRef.current = e.currentTarget
            setIsAddOpen(true)
          }}
        >
          Добавить задачу
        </Button>
      </div>

      <table className="min-w-full bg-neutral-100 rounded shadow-md">
        <thead>
          <tr className="text-left border-b border-neutral-300">
            <th className="p-2">Задача</th>
            <th className="p-2">Исполнитель</th>
            <th className="p-2">Дедлайн</th>
            <th className="p-2">Приоритет</th>
            <th className="p-2">Статус</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {filtered.map(task => {
            const deadlineDate = new Date(task.deadline)
            deadlineDate.setHours(0, 0, 0, 0)
            const overdue = deadlineDate < today
            const todayMatch = deadlineDate.getTime() === today.getTime()
            const deadlineClasses = overdue
              ? 'text-error bg-error/5'
              : todayMatch
                ? 'text-warning'
                : ''

            const priorityClasses: Record<TaskPriority, string> = {
              [TaskPriority.High]: 'bg-error/10 text-error',
              [TaskPriority.Medium]: 'bg-warning/10 text-warning',
              [TaskPriority.Low]: 'bg-success/10 text-success',
            }

            const statusClasses: Record<TaskStatus, string> = {
              [TaskStatus.InProgress]: 'bg-info/10 text-info',
              [TaskStatus.Completed]: 'bg-success/10 text-success',
              [TaskStatus.Pending]: 'bg-neutral-300 text-neutral-900',
            }

            const initials = task.executor
              ? task.executor
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .toUpperCase()
              : ''

            return (
              <tr
                key={task.id}
                tabIndex={-1}
                className="cursor-pointer border-b border-neutral-200 hover:bg-neutral-200/60 transition-colors odd:bg-neutral-100 even:bg-neutral-200"
                onClick={e => {
                  if ((e.target as HTMLElement).closest('button')) return
                  returnFocusRef.current = e.currentTarget as HTMLElement
                  setViewTask(task)
                }}
              >
                <td
                  className="p-2 max-w-[32ch] truncate"
                  title={task.title}
                >
                  {task.title}
                </td>
                <td className="p-2">
                  {task.executor ? (
                    <div
                      className="w-6 h-6 rounded-full bg-neutral-300 text-neutral-900 text-xs font-semibold flex items-center justify-center"
                      title={task.executor}
                    >
                      {initials}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td
                  className={`p-2 ${deadlineClasses}`}
                  title={`Дедлайн: ${deadlineDate.toLocaleDateString('ru-RU')}`}
                >
                  {overdue && <span aria-hidden>⚠️</span>}{' '}
                  {deadlineDate.toLocaleDateString()}
                </td>
                <td className="p-2">
                  <span className={`${chipBase} ${priorityClasses[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="p-2">
                  <span className={`${chipBase} ${statusClasses[task.status]}`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-2">
                  <button
                    ref={openMenuTaskId === task.id ? anchorRef : null}
                    aria-haspopup="menu"
                    aria-expanded={openMenuTaskId === task.id}
                    aria-controls="task-actions-menu"
                    title="Действия"
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const width = 176
                      let left = rect.right - width
                      if (left + width > window.innerWidth)
                        left = window.innerWidth - width
                      if (left < 0) left = 0
                      const top = rect.bottom + 4
                      setMenuPos({ top, left })
                      setAnchorRect(rect)
                      anchorRef.current = e.currentTarget
                      setOpenMenuTaskId(task.id)
                    }}
                    className="p-1 rounded hover:bg-neutral-200 cursor-default"
                  >
                    <HiDotsVertical />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {error && <p className="text-error mt-2">{error.message}</p>}
      {openMenuTaskId !== null &&
        menuPos &&
        createPortal(
          <ul
            id="task-actions-menu"
            role="menu"
            ref={menuRef}
            style={{ position: 'fixed', top: menuPos.top, left: menuPos.left }}
            className="z-50 bg-white rounded-xl shadow-lg border border-neutral-300 py-1 w-44"
            onKeyDown={handleMenuKeyDown}
          >
            <li>
              <button
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-200 focus:bg-neutral-200"
                onClick={() => {
                  const task = tasks.find(t => t.id === openMenuTaskId)
                  if (task) {
                    returnFocusRef.current = anchorRef.current
                    setEditingTask(task)
                  }
                  closeMenu()
                }}
              >
                Редактировать
              </button>
            </li>
            <li>
              <button
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-200 focus:bg-neutral-200 text-error hover:bg-error/10 focus:bg-error/10"
                onClick={() => {
                  closeMenu()
                  setConfirmId(openMenuTaskId)
                }}
              >
                Удалить
              </button>
            </li>
          </ul>,
          document.body,
        )}
      {confirmId !== null &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setConfirmId(null)}
            role="dialog"
            aria-modal
          >
            <div
              className="bg-white p-4 rounded shadow-md"
              onClick={e => e.stopPropagation()}
            >
              <p className="mb-4">Удалить задачу?</p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setConfirmId(null)}
                >
                  Отмена
                </button>
                <button
                  className="px-3 py-1 bg-error text-white rounded"
                  onClick={async () => {
                    await handleDelete(confirmId)
                    setConfirmId(null)
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {viewTask && (
        <TaskInfoModal
          task={viewTask}
          onClose={() => {
            setViewTask(null)
            returnFocusRef.current?.focus()
          }}
        />
      )}
      {isAddOpen && (
        <Modal isOpen onClose={closeAdd} ariaLabelledby="task-form-title">
          <TaskForm
            onSuccess={task => {
              setTasks(prev => [...prev, task])
              closeAdd()
            }}
            onCancel={closeAdd}
          />
        </Modal>
      )}
      {editingTask && (
        <Modal isOpen onClose={closeEdit} ariaLabelledby="task-form-title">
          <TaskForm
            task={editingTask}
            onSuccess={task => {
              setTasks(prev =>
                prev.map(t => (t.id === task.id ? task : t)),
              )
              closeEdit()
            }}
            onCancel={closeEdit}
          />
        </Modal>
      )}
    </div>
  )
}

export default TasksTable

