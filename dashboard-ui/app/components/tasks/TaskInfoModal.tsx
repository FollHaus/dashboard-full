import { useEffect, useRef, useState, useId } from 'react'
import { createPortal } from 'react-dom'
import {
  ITask,
  TaskPriority,
  TaskStatus,
} from '@/shared/interfaces/task.interface'

const chipBase =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap'

interface Props {
  task: ITask
  onClose: () => void
}

const TaskInfoModal = ({ task, onClose }: Props) => {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    setOpen(true)
    closeRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(task.deadline)
  deadlineDate.setHours(0, 0, 0, 0)
  const overdue = deadlineDate < today
  const todayMatch = deadlineDate.getTime() === today.getTime()
  const deadlineColor = overdue
    ? 'text-error'
    : todayMatch
    ? 'text-warning'
    : 'text-neutral-900'

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

  return createPortal(
    <>
      <div className="fixed inset-0 bg-neutral-950/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal
          aria-labelledby={titleId}
          className={`relative rounded-3xl bg-neutral-200 p-5 md:p-6 shadow-card max-w-lg w-full transition-transform duration-200 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <button
            ref={closeRef}
            aria-label="Закрыть"
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-1 rounded hover:bg-neutral-300"
          >
            ✕
          </button>
          <h2 id={titleId} className="text-lg md:text-xl font-semibold mb-4">
            {task.title}
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-800">Описание</p>
              <p className="text-base text-neutral-900">{task.description || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-800">Исполнитель</p>
              {task.executor ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-300 text-neutral-900 text-sm font-semibold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-base text-neutral-900">{task.executor}</span>
                </div>
              ) : (
                <p className="text-base text-neutral-900">-</p>
              )}
            </div>
            <div>
              <p className="text-sm text-neutral-800">Дедлайн</p>
              <p className={`text-base ${deadlineColor}`}>
                {deadlineDate.toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-800">Приоритет</p>
              <span className={`${chipBase} ${priorityClasses[task.priority]}`}>
                {task.priority}
              </span>
            </div>
            <div>
              <p className="text-sm text-neutral-800">Статус</p>
              <span className={`${chipBase} ${statusClasses[task.status]}`}>
                {task.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default TaskInfoModal

