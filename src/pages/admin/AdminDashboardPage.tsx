import { useEffect, useState } from 'react'

import { getProducts } from '@/api/products'
import { getCategories } from '@/api/categories'
import { getBrands } from '@/api/brands'
import { getColors } from '@/api/colors'
import { useOrderStore } from '@/store/orderStore'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/routes/paths'
import { Link } from 'react-router'

interface Stats {
  products: number
  categories: number
  brands: number
  colors: number
  orders: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const orders = useOrderStore((s) => s.orders)

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getBrands(), getColors()])
      .then(([products, categories, brands, colors]) => {
        setStats({
          products: products.length,
          categories: categories.length,
          brands: brands.length,
          colors: colors.length,
          orders: orders.length,
        })
      })
      .catch(() => setError('Не удалось загрузить статистику'))
  }, [orders.length])

  const cards = stats
    ? [
        { label: 'Товаров', value: stats.products, to: ROUTES.adminProducts },
        { label: 'Категорий', value: stats.categories, to: ROUTES.adminCategories },
        { label: 'Брендов', value: stats.brands, to: null },
        { label: 'Цветов', value: stats.colors, to: null },
        { label: 'Заказов', value: stats.orders, to: ROUTES.adminOrders },
      ]
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Дашборд</h1>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats === null && !error
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
                {card.to && (
                  <Link
                    to={card.to}
                    className="mt-2 block text-xs text-primary hover:underline"
                  >
                    Управление →
                  </Link>
                )}
              </div>
            ))}
      </div>
    </div>
  )
}
