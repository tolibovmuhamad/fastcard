import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Headphones, RotateCcw, Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { getCategories, getProducts } from '@/api'
import ProductCard from '@/components/ui/ProductCard'
import { useCountdown } from '@/hooks/useCountdown'
import { ROUTES } from '@/routes/paths'
import type { Category, Product } from '@/types/product'

// Flash Sales заканчиваются через 3 дня и 23 часа
const FLASH_SALE_END = new Date(Date.now() + (3 * 86_400 + 23 * 3_600) * 1_000)

// Категории для Browse By Category (из макета)
const CATEGORY_ICONS: Record<string, string> = {
  Phones: '📱',
  Computers: '💻',
  SmartWatch: '⌚',
  Camera: '📷',
  HeadPhones: '🎧',
  Gaming: '🎮',
}

// Hero-слайды
const HERO_SLIDES = [
  {
    id: 1,
    label: 'iPhone 14 Series',
    title: 'Up to 10% off Voucher',
    cta: 'Shop Now',
    bg: '#000',
    textColor: '#fff',
    image: null,
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  const [flashProducts, setFlashProducts] = useState<Product[]>([])
  const [bestSelling, setBestSelling] = useState<Product[]>([])
  const [exploreProducts, setExploreProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingFlash, setLoadingFlash] = useState(true)
  const [loadingBest, setLoadingBest] = useState(true)
  const [loadingExplore, setLoadingExplore] = useState(true)
  const [loadingCats, setLoadingCats] = useState(true)

  const [heroIndex, setHeroIndex] = useState(0)
  const [catIndex, setCatIndex] = useState(0)
  const flashScrollRef = useRef<HTMLDivElement>(null)
  const countdown = useCountdown(FLASH_SALE_END)

  useEffect(() => {
    getProducts({ pageNumber: 1, pageSize: 5 })
      .then(setFlashProducts)
      .finally(() => setLoadingFlash(false))

    getProducts({ pageNumber: 1, pageSize: 4 })
      .then(setBestSelling)
      .finally(() => setLoadingBest(false))

    getProducts({ pageNumber: 2, pageSize: 8 })
      .then(setExploreProducts)
      .finally(() => setLoadingExplore(false))

    getCategories()
      .then(setCategories)
      .finally(() => setLoadingCats(false))
  }, [])

  const visibleCats = useMemo(() => categories.slice(catIndex * 6, catIndex * 6 + 6), [categories, catIndex])

  function scrollFlash(_dir: 'prev' | 'next') {
    // Flash scroll — пагинация через API будет на Этапе расширения
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────── */}
      <section className="flex gap-0 max-w-6xl mx-auto px-4 py-6">
        {/* Sidebar категорий */}
        <aside className="hidden md:flex flex-col gap-3 w-44 shrink-0 pr-8 border-r border-border text-sm">
          {loadingCats
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-4 rounded bg-muted animate-pulse" />
              ))
            : categories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`${ROUTES.products}?categoryId=${cat.id}`)}
                  className="flex justify-between items-center text-left hover:text-brand transition-colors"
                >
                  {cat.categoryName}
                  <ChevronRight className="size-3 text-muted-foreground" />
                </button>
              ))}
        </aside>

        {/* Hero-баннер */}
        <div className="flex-1 ml-0 md:ml-8 relative overflow-hidden rounded-md bg-black min-h-[280px] md:min-h-[340px]">
          <div className="absolute inset-0 flex flex-col justify-center pl-8 md:pl-12 text-white z-10">
            <p className="text-sm mb-2 opacity-80">{HERO_SLIDES[heroIndex].label}</p>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight max-w-xs">
              {HERO_SLIDES[heroIndex].title}
            </h1>
            <button
              onClick={() => navigate(ROUTES.products)}
              className="mt-6 inline-flex items-center gap-2 underline underline-offset-4 text-sm hover:text-brand transition-colors w-fit"
            >
              {HERO_SLIDES[heroIndex].cta} →
            </button>
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`size-2.5 rounded-full transition-colors ${i === heroIndex ? 'bg-brand' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Flash Sales ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <SectionLabel label="Today's" />
        <div className="flex items-end gap-8 mb-6">
          <h2 className="text-2xl font-semibold">Flash Sales</h2>
          <div className="flex items-end gap-3 text-sm">
            <CountUnit label="Days" value={countdown.days} />
            <Colon />
            <CountUnit label="Hours" value={countdown.hours} />
            <Colon />
            <CountUnit label="Minutes" value={countdown.minutes} />
            <Colon />
            <CountUnit label="Seconds" value={countdown.seconds} />
          </div>
          <div className="ml-auto flex gap-2">
            <ArrowBtn onClick={() => scrollFlash('prev')} dir="left" />
            <ArrowBtn onClick={() => scrollFlash('next')} dir="right" />
          </div>
        </div>

        <div ref={flashScrollRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loadingFlash
            ? Array.from({ length: 5 }, (_, i) => <ProductSkeleton key={i} />)
            : flashProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to={ROUTES.products}
            className="rounded bg-brand px-12 py-3 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </section>

      <Divider />

      {/* ── Browse By Category ────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <SectionLabel label="Categories" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Browse By Category</h2>
          <div className="flex gap-2">
            <ArrowBtn
              onClick={() => setCatIndex((i) => Math.max(0, i - 1))}
              dir="left"
              disabled={catIndex === 0}
            />
            <ArrowBtn
              onClick={() => setCatIndex((i) => i + 1)}
              dir="right"
              disabled={visibleCats.length < 6}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {loadingCats
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-24 rounded-md bg-muted animate-pulse" />
              ))
            : visibleCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`${ROUTES.products}?categoryId=${cat.id}`)}
                  className="group flex flex-col items-center justify-center gap-2 rounded-md border border-border p-4 text-sm hover:border-brand hover:bg-brand hover:text-white transition-all"
                >
                  <span className="text-2xl">
                    {CATEGORY_ICONS[cat.categoryName] ?? '🛍️'}
                  </span>
                  <span className="text-xs font-medium">{cat.categoryName}</span>
                </button>
              ))}
        </div>
      </section>

      <Divider />

      {/* ── Best Selling ──────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <SectionLabel label="This Month" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Best Selling Products</h2>
          <Link
            to={ROUTES.products}
            className="rounded border border-brand px-6 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {loadingBest
            ? Array.from({ length: 4 }, (_, i) => <ProductSkeleton key={i} />)
            : bestSelling.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── Promo Banner ──────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="rounded-md bg-black flex items-center justify-between px-8 md:px-16 py-10 text-white overflow-hidden relative">
          <div className="z-10">
            <p className="text-sm text-brand mb-2">Categories</p>
            <h2 className="text-2xl md:text-4xl font-semibold leading-tight max-w-xs">
              Enhance Your Music Experience
            </h2>
            <div className="mt-4 flex gap-3">
              {['23h', '05m', '59s', '35ms'].map((v) => (
                <span key={v} className="rounded-full bg-white text-black text-xs font-semibold px-3 py-1">
                  {v}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate(ROUTES.products)}
              className="mt-6 rounded bg-brand px-8 py-2 text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              Buy Now!
            </button>
          </div>
          <div className="hidden md:block w-64 h-48 bg-white/5 rounded-full blur-3xl absolute right-32 top-0" />
          <Headphones className="hidden md:block size-40 text-white/20 absolute right-8 top-1/2 -translate-y-1/2" />
        </div>
      </section>

      {/* ── Explore Our Products ──────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <SectionLabel label="Our Products" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Explore Our Products</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {loadingExplore
            ? Array.from({ length: 8 }, (_, i) => <ProductSkeleton key={i} />)
            : exploreProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to={ROUTES.products}
            className="rounded bg-brand px-12 py-3 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* ── New Arrival ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <SectionLabel label="Featured" />
        <h2 className="text-2xl font-semibold mb-6">New Arrival</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 min-h-[400px]">
          {/* Big left tile */}
          <button
            onClick={() => navigate(ROUTES.products)}
            className="col-span-2 row-span-2 rounded-md bg-black flex items-end p-6 text-left group"
          >
            <div className="text-white">
              <h3 className="text-xl font-semibold">PlayStation 5</h3>
              <p className="text-xs text-white/70 mt-1 mb-3">
                Black and White version of the PS5 coming out on sale.
              </p>
              <span className="underline text-sm group-hover:text-brand transition-colors">Shop Now</span>
            </div>
          </button>

          {/* Top right */}
          <button
            onClick={() => navigate(ROUTES.products)}
            className="col-span-2 rounded-md bg-[#0d0d0d] flex items-end p-6 text-left group"
          >
            <div className="text-white">
              <h3 className="font-semibold">Women's Collections</h3>
              <p className="text-xs text-white/70 mt-1 mb-3">Featured woman collections that give you another vibe.</p>
              <span className="underline text-sm group-hover:text-brand transition-colors">Shop Now</span>
            </div>
          </button>

          {/* Bottom right: 2 tiles */}
          <button
            onClick={() => navigate(ROUTES.products)}
            className="rounded-md bg-[#1a1a1a] flex items-end p-4 text-left group"
          >
            <div className="text-white">
              <h3 className="text-sm font-semibold">Speakers</h3>
              <p className="text-xs text-white/70 mt-1 mb-2">Amazon wireless speakers</p>
              <span className="underline text-xs group-hover:text-brand transition-colors">Shop Now</span>
            </div>
          </button>
          <button
            onClick={() => navigate(ROUTES.products)}
            className="rounded-md bg-[#1a1a1a] flex items-end p-4 text-left group"
          >
            <div className="text-white">
              <h3 className="text-sm font-semibold">Perfume</h3>
              <p className="text-xs text-white/70 mt-1 mb-2">GUCCI INTENSE OUD EDP</p>
              <span className="underline text-xs group-hover:text-brand transition-colors">Shop Now</span>
            </div>
          </button>
        </div>
      </section>

      {/* ── Service Advantages ────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <Advantage
            icon={<Truck className="size-10" />}
            title="FREE AND FAST DELIVERY"
            desc="Free delivery for all orders over $140"
          />
          <Advantage
            icon={<Headphones className="size-10" />}
            title="24/7 CUSTOMER SERVICE"
            desc="Friendly 24/7 customer support"
          />
          <Advantage
            icon={<RotateCcw className="size-10" />}
            title="MONEY BACK GUARANTEE"
            desc="We return money within 30 days"
          />
        </div>
      </section>
    </div>
  )
}

// ── Вспомогательные компоненты ─────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="w-4 h-8 rounded-sm bg-brand inline-block" />
      <span className="text-sm font-semibold text-brand">{label}</span>
    </div>
  )
}

function Divider() {
  return <hr className="max-w-6xl mx-auto border-border" />
}

function CountUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl font-bold leading-tight">{String(value).padStart(2, '0')}</span>
    </div>
  )
}

function Colon() {
  return <span className="text-brand font-bold text-lg mb-0.5">:</span>
}

function ArrowBtn({
  onClick,
  dir,
  disabled,
}: {
  onClick: () => void
  dir: 'left' | 'right'
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-full bg-secondary hover:bg-brand hover:text-white disabled:opacity-30 transition-colors"
    >
      {dir === 'left' ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
    </button>
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

function Advantage({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex size-16 items-center justify-center rounded-full bg-foreground text-background">
        {icon}
      </div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  )
}
