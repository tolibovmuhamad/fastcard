import { useEffect, useState } from 'react'
import { Heart, Minus, Plus, Star, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

import { getProductById, getProducts } from '@/api'
import ProductCard from '@/components/ui/ProductCard'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import type { Product } from '@/types/product'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

export default function ProductDetailsPage() {
  const { t } = useTranslation()
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const addItem = useCartStore((s) => s.addItem)
  const toggleItem = useFavoritesStore((s) => s.toggleItem)
  const isInFavorites = useFavoritesStore((s) => s.isInFavorites)

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState('M')

  const wishlisted = product ? isInFavorites(product.id) : false

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    setError(null)
    getProductById(productId)
      .then((p) => {
        setProduct(p)
        setActiveImage(0)
        // Related: same subcategory or just first page
        return getProducts({
          subCategoryId: p.subCategory?.id,
          pageNumber: 1,
          pageSize: 4,
        })
      })
      .then((rel) => setRelated(rel.filter((r) => r.id !== Number(productId))))
      .catch(() => setError('not-found'))
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex gap-8">
          <div className="flex gap-3">
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="size-16 rounded bg-muted" />)}
            </div>
            <div className="w-72 h-80 rounded bg-muted" />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-7 w-3/4 rounded bg-muted" />
            <div className="h-5 w-1/3 rounded bg-muted" />
            <div className="h-8 w-1/4 rounded bg-muted" />
            <div className="h-20 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center text-muted-foreground">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-lg font-medium">{t('productDetails.notFound')}</p>
        <Link to={ROUTES.products} className="mt-4 inline-block text-brand underline text-sm">
          {t('productDetails.backToCatalog')}
        </Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [null]
  const currentPrice = product.hasDiscount && product.discountPrice != null ? product.discountPrice : product.price
  const originalPrice = product.hasDiscount ? product.price : null
  const inStock = product.quantity > 0

  // Breadcrumb: Home / Category / Product name
  const catName = product.subCategory?.subCategoryName ?? 'Products'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex gap-2 text-sm text-muted-foreground mb-8">
        <Link to={ROUTES.home} className="hover:text-foreground transition-colors">{t('header.account')}</Link>
        <span>/</span>
        <Link to={ROUTES.products} className="hover:text-foreground transition-colors">{catName}</Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{product.productName}</span>
      </nav>

      {/* ── Product detail ── */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  'shrink-0 size-16 rounded-md overflow-hidden border-2 transition-colors bg-[#f5f5f5]',
                  activeImage === i ? 'border-brand' : 'border-transparent'
                )}
              >
                {img ? (
                  <img src={img} alt={t('productDetails.photoAlt', { index: i + 1 })} className="h-full w-full object-contain p-1" />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="w-full md:w-72 lg:w-96 aspect-square rounded-md overflow-hidden bg-[#f5f5f5] flex items-center justify-center">
            {images[activeImage] ? (
              <img
                src={images[activeImage]!}
                alt={product.productName}
                className="h-full w-full object-contain p-6"
              />
            ) : (
              <span className="text-muted-foreground text-sm">{t('common.noImage')}</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">{product.productName}</h1>

          {/* Rating stub */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn('size-4', i < 4 ? 'fill-[#FFAD33] text-[#FFAD33]' : 'fill-muted text-muted')}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{t('productDetails.reviews', { count: 150 })}</span>
            <span className="text-muted-foreground">|</span>
            <span className={cn('text-sm font-medium', inStock ? 'text-green-600' : 'text-destructive')}>
              {inStock ? t('common.inStock') : t('common.outOfStock')}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">${currentPrice.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-lg text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground border-b border-border pb-4">{product.description}</p>
          )}

          {/* Colours */}
          {product.color && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t('productDetails.colours')}</span>
              <button
                className="size-5 rounded-full border-2 border-brand bg-blue-400"
                aria-label="Blue"
              />
              <button
                className="size-5 rounded-full border-2 border-transparent bg-red-500 hover:border-brand transition-colors"
                aria-label="Red"
              />
            </div>
          )}

          {/* Size */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">{t('productDetails.size')}</span>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={cn(
                  'rounded border px-3 py-1 text-sm transition-colors',
                  selectedSize === s
                    ? 'border-brand bg-brand text-white'
                    : 'border-border hover:border-brand'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Add to Cart */}
          {inStock && (
            <button
              onClick={() => product && addItem(product, qty, product.color ?? undefined, selectedSize)}
              className="w-full rounded border border-border py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              {t('common.addToCart')}
            </button>
          )}

          {/* Qty + actions */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center border border-border rounded overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-muted transition-colors"
                aria-label={t('productDetails.decrease')}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                className="px-3 py-2 hover:bg-muted transition-colors"
                aria-label={t('productDetails.increase')}
              >
                <Plus className="size-4" />
              </button>
            </div>

            <button
              disabled={!inStock}
              onClick={() => {
                if (product) {
                  addItem(product, qty, product.color ?? undefined, selectedSize)
                  navigate(ROUTES.checkout)
                }
              }}
              className="flex-1 rounded bg-brand py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {t('common.buyNow')}
            </button>

            <button
              onClick={() => product && toggleItem(product)}
              aria-label={wishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')}
              className={cn(
                'flex size-10 items-center justify-center rounded border transition-colors',
                wishlisted ? 'bg-brand text-white border-brand' : 'border-border hover:border-brand'
              )}
            >
              <Heart className={cn('size-5', wishlisted && 'fill-white')} />
            </button>
          </div>

          {/* Delivery info */}
          <div className="mt-4 rounded-md border border-border divide-y divide-border">
            <div className="flex items-start gap-4 p-4">
              <Truck className="size-8 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('productDetails.freeDelivery')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('productDetails.freeDeliveryDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <Truck className="size-8 shrink-0 rotate-180" />
              <div>
                <p className="text-sm font-medium">{t('productDetails.returnDelivery')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('productDetails.returnDeliveryDesc')} <span className="underline cursor-pointer">{t('productDetails.details')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Items ── */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-4 h-8 rounded-sm bg-brand inline-block" />
            <span className="text-sm font-semibold text-brand">{t('productDetails.relatedItem')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
