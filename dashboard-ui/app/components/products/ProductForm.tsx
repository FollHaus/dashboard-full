'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import Field from '@/ui/Field/Field'
import Button from '@/ui/Button/Button'
import {
  IProduct,
  IProductCreate,
} from '@/shared/interfaces/product.interface'
import { ProductService } from '@/services/product/product.service'
import { CategoryService } from '@/services/category/category.service'
import { ICategory } from '@/shared/interfaces/category.interface'

interface Props {
  product?: IProduct
  onSuccess: () => void
  onCancel?: () => void
}

export type ProductFormData = IProductCreate

const ProductForm = ({ product, onSuccess, onCancel }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || '',
      categoryName: product?.category?.name || '',
      articleNumber: product?.articleNumber || '',
      purchasePrice: product?.purchasePrice ?? 0,
      salePrice: product?.salePrice ?? 0,
      remains: product?.remains ?? 0,
    },
  })

  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<ICategory[]>([])

  useEffect(() => {
    CategoryService.getAll()
      .then(setCategories)
      .catch(e => setError(e.message))
  }, [])

  const onSubmit = (data: ProductFormData) => {
    const method = product
      ? ProductService.update(product.id, data)
      : ProductService.create(data)

    method
      .then(() => {
        onSuccess()
      })
      .catch(e => setError(e.message))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <Field
        {...register('name', { required: 'Введите название' })}
        placeholder="Название"
        label="Название"
        error={errors.name}
      />
      <Field
        {...register('categoryName', { required: 'Введите категорию' })}
        placeholder="Категория"
        label="Категория"
        list="category-list"
        error={errors.categoryName}
      />
      <datalist id="category-list">
        {categories.map(cat => (
          <option key={cat.id} value={cat.name} />
        ))}
      </datalist>
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
        <Button type="submit" className="bg-primary-500 text-white px-4 py-1">
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

