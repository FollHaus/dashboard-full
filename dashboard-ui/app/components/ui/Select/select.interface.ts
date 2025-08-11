export interface ISelectOption {
  value: number
  label: string
}

export interface ISelectProps {
  options: ISelectOption[]
  value: number[]
  onChange: (value: number[]) => void
  placeholder?: string
  loading?: boolean
  error?: string
  onRetry?: () => void
}
