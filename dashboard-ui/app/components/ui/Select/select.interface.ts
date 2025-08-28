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
  /**
   * Additional classes for the dropdown menu. Allows
   * consumers to control max height/overflow behaviour.
   */
  dropdownClassName?: string
}
