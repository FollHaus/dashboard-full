'use client'

import { useForm } from 'react-hook-form'
import Field from '@/ui/Field/Field'
import Button from '@/ui/Button/Button'

interface Props {
  product: {
    purchasePrice: number
    salePrice: number
    remains: number
  }
  onSave: (data: FormData) => Promise<void> | void
  onCancel: () => void
}

interface FormData {
  purchasePrice: number
  salePrice: number
  remains: number
}

const EditProductForm = ({ product, onSave, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      remains: product.remains,
    },
  })

  const onSubmit = async (data: FormData) => {
    await onSave(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field
        type="text"
        inputMode="decimal"
        step="0.01"
        min="0"
        {...register('purchasePrice', {
          setValueAs: v => {
            const normalized = String(v).replace(',', '.')
            const num = parseFloat(normalized)
            return isNaN(num) ? undefined : num
          },
          validate: {
            nonNegative: v =>
              v === undefined || v >= 0 || 'Цена не может быть отрицательной',
          },
        })}
        label="Закупочная цена"
        error={errors.purchasePrice}
      />
      <Field
        type="text"
        inputMode="decimal"
        step="0.01"
        min="0"
        {...register('salePrice', {
          setValueAs: v => {
            const normalized = String(v).replace(',', '.')
            const num = parseFloat(normalized)
            return isNaN(num) ? undefined : num
          },
          validate: {
            nonNegative: v =>
              v === undefined || v >= 0 || 'Цена не может быть отрицательной',
          },
        })}
        label="Цена продажи"
        error={errors.salePrice}
      />
      <Field
        type="number"
        min="0"
        {...register('remains', {
          valueAsNumber: true,
          min: { value: 0, message: 'Значение не может быть отрицательным' },
        })}
        onWheel={e => e.currentTarget.blur()}
        label="Остаток"
        error={errors.remains}
      />
      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          className="bg-primary-500 text-white px-4 py-1"
          disabled={!isValid || isSubmitting}
        >
          Сохранить
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="bg-secondary-500 text-white px-4 py-1"
          disabled={isSubmitting}
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}

export default EditProductForm

