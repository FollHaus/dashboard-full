import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import TasksTable from './TasksTable'
import { server } from '@/tests/mocks/server'

describe('TasksTable', () => {
  it('renders tasks from API (happy path)', async () => {
    render(<TasksTable />)
    expect(await screen.findByText('Task 1')).toBeInTheDocument()
  })

  it('shows error on API failure', async () => {
    server.use(
      http.get('http://localhost:4000/api/task', () => HttpResponse.error())
    )
    render(<TasksTable />)
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument())
  })

  it('handles empty data', async () => {
    server.use(
      http.get('http://localhost:4000/api/task', () => HttpResponse.json([]))
    )
    render(<TasksTable />)
    await waitFor(() => {
      const rows = screen.queryAllByRole('row')
      // header + no data
      expect(rows).toHaveLength(1)
    })
  })

  it('filters by priority', async () => {
    render(<TasksTable />)
    await screen.findByText('Task 1')
    const select = screen.getByRole('combobox', { name: /приоритет/i })
    await userEvent.selectOptions(select, 'Высокий')
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  it('deletes a task', async () => {
    render(<TasksTable />)
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
})
