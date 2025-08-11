import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './TaskForm'
import { vi } from 'vitest'

vi.mock('@/services/task/task.service', () => ({
  TaskService: {
    create: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve({})),
  },
}))

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('TaskForm', () => {
  it('submits new task (happy path)', async () => {
    render(<TaskForm />)
    await userEvent.type(screen.getByPlaceholderText('Заголовок'), 'Test')
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    await userEvent.type(dateInput, '2099-01-01')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    const { TaskService } = await import('@/services/task/task.service')
    expect(TaskService.create).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/tasks')
  })

  it('shows validation error', async () => {
    render(<TaskForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(await screen.findByText('Введите заголовок')).toBeInTheDocument()
  })

  it('handles submit error', async () => {
    const { TaskService } = await import('@/services/task/task.service')
    ;(TaskService.create as any).mockRejectedValueOnce(new Error('fail'))

    render(<TaskForm />)
    await userEvent.type(screen.getByPlaceholderText('Заголовок'), 'Test')
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    await userEvent.type(dateInput, '2099-01-01')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByText('fail')).toBeInTheDocument()
  })
})
