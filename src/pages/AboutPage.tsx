import { HeadphonesIcon, RotateCcw, ShieldCheck, Truck } from 'lucide-react'

const STATS = [
  { value: '10.5k', label: 'Sellers active on our site' },
  { value: '33k', label: 'Monthly product sales' },
  { value: '45.5k', label: 'Customers active on our site' },
  { value: '25k', label: 'Annual gross sale on our site' },
]

const VALUES = [
  {
    Icon: Truck,
    title: 'FREE AND FAST DELIVERY',
    description: 'Free delivery for all orders over $140',
  },
  {
    Icon: HeadphonesIcon,
    title: '24/7 CUSTOMER SERVICE',
    description: 'Friendly 24/7 customer support',
  },
  {
    Icon: ShieldCheck,
    title: 'MONEY BACK GUARANTEE',
    description: 'We return money within 30 days',
  },
  {
    Icon: RotateCcw,
    title: 'EASY RETURNS',
    description: 'No-hassle returns within 14 days',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-20">

      {/* ── Hero ── */}
      <section className="grid gap-12 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">Our Story</h1>
          <p className="text-muted-foreground leading-relaxed">
            Launched in 2022, <strong>fastcart</strong> is the premier online shopping destination
            in Tajikistan. We connect thousands of sellers with millions of buyers to create a
            marketplace that is safe, easy and enjoyable for everyone.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our goal is to provide the best experience for both buyers and sellers: from smooth
            product discovery and secure checkout to fast delivery and excellent customer support.
          </p>
        </div>

        {/* Иллюстрация-заглушка */}
        <div className="relative flex items-center justify-center rounded-2xl bg-muted h-72 md:h-80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
          <span className="relative text-7xl select-none" aria-hidden="true">🛒</span>
        </div>
      </section>

      {/* ── Статистика ── */}
      <section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center rounded-xl border bg-card p-6 text-center shadow-sm transition-colors hover:bg-destructive hover:text-white group"
            >
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ценности ── */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center gap-4 p-6">
              <span className="flex size-16 items-center justify-center rounded-full bg-foreground text-background">
                <Icon className="size-7" />
              </span>
              <div>
                <p className="font-bold text-sm">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
