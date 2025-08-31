interface Options {
  compact?: boolean
}

export const formatCurrency = (value: number, options: Options = {}) => {
  if (options.compact) {
    return (
      new Intl.NumberFormat('ru-RU', {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value) + ' ₽'
    )
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(value)
}

export default formatCurrency
