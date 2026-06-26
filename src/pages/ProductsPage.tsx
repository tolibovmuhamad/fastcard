import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { getBrands, getCategories, getProducts } from '@/api'
import ProductCard from '@/components/ui/ProductCard'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'
import type { Brand, Category, Product } from '@/types/product'

const SORT_OPTIONS = [
  { value: 'popular', labelKey: 'products.sortPopular' },
  { value: 'price_asc', labelKey: 'products.sortPriceAsc' },
  { value: 'price_desc', labelKey: 'products.sortPriceDesc' },
  { value: 'newest', labelKey: 'products.sortNewest' },
]

const CONDITION_OPTIONS = [
  { value: 'Any', labelKey: 'products.conditionAny' },
  { value: 'Brand new', labelKey: 'products.conditionNew' },
  { value: 'Refurbished', labelKey: 'products.conditionRefurbished' },
  { value: 'Old items', labelKey: 'products.conditionOld' },
]
const RATING_OPTIONS = [5, 4, 3, 2]
const PAGE_SIZE = 9

export default function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const qSearch = searchParams.get('q') ?? ''
  const qCategoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  const qBrandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : undefined

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(qCategoryId)
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>(qBrandId)
  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('999999')
  const [condition, setCondition] = useState('Any')
  const [minRating, setMinRating] = useState<number | undefined>()
  const [sort, setSort] = useState('popular')
  const [page, setPage] = useState(1)

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    condition: true,
    rating: true,
  })

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
    getBrands().then(setBrands).catch(() => {})
  }, [])

  useEffect(() => {
    setSelectedCategory(qCategoryId)
    setSelectedBrand(qBrandId)
  }, [qCategoryId, qBrandId])

  const loadProducts = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true)
      setError(null)
      try {
        const data = await getProducts({
          productName: qSearch || undefined,
          categoryId: selectedCategory,
          brandId: selectedBrand,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          pageNumber: pageNum,
          pageSize: PAGE_SIZE,
        })
        if (append) {
          setAllProducts((prev) => [...prev, ...data])
        } else {
          setAllProducts(data)
        }
        setHasMore(data.length === PAGE_SIZE)
      } catch {
        // Маркер ошибки; человекочитаемый текст рендерится через t() ниже.
        setError('load-failed')
      } finally {
        setLoading(false)
      }
    },
    [qSearch, selectedCategory, selectedBrand, minPrice, maxPrice]
  )

  useEffect(() => {
    setPage(1)
    loadProducts(1, false)
  }, [loadProducts])

  useEffect(() => {
    const sorted = [...allProducts]
    if (sort === 'price_asc') sorted.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price))
    else if (sort === 'price_desc') sorted.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price))
    setProducts(sorted)
  }, [allProducts, sort])

  function applyPriceFilter() {
    setPage(1)
    loadProducts(1, false)
  }

  function loadMore() {
    const next = page + 1
    setPage(next)
    loadProducts(next, true)
  }

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }))
  }

  function updateSearch(params: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined) next.delete(k)
      else next.set(k, v)
    }
    setSearchParams(next)
  }

  const filterContent = (
    <div className="flex flex-col gap-5">
      <FilterSection title={t('products.category')} open={openSections.category} onToggle={() => toggleSection('category')}>
        <button
          onClick={() => { setSelectedCategory(undefined); updateSearch({ categoryId: undefined }) }}
          className={cn('text-sm text-left hover:text-brand transition-colors', !selectedCategory && 'text-brand font-medium')}
        >
          {t('products.allProducts')}
        </button>
        {categories.slice(0, 5).map((c) => (
          <button
            key={c.id}
            onClick={() => { setSelectedCategory(c.id); updateSearch({ categoryId: String(c.id) }) }}
            className={cn('text-sm text-left hover:text-brand transition-colors', selectedCategory === c.id && 'text-brand font-medium')}
          >
            {c.categoryName}
          </button>
        ))}
      </FilterSection>

      <FilterSection title={t('products.brands')} open={openSections.brand} onToggle={() => toggleSection('brand')}>
        {brands.slice(0, 5).map((b) => (
          <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selectedBrand === b.id}
              onChange={() => {
                const next = selectedBrand === b.id ? undefined : b.id
                setSelectedBrand(next)
                updateSearch({ brandId: next !== undefined ? String(next) : undefined })
              }}
              className="accent-brand"
            />
            {b.brandName}
          </label>
        ))}
      </FilterSection>

      <FilterSection title={t('products.priceRange')} open={openSections.price} onToggle={() => toggleSection('price')}>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-xs text-muted-foreground">{t('products.min')}</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
              min={0}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-xs text-muted-foreground">{t('products.max')}</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
              min={0}
            />
          </div>
        </div>
        <button
          onClick={applyPriceFilter}
          className="mt-2 w-full rounded border border-brand py-1 text-xs text-brand hover:bg-brand hover:text-white transition-colors"
        >
          {t('common.apply')}
        </button>
      </FilterSection>

      <FilterSection title={t('products.condition')} open={openSections.condition} onToggle={() => toggleSection('condition')}>
        {CONDITION_OPTIONS.map((c) => (
          <label key={c.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="condition" checked={condition === c.value} onChange={() => setCondition(c.value)} className="accent-brand" />
            {t(c.labelKey)}
          </label>
        ))}
      </FilterSection>

      <FilterSection title={t('products.ratings')} open={openSections.rating} onToggle={() => toggleSection('rating')}>
        {RATING_OPTIONS.map((r) => (
          <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={minRating === r}
              onChange={() => setMinRating(minRating === r ? undefined : r)}
              className="accent-brand"
            />
            {'★'.repeat(r)}{'☆'.repeat(5 - r)}
          </label>
        ))}
      </FilterSection>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex gap-2 text-sm text-muted-foreground mb-6">
        <Link to={ROUTES.home} className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <span className="text-foreground">{t('products.breadcrumb')}</span>
      </nav>

      {qSearch && (
        <p className="mb-4 text-sm text-muted-foreground">
          <Trans
            i18nKey="products.searchResults"
            values={{ query: qSearch }}
            components={{ strong: <strong className="text-foreground" /> }}
          />
        </p>
      )}

      <div className="flex gap-8">
        {/* ── Sidebar (десктоп) ── */}
        <aside className="hidden md:flex flex-col gap-5 w-52 shrink-0">
          {filterContent}
        </aside>

        {/* ── Grid ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Кнопка фильтров (мобильный) */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 md:hidden rounded border border-input px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="size-4" />
              {t('products.filters')}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto rounded border border-input bg-background px-3 py-1.5 text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
              ))}
            </select>
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-4xl mb-4">⚠️</span>
              <p className="text-lg font-medium text-destructive">{t('products.errorTitle')}</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{t('products.errorDesc')}</p>
              <button
                onClick={() => loadProducts(1, false)}
                className="rounded bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : loading && products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Array.from({ length: 9 }, (_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-lg font-medium">{t('products.emptyTitle')}</p>
              <p className="text-sm mt-1">{t('products.emptyDesc')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="rounded bg-brand px-12 py-3 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60 transition-colors"
                  >
                    {loading ? t('common.loading') : t('common.moreProducts')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Мобильная панель фильтров */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold">{t('products.filters')}</span>
              <button onClick={() => setFilterOpen(false)} aria-label={t('header.closeMenu')}>
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4">
              {filterContent}
            </div>
            <div className="border-t p-4">
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full rounded bg-brand py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSection({
  title, open, onToggle, children,
}: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="border-b border-border pb-4">
      <button onClick={onToggle} className="flex w-full items-center justify-between text-sm font-semibold mb-3">
        {title}
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {open && <div className="flex flex-col gap-2">{children}</div>}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-square rounded-md bg-muted animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
      <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
    </div>
  )
}
