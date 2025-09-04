import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TaskStatusChart from './TaskStatusChart'

describe('TaskStatusChart', () => {
  it('renders placeholder when there is no data', () => {
    render(
      <TaskStatusChart summary={{ completed: 0, inProgress: 0, pending: 0, overdue: 0 }} />,
    )
    expect(screen.getByText('Нет данных за период')).toBeInTheDocument()
  })
})
