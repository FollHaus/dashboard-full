import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TasksTable from './TasksTable'
import { server } from '@/tests/mocks/server'

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  )
}

describe('TasksTable', () => {
  beforeAll(() => {
    vi.setSystemTime(new Date('2024-01-05'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('renders tasks from API (happy path)', async () => {
    renderWithClient(<TasksTable />)
    expect(await screen.findByText('Task 1')).toBeInTheDocument()
  })

  it('shows error on API failure', async () => {
    server.use(
      http.get('http://localhost:4000/api/task', () => HttpResponse.error())
    )
    renderWithClient(<TasksTable />)
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument())
  })

  it('handles empty data', async () => {
    server.use(
      http.get('http://localhost:4000/api/task', () => HttpResponse.json([]))
    )
    renderWithClient(<TasksTable />)
    await waitFor(() => {
      const rows = screen.queryAllByRole('row')
      // header + no data
      expect(rows).toHaveLength(1)
    })
  })

  it('filters by priority', async () => {
    renderWithClient(<TasksTable />)
    await screen.findByText('Task 1')
    const select = screen.getByRole('combobox', { name: /приоритет/i })
    await userEvent.selectOptions(select, 'Высокий')
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  it('deletes a task', async () => {
    renderWithClient(<TasksTable />)
    const menuBtn = await screen.findByRole('button', { name: /действия/i })
    await userEvent.click(menuBtn)
    const deleteItem = await screen.findByRole('menuitem', { name: /удалить/i })
    await userEvent.click(deleteItem)
    const dialog = await screen.findByRole('dialog')
    const confirm = within(dialog).getByRole('button', { name: /удалить/i })
    await userEvent.click(confirm)
    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument()
    })
  })

  it('opens task info modal on row click and closes with ESC', async () => {
    renderWithClient(<TasksTable />)
    const cell = await screen.findByText('Task 1')
    await userEvent.click(cell)
    const dialog = await screen.findByRole('dialog', { name: /task 1/i })
    expect(dialog).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
