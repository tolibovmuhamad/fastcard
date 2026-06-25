import { useEffect, useRef, useState } from 'react'
import type { AxiosError } from 'axios'

import { getProducts, addProduct, updateProduct, deleteProduct } from '@/api/products'
import { getCategories, getSubCategories } from '@/api/categories'
import { getBrands } from '@/api/brands'
import { getColors } from '@/api/colors'
import type { Product, Category, SubCategory, Brand, Color } from '@/types/product'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractApiError(err: unknown, fallback: string): string {
  const e = err as AxiosError<{
    message?: string
    title?: string
    errors?: Record<string, string[]>
  }>
  const data = e?.response?.data
  if (data?.errors) return Object.values(data.errors).flat().join('; ')
  return data?.message ?? data?.title ?? (e as Error)?.message ?? fallback
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormState {
  id?: number
  productName: string
  description: string
  code: string
  price: string
  quantity: string
  weight: string
  size: string
  hasDiscount: boolean
  discountPrice: string
  categoryId: string
  subCategoryId: string
  brandId: string
  colorId: string
}

const EMPTY_FORM: FormState = {
  productName: '',
  description: '',
  code: '',
  price: '',
  quantity: '',
  weight: '',
  size: '',
  hasDiscount: false,
  discountPrice: '',
  categoryId: '',
  subCategoryId: '',
  brandId: '',
  colorId: '',
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [colors, setColors] = useState<Color[]>([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string[]>([])

  const fileRef = useRef<HTMLInputElement>(null)

  const filteredSubs = subCategories.filter(
    (s) => !form.categoryId || s.categoryId === Number(form.categoryId)
  )

  async function load() {
    setLoading(true)
    try {
      const [p, c, sc, b, col] = await Promise.all([
        getProducts(),
        getCategories(),
        getSubCategories(),
        getBrands(),
        getColors(),
      ])
      setProducts(p)
      setCategories(c)
      setSubCategories(sc)
      setBrands(b)
      setColors(col)
    } catch (err) {
      setError(extractApiError(err, 'Ошибка загрузки данных'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setError(null)
    setImagePreview([])
    if (fileRef.current) fileRef.current.value = ''
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    const catId = p.subCategory
      ? String(subCategories.find((s) => s.id === p.subCategory!.id)?.categoryId ?? '')
      : ''
    setForm({
      id: p.id,
      productName: p.productName,
      description: p.description,
      code: p.code,
      price: String(p.price),
      quantity: String(p.quantity),
      weight: p.weight ?? '',
      size: p.size ?? '',
      hasDiscount: p.hasDiscount,
      discountPrice: p.discountPrice != null ? String(p.discountPrice) : '',
      categoryId: catId,
      subCategoryId: p.subCategory ? String(p.subCategory.id) : '',
      brandId: p.brand ? String(p.brand.id) : '',
      colorId: p.color ? String(p.color.id) : '',
    })
    setError(null)
    setImagePreview(p.images.slice(0, 3))
    if (fileRef.current) fileRef.current.value = ''
    setDialogOpen(true)
  }

  function handleFileChange() {
    const files = fileRef.current?.files
    if (!files || files.length === 0) {
      setImagePreview(form.id ? [] : [])
      return
    }
    const urls: string[] = []
    Array.from(files).forEach((f) => {
      urls.push(URL.createObjectURL(f))
    })
    setImagePreview(urls)
  }

  function validate(): string | null {
    if (!form.productName.trim()) return 'Введите название товара'
    if (!form.description.trim()) return 'Введите описание'
    if (!form.code.trim()) return 'Введите код товара'
    if (!form.price || Number(form.price) <= 0) return 'Укажите цену больше 0'
    if (!form.quantity || Number(form.quantity) < 0) return 'Укажите количество'
    if (form.hasDiscount && (!form.discountPrice || Number(form.discountPrice) <= 0))
      return 'Укажите цену со скидкой'
    return null
  }

  async function handleSave() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      if (form.id) fd.append('Id', String(form.id))
      fd.append('ProductName', form.productName)
      fd.append('Description', form.description)
      fd.append('Code', form.code)
      fd.append('Price', form.price)
      fd.append('Quantity', form.quantity)
      if (form.weight) fd.append('Weight', form.weight)
      if (form.size) fd.append('Size', form.size)
      fd.append('HasDiscount', String(form.hasDiscount))
      if (form.hasDiscount && form.discountPrice) fd.append('DiscountPrice', form.discountPrice)
      if (form.brandId) fd.append('BrandId', form.brandId)
      if (form.colorId) fd.append('ColorId', form.colorId)
      if (form.subCategoryId) fd.append('SubCategoryId', form.subCategoryId)

      const files = fileRef.current?.files
      if (files) {
        for (let i = 0; i < files.length; i++) {
          fd.append('Images', files[i])
        }
      }

      if (form.id) {
        await updateProduct(fd)
      } else {
        await addProduct(fd)
      }

      setDialogOpen(false)
      await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось сохранить товар'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteProduct(id)
      setDeleteId(null)
      await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось удалить товар'))
    }
  }

  const filtered = search
    ? products.filter((p) => p.productName.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Товары</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} товаров в каталоге
          </p>
        </div>
        <Button onClick={openCreate}>+ Добавить товар</Button>
      </div>

      {error && !dialogOpen && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-2">
        <Input
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? 'Загрузка...' : 'Обновить'}
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">Фото</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Код</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Кол-во</TableHead>
                <TableHead>Подкатегория</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    {search ? `Товары по запросу «${search}» не найдены` : 'Товаров пока нет'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-10 w-10 rounded object-cover bg-muted"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{p.productName}</div>
                      {p.hasDiscount && (
                        <Badge variant="secondary" className="text-xs mt-0.5">
                          Скидка
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {p.code}
                    </TableCell>
                    <TableCell>
                      {p.hasDiscount && p.discountPrice != null ? (
                        <div>
                          <span className="font-medium text-destructive">${p.discountPrice}</span>
                          <span className="text-muted-foreground line-through text-xs ml-1">
                            ${p.price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium">${p.price}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          p.quantity === 0 ? 'text-destructive font-medium' : ''
                        }
                      >
                        {p.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.subCategory?.subCategoryName ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.brand?.brandName ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(p.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ─── Product form dialog ──────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.id ? `Редактировать товар #${form.id}` : 'Добавить товар'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-2">
            {/* Название */}
            <div className="col-span-2 space-y-1">
              <Label>
                Название <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.productName}
                onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                placeholder="Например: Apple iPhone 15 Pro"
              />
            </div>

            {/* Описание */}
            <div className="col-span-2 space-y-1">
              <Label>
                Описание <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Подробное описание товара"
              />
            </div>

            {/* Код */}
            <div className="space-y-1">
              <Label>
                Код товара <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="SKU-001"
              />
            </div>

            {/* Цена */}
            <div className="space-y-1">
              <Label>
                Цена ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Количество */}
            <div className="space-y-1">
              <Label>
                Количество <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                placeholder="0"
              />
            </div>

            {/* Вес */}
            <div className="space-y-1">
              <Label>Вес</Label>
              <Input
                value={form.weight}
                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                placeholder="1.5kg"
              />
            </div>

            {/* Размер */}
            <div className="space-y-1">
              <Label>Размер</Label>
              <Input
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                placeholder="M / XL / 42"
              />
            </div>

            {/* Скидка */}
            <div className="flex items-center gap-2 col-span-2 pt-1">
              <Checkbox
                id="hasDiscount"
                checked={form.hasDiscount}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, hasDiscount: !!v, discountPrice: '' }))
                }
              />
              <Label htmlFor="hasDiscount" className="cursor-pointer">
                Есть скидка
              </Label>
            </div>

            {form.hasDiscount && (
              <div className="col-span-2 space-y-1">
                <Label>
                  Цена со скидкой ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountPrice}
                  onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Категория (сначала выбираем родительскую, потом подкатегорию) */}
            <div className="space-y-1">
              <Label>Категория</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, categoryId: v, subCategoryId: '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Подкатегория</Label>
              <Select
                value={form.subCategoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, subCategoryId: v }))}
                disabled={!form.categoryId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      form.categoryId ? 'Выберите подкатегорию' : 'Сначала выберите категорию'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubs.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      Подкатегорий нет
                    </SelectItem>
                  ) : (
                    filteredSubs.map((sub) => (
                      <SelectItem key={sub.id} value={String(sub.id)}>
                        {sub.subCategoryName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Бренд */}
            <div className="space-y-1">
              <Label>Бренд</Label>
              <Select
                value={form.brandId}
                onValueChange={(v) => setForm((f) => ({ ...f, brandId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите бренд" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Цвет */}
            <div className="space-y-1">
              <Label>Цвет</Label>
              <Select
                value={form.colorId}
                onValueChange={(v) => setForm((f) => ({ ...f, colorId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите цвет" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.colorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Изображения */}
            <div className="col-span-2 space-y-2">
              <Label>Изображения</Label>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground
                  file:mr-3 file:rounded file:border file:bg-background
                  file:px-3 file:py-1 file:text-sm file:cursor-pointer"
              />
              {imagePreview.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1">
                  {imagePreview.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-16 w-16 rounded object-cover border"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : form.id ? 'Сохранить изменения' : 'Добавить товар'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete confirmation dialog ───────────────────────────────────── */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить товар?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Это действие необратимо. Товар будет удалён с сервера.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
