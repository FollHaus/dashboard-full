'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import Field from '@/ui/Field/Field'
import Button from '@/ui/Button/Button'
import {
  IProduct,
  IProductCreate,
} from '@/shared/interfaces/product.interface'
import { ProductService } from '@/services/product/product.service'
import CategoryCombobox from './CategoryCombobox'

interface Props {
  product?: IProduct
  onSuccess: () => void
  onCancel?: () => void
}

export type ProductFormData = Omit<IProductCreate, 'categoryId' | 'categoryName'>

const ProductForm = ({ product, onSuccess, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      articleNumber: product?.articleNumber || '',
      purchasePrice: product?.purchasePrice ?? 0,
      salePrice: product?.salePrice ?? 0,
      remains: product?.remains ?? 0,
    },
  })

  const [category, setCategory] = useState<{ id?: number; name: string } | null>(
    product?.category ? { id: product.category.id, name: product.category.name } : null
  )
  const [catError, setCatError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (data: ProductFormData) => {
    if (!category || !category.name) {
      setCatError('Введите категорию')
      return
    }
    setCatError(null)
    const payload: IProductCreate = {
      ...data,
      ...(category.id
        ? { categoryId: category.id }
        : { categoryName: category.name }),
    }
    try {
      setSubmitting(true)
      if (product) await ProductService.update(product.id, payload)
      else await ProductService.create(payload)
      alert('Товар добавлен')
      onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <Field
        {...register('name', { required: 'Введите название' })}
        placeholder="Название"
        label="Название"
        error={errors.name}
      />
      <CategoryCombobox value={category} onChange={setCategory} error={catError} />
      <Field
        {...register('articleNumber', { required: 'Введите артикул' })}
        placeholder="Артикул"
        label="Артикул"
        error={errors.articleNumber}
      />
      <Field
        type="number"
        {...register('purchasePrice', { valueAsNumber: true })}
        placeholder="Закупочная цена"
        label="Закупочная цена"
        error={errors.purchasePrice}
      />
      <Field
        type="number"
        {...register('salePrice', { valueAsNumber: true })}
        placeholder="Цена продажи"
        label="Цена продажи"
        error={errors.salePrice}
      />
      <Field
        type="number"
        {...register('remains', { valueAsNumber: true })}
        placeholder="Остаток"
        label="Остаток"
        error={errors.remains}
      />
      <div className="flex space-x-2">
        <Button
          type="submit"
          className="bg-primary-500 text-white px-4 py-1"
          disabled={submitting}
        >
          Сохранить
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            className="bg-secondary-500 text-white px-4 py-1"
          >
            Отмена
          </Button>
        )}
      </div>
      {error && <p className="text-error">{error}</p>}
    </form>
  )
}

export default ProductForm

