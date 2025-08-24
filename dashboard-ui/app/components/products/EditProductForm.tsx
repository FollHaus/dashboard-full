'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Field from '@/ui/Field/Field'
import Button from '@/ui/Button/Button'
import { ProductService } from '@/services/product/product.service'
import { toast } from '@/utils/toast'
import { InventoryList } from '@/shared/interfaces/inventory.interface'
import { isLowStock } from '@/utils/inventoryStats'

interface ProductData {
  id: number
  name: string
  article: string
  minStock?: number
  purchasePrice: number
  salePrice: number
  remains: number
}

interface Props {
  product: ProductData
  onSuccess: (data: ProductData) => void
  onCancel: () => void
}

const toNum = (s: string | number) =>
  typeof s === 'number' ? s : Number(String(s).replace(',', '.'))

const EditProductForm = ({ product, onSuccess, onCancel }: Props) => {
  const queryClient = useQueryClient()

  const initial = useRef<ProductData>(product)

  const [name, setName] = useState(product.name)
  const [article, setArticle] = useState(product.article)
  const [minStock, setMinStock] = useState<string>(
    product.minStock !== undefined ? String(product.minStock) : '',
  )
  const [purchasePrice, setPurchasePrice] = useState<string>(
    String(product.purchasePrice),
  )
  const [salePrice, setSalePrice] = useState<string>(
    String(product.salePrice),
  )
  const [remains, setRemains] = useState<string>(String(product.remains))

  const [nameError, setNameError] = useState<string | null>(null)
  const [articleError, setArticleError] = useState<string | null>(null)
  const [minStockError, setMinStockError] = useState<string | null>(null)
  const [purchasePriceError, setPurchasePriceError] = useState<string | null>(
    null,
  )
  const [salePriceError, setSalePriceError] = useState<string | null>(null)
  const [remainsError, setRemainsError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    initial.current = product
    setName(product.name)
    setArticle(product.article)
    setMinStock(
      product.minStock !== undefined ? String(product.minStock) : '',
    )
    setPurchasePrice(String(product.purchasePrice))
    setSalePrice(String(product.salePrice))
    setRemains(String(product.remains))
    setNameError(null)
    setArticleError(null)
    setMinStockError(null)
    setPurchasePriceError(null)
    setSalePriceError(null)
    setRemainsError(null)
  }, [product.id])

  const validate = () => {
    let valid = true

    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2 || trimmed.length > 150) {
      setNameError('Введите от 2 до 150 символов')
      valid = false
    } else {
      setNameError(null)
    }

    const trimmedArticle = article.trim()
    if (
      !trimmedArticle ||
      trimmedArticle.length < 2 ||
      trimmedArticle.length > 64 ||
      !/^[\p{L}\p{N}\-_.]+$/u.test(trimmedArticle)
    ) {
      setArticleError('Введите корректный артикул')
      valid = false
    } else {
      setArticleError(null)
    }

    if (minStock === '') {
      setMinStockError('Введите целое число не меньше 0')
      valid = false
    } else {
      const n = Number(minStock)
      if (!Number.isInteger(n) || n < 0) {
        setMinStockError('Введите целое число не меньше 0')
        valid = false
      } else {
        setMinStockError(null)
      }
    }

    const p = toNum(purchasePrice)
    if (!Number.isFinite(p) || p < 0) {
      setPurchasePriceError('Введите число не меньше 0')
      valid = false
    } else {
      setPurchasePriceError(null)
    }

    const s = toNum(salePrice)
    if (!Number.isFinite(s) || s < 0) {
      setSalePriceError('Введите число не меньше 0')
      valid = false
    } else {
      setSalePriceError(null)
    }

    if (remains === '') {
      setRemainsError('Введите целое число не меньше 0')
      valid = false
    } else {
      const r = Number(remains)
      if (!Number.isInteger(r) || r < 0) {
        setRemainsError('Введите целое число не меньше 0')
        valid = false
      } else {
        setRemainsError(null)
      }
    }

    return valid
  }

  const isPristine =
    name === initial.current.name &&
    article === initial.current.article &&
    minStock ===
      (initial.current.minStock !== undefined
        ? String(initial.current.minStock)
        : '') &&
    purchasePrice === String(initial.current.purchasePrice) &&
    salePrice === String(initial.current.salePrice) &&
    remains === String(initial.current.remains)

  const handlePriceBlur = (
    setter: (v: string) => void,
    value: string,
  ) => {
    const n = toNum(value)
    if (Number.isFinite(n)) setter(String(n))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const body = {
      name: name.trim(),
      articleNumber: article.trim(),
      minStock: Number(minStock),
      purchasePrice: toNum(purchasePrice),
      salePrice: toNum(salePrice),
      remains: Number(remains),
    }

    const wasLow =
      initial.current.remains > 0 &&
      isLowStock(initial.current.remains, initial.current.minStock)
    const wasOut = initial.current.remains === 0
    const isLow = body.remains > 0 && isLowStock(body.remains, body.minStock)
    const isOut = body.remains === 0
    const deltaLow = (isLow ? 1 : 0) - (wasLow ? 1 : 0)
    const deltaOut = (isOut ? 1 : 0) - (wasOut ? 1 : 0)

    setIsSaving(true)

    // Optimistic cache update
    queryClient.setQueryData(['product', product.id], (old: any) =>
      old ? { ...old, ...body, isLow } : old,
    )

    const lists = queryClient.getQueriesData<InventoryList>({
      queryKey: ['products'],
    })
    lists.forEach(([key, old]) => {
      if (!old) return
      const index = old.items.findIndex(it => it.id === product.id)
      if (index === -1) return
      const filter = (key[1] as any)?.filters?.stock
      const item = old.items[index]
      const wasLowItem =
        item.quantity > 0 && isLowStock(item.quantity, item.minStock)
      const wasOutItem = item.quantity === 0
      const updated = {
        ...item,
        name: body.name,
        code: body.articleNumber,
        minStock: body.minStock,
        purchasePrice: body.purchasePrice,
        price: body.salePrice,
        quantity: body.remains,
      }
      const isLowItem =
        updated.quantity > 0 && isLowStock(updated.quantity, updated.minStock)
      const isOutItem = updated.quantity === 0

      let items = [...old.items]
      let total = old.total
      if (
        (filter === 'low' && !isLowItem) ||
        (filter === 'out' && !isOutItem)
      ) {
        items.splice(index, 1)
        total -= 1
      } else {
        items[index] = updated
      }

      const stats = {
        outOfStock:
          old.stats.outOfStock + (isOutItem ? 1 : 0) - (wasOutItem ? 1 : 0),
        lowStock:
          old.stats.lowStock + (isLowItem ? 1 : 0) - (wasLowItem ? 1 : 0),
      }

      queryClient.setQueryData(key, { ...old, items, total, stats })
    })

    queryClient.setQueryData(['inventory-snapshot'], (old: any) =>
      old
        ? {
            ...old,
            lowStock: (old.lowStock ?? 0) + deltaLow,
            outOfStock: (old.outOfStock ?? 0) + deltaOut,
          }
        : old,
    )

    try {
      await ProductService.update(product.id, body)
      toast.success('Сохранено')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-snapshot'] })
      queryClient.invalidateQueries({ queryKey: ['product', product.id] })
      onSuccess({
        id: product.id,
        name: body.name,
        article: body.articleNumber,
        minStock: body.minStock,
        purchasePrice: body.purchasePrice,
        salePrice: body.salePrice,
        remains: body.remains,
      })
    } catch (err: any) {
      const payload = err?.response?.data?.message
      if (Array.isArray(payload)) {
        payload.forEach((e: any) => {
          const msg = 'Введите число не меньше 0'
          switch (e.property) {
            case 'name':
              setNameError('Введите от 2 до 150 символов')
              break
            case 'articleNumber':
              setArticleError('Введите корректный артикул')
              break
            case 'minStock':
              setMinStockError(msg)
              break
            case 'purchasePrice':
              setPurchasePriceError(msg)
              break
            case 'salePrice':
              setSalePriceError(msg)
              break
            case 'remains':
              setRemainsError(msg)
              break
          }
        })
        toast.error('Проверьте заполнение полей.')
      } else {
        toast.error('Ошибка сохранения')
      }
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-snapshot'] })
      queryClient.invalidateQueries({ queryKey: ['product', product.id] })
    } finally {
      setIsSaving(false)
    }
  }

  const disableSave =
    isSaving ||
    isPristine ||
    !!(
      nameError ||
      articleError ||
      minStockError ||
      purchasePriceError ||
      salePriceError ||
      remainsError
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        id="name"
        label="Название товара"
        value={name}
        onChange={e => {
          setName(e.target.value)
          const trimmed = e.target.value.trim()
          setNameError(
            !trimmed || trimmed.length < 2 || trimmed.length > 150
              ? 'Введите от 2 до 150 символов'
              : null,
          )
        }}
        error={nameError ? { message: nameError } as any : undefined}
      />
      <Field
        id="article"
        label="Артикул"
        placeholder="Например, ABC-123"
        value={article}
        onChange={e => {
          setArticle(e.target.value)
          const trimmed = e.target.value.trim()
          setArticleError(
            !trimmed ||
              trimmed.length < 2 ||
              trimmed.length > 64 ||
              !/^[\p{L}\p{N}\-_.]+$/u.test(trimmed)
              ? 'Введите корректный артикул'
              : null,
          )
        }}
        error={articleError ? ({ message: articleError } as any) : undefined}
        aria-invalid={articleError ? true : undefined}
      />
      <Field
        id="minStock"
        type="number"
        className="appearance-none"
        step={1}
        min={0}
        value={minStock}
        onChange={e => {
          setMinStock(e.target.value)
          const v = e.target.value
          const n = Number(v)
          setMinStockError(
            v === '' || !Number.isInteger(n) || n < 0
              ? 'Введите целое число не меньше 0'
              : null,
          )
        }}
        onWheel={e => e.currentTarget.blur()}
        label="Минимальный остаток"
        error={minStockError ? { message: minStockError } as any : undefined}
      />
      <p className="text-xs text-neutral-500">
        Товар считается «мало», если Остаток ≤ Минимальный остаток.
      </p>
      <Field
        id="purchasePrice"
        type="text"
        inputMode="decimal"
        value={purchasePrice}
        onChange={e => {
          setPurchasePrice(e.target.value)
          const n = toNum(e.target.value)
          setPurchasePriceError(
            !Number.isFinite(n) || n < 0 ? 'Введите число не меньше 0' : null,
          )
        }}
        onBlur={() => handlePriceBlur(setPurchasePrice, purchasePrice)}
        label="Закупочная цена"
        error={
          purchasePriceError
            ? ({ message: purchasePriceError } as any)
            : undefined
        }
      />
      <Field
        id="salePrice"
        type="text"
        inputMode="decimal"
        value={salePrice}
        onChange={e => {
          setSalePrice(e.target.value)
          const n = toNum(e.target.value)
          setSalePriceError(
            !Number.isFinite(n) || n < 0 ? 'Введите число не меньше 0' : null,
          )
        }}
        onBlur={() => handlePriceBlur(setSalePrice, salePrice)}
        label="Цена продажи"
        error={
          salePriceError ? ({ message: salePriceError } as any) : undefined
        }
      />
      <Field
        id="remains"
        type="number"
        className="appearance-none"
        step={1}
        min={0}
        value={remains}
        onChange={e => {
          setRemains(e.target.value)
          const v = e.target.value
          const n = Number(v)
          setRemainsError(
            v === '' || !Number.isInteger(n) || n < 0
              ? 'Введите целое число не меньше 0'
              : null,
          )
        }}
        onWheel={e => e.currentTarget.blur()}
        label="Остаток"
        error={remainsError ? ({ message: remainsError } as any) : undefined}
      />
      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          className="bg-primary-500 text-white px-4 py-1"
          disabled={disableSave}
        >
          {isSaving ? '...' : 'Сохранить'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="bg-secondary-500 text-white px-4 py-1"
          disabled={isSaving}
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}

export default EditProductForm

