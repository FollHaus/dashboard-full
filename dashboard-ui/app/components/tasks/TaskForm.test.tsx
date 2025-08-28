import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './TaskForm'
import { vi } from 'vitest'

vi.mock('@/services/task/task.service', () => ({
  TaskService: {
    create: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve({})),
    getAll: vi.fn(() => Promise.resolve([])),
  },
}))

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('@/utils/toast', () => ({ toast }))

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('TaskForm', () => {
  it('submits new task (happy path)', async () => {
    render(<TaskForm />)
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
    expect(push).toHaveBeenCalledWith('/tasks')
  })

  it('shows validation error', async () => {
    render(<TaskForm />)
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

    render(<TaskForm />)
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
