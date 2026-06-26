import { HeadphonesIcon, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

const STATS = [
  { value: '10.5k', labelKey: 'about.statSellers' },
  { value: '33k', labelKey: 'about.statSales' },
  { value: '45.5k', labelKey: 'about.statCustomers' },
  { value: '25k', labelKey: 'about.statGrossSale' },
]

const VALUES = [
  { Icon: Truck, titleKey: 'about.valueDeliveryTitle', descKey: 'about.valueDeliveryDesc' },
  { Icon: HeadphonesIcon, titleKey: 'about.valueSupportTitle', descKey: 'about.valueSupportDesc' },
  { Icon: ShieldCheck, titleKey: 'about.valueGuaranteeTitle', descKey: 'about.valueGuaranteeDesc' },
  { Icon: RotateCcw, titleKey: 'about.valueReturnsTitle', descKey: 'about.valueReturnsDesc' },
]

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-20">

      {/* ── Hero ── */}
      <section className="grid gap-12 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">{t('about.ourStory')}</h1>
          <p className="text-muted-foreground leading-relaxed">
            <Trans i18nKey="about.story1" components={{ brand: <strong /> }} />
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t('about.story2')}
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
              key={stat.labelKey}
              className="flex flex-col items-center justify-center rounded-xl border bg-card p-6 text-center shadow-sm transition-colors hover:bg-destructive hover:text-white group"
            >
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ценности ── */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ Icon, titleKey, descKey }) => (
            <div key={titleKey} className="flex flex-col items-center text-center gap-4 p-6">
              <span className="flex size-16 items-center justify-center rounded-full bg-foreground text-background">
                <Icon className="size-7" />
              </span>
              <div>
                <p className="font-bold text-sm">{t(titleKey)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
