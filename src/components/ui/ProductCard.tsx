import { Eye, Heart, ShoppingCart, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)
  const toggleItem = useFavoritesStore((s) => s.toggleItem)
  const isInFavorites = useFavoritesStore((s) => s.isInFavorites)
  const favorited = isInFavorites(product.id)

  const image = product.images?.[0] ?? null
  const discountPct =
    product.hasDiscount && product.discountPrice != null && product.price > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null

  return (
    <div className={cn('group relative flex flex-col', className)}>
      {/* Image area */}
      <div className="relative block overflow-hidden rounded-md bg-[#f5f5f5] aspect-square">
        <Link to={ROUTES.productDetails(product.id)} className="block h-full w-full">
          {image ? (
            <img
              src={image}
              alt={product.productName}
              className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              {t('common.noImage')}
            </div>
          )}
        </Link>

        {/* Бейджи */}
        {discountPct !== null && (
          <span className="absolute top-2 left-2 rounded bg-brand px-2 py-0.5 text-xs font-medium text-white">
            -{discountPct}%
          </span>
        )}
        {product.quantity === 0 && (
          <span className="absolute top-2 left-2 rounded bg-foreground px-2 py-0.5 text-xs font-medium text-background">
            {t('common.outOfStock')}
          </span>
        )}

        {/* Hover-кнопки */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => toggleItem(product)}
            aria-label={favorited ? t('product.removeFromWishlist') : t('product.addToWishlist')}
            className={cn(
              'flex size-8 items-center justify-center rounded-full bg-white shadow transition-colors',
              favorited ? 'text-brand' : 'hover:bg-brand hover:text-white'
            )}
          >
            <Heart className={cn('size-4', favorited && 'fill-brand')} />
          </button>
          <Link
            to={ROUTES.productDetails(product.id)}
            aria-label={t('product.quickView')}
            className="flex size-8 items-center justify-center rounded-full bg-white shadow hover:bg-brand hover:text-white transition-colors"
          >
            <Eye className="size-4" />
          </Link>
        </div>

        {/* Add To Cart — появляется при ховере */}
        {product.quantity > 0 && (
          <button
            onClick={() => addItem(product, 1)}
            aria-label={t('common.addToCart')}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-foreground py-2 text-sm font-medium text-background opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ShoppingCart className="size-4" />
            {t('common.addToCart')}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-1">
        <Link
          to={ROUTES.productDetails(product.id)}
          className="line-clamp-2 text-sm font-medium hover:text-brand transition-colors"
        >
          {product.productName}
        </Link>

        <div className="flex items-center gap-2">
          {product.hasDiscount && product.discountPrice != null ? (
            <>
              <span className="text-sm font-semibold text-brand">
                ${product.discountPrice.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(0)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-brand">
              ${product.price.toFixed(0)}
            </span>
          )}
        </div>

        <StarRating rating={4} reviewCount={88} />
      </div>
    </div>
  )
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3',
            i < rating ? 'fill-[#FFAD33] text-[#FFAD33]' : 'fill-muted text-muted'
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground">{t('product.reviews', { count: reviewCount })}</span>
    </div>
  )
}
