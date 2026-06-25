import { useEffect, useRef, useState } from 'react'
import type { AxiosError } from 'axios'

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '@/api/categories'
import { getBrands, addBrand, updateBrand, deleteBrand } from '@/api/brands'
import { getColors, addColor, updateColor, deleteColor } from '@/api/colors'
import type { Category, SubCategory, Brand, Color } from '@/types/product'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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

function extractApiError(err: unknown, fallback: string): string {
  const e = err as AxiosError<{ message?: string; title?: string; errors?: Record<string, string[]> }>
  const data = e?.response?.data
  if (data?.errors) return Object.values(data.errors).flat().join('; ')
  return data?.message ?? data?.title ?? (e as Error)?.message ?? fallback
}

// ─── Category section ───────────────────────────────────────────────────────

function CategorySection() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    try {
      setItems(await getCategories())
    } catch (err) {
      setError(extractApiError(err, 'Ошибка загрузки категорий'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setName('')
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setName(cat.categoryName)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim()) { setError('Введите название'); return }
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      if (editing) fd.append('Id', String(editing.id))
      fd.append('CategoryName', name)
      const file = fileRef.current?.files?.[0]
      if (file) fd.append('CategoryImage', file)
      if (editing) {
        await updateCategory(fd)
      } else {
        await addCategory(fd)
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось сохранить категорию'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCategory(id)
      setDeleteId(null)
      await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось удалить категорию'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Категории</h2>
          <p className="text-xs text-muted-foreground">{items.length} категорий</p>
        </div>
        <Button size="sm" onClick={openCreate}>+ Добавить</Button>
      </div>

      {error && !dialogOpen && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Изображение</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Категорий пока нет
                  </TableCell>
                </TableRow>
              ) : items.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-muted-foreground text-xs">{cat.id}</TableCell>
                  <TableCell className="font-medium">{cat.categoryName}</TableCell>
                  <TableCell>
                    {cat.categoryImage
                      ? <img src={cat.categoryImage} alt="" className="h-8 w-8 rounded object-cover" />
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>Изменить</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(cat.id)}>Удалить</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Название *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название категории" />
            </div>
            <div className="space-y-1">
              <Label>Изображение</Label>
              <input ref={fileRef} type="file" accept="image/*"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded file:border file:bg-background file:px-3 file:py-1 file:text-sm file:cursor-pointer" />
            </div>
          </div>
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Удалить категорию?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Удалятся все связанные подкатегории.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && handleDelete(deleteId)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── SubCategory section ─────────────────────────────────────────────────────

function SubCategorySection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SubCategory | null>(null)
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [cats, subs] = await Promise.all([getCategories(), getSubCategories()])
      setCategories(cats)
      setItems(subs)
    } catch (err) {
      setError(extractApiError(err, 'Ошибка загрузки подкатегорий'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setName('')
    setCategoryId('')
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(sub: SubCategory) {
    setEditing(sub)
    setName(sub.subCategoryName)
    setCategoryId(String(sub.categoryId))
    setError(null)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim() || !categoryId) { setError('Заполните все поля'); return }
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateSubCategory({ id: editing.id, subCategoryName: name, categoryId: Number(categoryId) })
      } else {
        await addSubCategory({ subCategoryName: name, categoryId: Number(categoryId) })
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось сохранить подкатегорию'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteSubCategory(id)
      setDeleteId(null)
      await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось удалить подкатегорию'))
    }
  }

  const catName = (id: number) => categories.find((c) => c.id === id)?.categoryName ?? '—'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Подкатегории</h2>
          <p className="text-xs text-muted-foreground">{items.length} подкатегорий</p>
        </div>
        <Button size="sm" onClick={openCreate}>+ Добавить</Button>
      </div>

      {error && !dialogOpen && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Подкатегорий пока нет
                  </TableCell>
                </TableRow>
              ) : items.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="text-muted-foreground text-xs">{sub.id}</TableCell>
                  <TableCell className="font-medium">{sub.subCategoryName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{catName(sub.categoryId)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(sub)}>Изменить</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(sub.id)}>Удалить</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать подкатегорию' : 'Добавить подкатегорию'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Название *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название подкатегории" />
            </div>
            <div className="space-y-1">
              <Label>Категория *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.categoryName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Удалить подкатегорию?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && handleDelete(deleteId)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Brand section ───────────────────────────────────────────────────────────

function BrandSection() {
  const [items, setItems] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      setItems(await getBrands())
    } catch (err) {
      setError(extractApiError(err, 'Ошибка загрузки брендов'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setName(''); setError(null); setDialogOpen(true) }
  function openEdit(b: Brand) { setEditing(b); setName(b.brandName); setError(null); setDialogOpen(true) }

  async function handleSave() {
    if (!name.trim()) { setError('Введите название'); return }
    setSaving(true); setError(null)
    try {
      if (editing) { await updateBrand(editing.id, name) } else { await addBrand(name) }
      setDialogOpen(false); await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось сохранить бренд'))
    } finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    try {
      await deleteBrand(id); setDeleteId(null); await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось удалить бренд'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Бренды</h2>
          <p className="text-xs text-muted-foreground">{items.length} брендов</p>
        </div>
        <Button size="sm" onClick={openCreate}>+ Добавить</Button>
      </div>

      {error && !dialogOpen && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Брендов пока нет
                  </TableCell>
                </TableRow>
              ) : items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-muted-foreground text-xs">{b.id}</TableCell>
                  <TableCell className="font-medium">{b.brandName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(b)}>Изменить</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(b.id)}>Удалить</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать бренд' : 'Добавить бренд'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Название *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название бренда" />
            </div>
          </div>
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Удалить бренд?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && handleDelete(deleteId)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Color section ───────────────────────────────────────────────────────────

function ColorSection() {
  const [items, setItems] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Color | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      setItems(await getColors())
    } catch (err) {
      setError(extractApiError(err, 'Ошибка загрузки цветов'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setName(''); setError(null); setDialogOpen(true) }
  function openEdit(c: Color) { setEditing(c); setName(c.colorName); setError(null); setDialogOpen(true) }

  async function handleSave() {
    if (!name.trim()) { setError('Введите название'); return }
    setSaving(true); setError(null)
    try {
      if (editing) { await updateColor(editing.id, name) } else { await addColor(name) }
      setDialogOpen(false); await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось сохранить цвет'))
    } finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    try {
      await deleteColor(id); setDeleteId(null); await load()
    } catch (err) {
      setError(extractApiError(err, 'Не удалось удалить цвет'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Цвета</h2>
          <p className="text-xs text-muted-foreground">{items.length} цветов</p>
        </div>
        <Button size="sm" onClick={openCreate}>+ Добавить</Button>
      </div>

      {error && !dialogOpen && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Цветов пока нет
                  </TableCell>
                </TableRow>
              ) : items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium">{c.colorName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Изменить</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(c.id)}>Удалить</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать цвет' : 'Добавить цвет'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Название *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название цвета" />
            </div>
          </div>
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Удалить цвет?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && handleDelete(deleteId)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Категории и справочники</h1>
      <CategorySection />
      <Separator />
      <SubCategorySection />
      <Separator />
      <BrandSection />
      <Separator />
      <ColorSection />
    </div>
  )
}
