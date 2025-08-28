import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './TaskForm'
import { vi } from 'vitest'
import { TaskPriority, TaskStatus, ITask } from '@/shared/interfaces/task.interface'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/services/task/task.service', () => ({
  TaskService: {
    create: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve({})),
    getAll: vi.fn(() => Promise.resolve([])),
  },
}))

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('@/utils/toast', () => ({ toast }))

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient()
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('TaskForm', () => {
  it('submits new task (happy path)', async () => {
    const onSuccess = vi.fn()
    renderWithClient(<TaskForm onSuccess={onSuccess} />)
    await userEvent.type(
      screen.getByPlaceholderText('Введите название задачи…'),
      'Test',
    )
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    await userEvent.type(dateInput, '2099-01-01')
    const save = screen.getByRole('button', { name: 'Сохранить' })
    await screen.findByDisplayValue('Test')
    await userEvent.click(save)

    const { TaskService } = await import('@/services/task/task.service')
    expect(TaskService.create).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('submits existing task', async () => {
    const task: ITask = {
      id: 1,
      title: 'Old',
      description: 'Desc',
      executor: 'Exec',
      deadline: '2099-01-01T00:00:00.000Z',
      priority: TaskPriority.Medium,
      status: TaskStatus.Pending,
    }
    const onSuccess = vi.fn()
    renderWithClient(<TaskForm task={task} onSuccess={onSuccess} />)
    await screen.findByDisplayValue('Old')
    const input = screen.getByLabelText('Название задачи')
    await userEvent.clear(input)
    await userEvent.type(input, 'New')
    const save = screen.getByRole('button', { name: 'Сохранить' })
    await userEvent.click(save)
    const { TaskService } = await import('@/services/task/task.service')
    expect(TaskService.update).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows validation error', async () => {
    renderWithClient(<TaskForm />)
    const input = screen.getByLabelText('Название задачи')
    await userEvent.type(input, 'a')
    await userEvent.clear(input)
    expect(
      screen.getByText('Название задачи должно содержать от 2 до 150 символов'),
    ).toBeInTheDocument()
  })

  it('handles submit error', async () => {
    const { TaskService } = await import('@/services/task/task.service')
    ;(TaskService.create as any).mockRejectedValueOnce(new Error('fail'))

    renderWithClient(<TaskForm />)
    await userEvent.type(
      screen.getByPlaceholderText('Введите название задачи…'),
      'Test',
    )
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    await userEvent.type(dateInput, '2099-01-01')
    const save = screen.getByRole('button', { name: 'Сохранить' })
    await userEvent.click(save)
    expect(toast.error).toHaveBeenCalled()
  })
})
