import { Heart } from 'lucide-react'
import { Link } from 'react-router'

import ProductCard from '@/components/ui/ProductCard'
import { ROUTES } from '@/routes/paths'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'

export default function WishlistPage() {
  const { items } = useFavoritesStore()
  const addItem = useCartStore((s) => s.addItem)

  function moveAllToCart() {
    items.forEach((product) => addItem(product, 1))
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Save items you love by clicking the heart icon on any product.
        </p>
        <Link
          to={ROUTES.products}
          className="inline-block rounded bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
        >
          Explore Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex gap-2 text-sm text-muted-foreground mb-8">
        <Link to={ROUTES.home} className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">Wishlist</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">
          Wishlist{' '}
          <span className="text-muted-foreground font-normal">({items.length})</span>
        </h1>
        <button
          onClick={moveAllToCart}
          className="rounded border border-border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Move All To Bag
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
