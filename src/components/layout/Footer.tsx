import type { FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Link } from 'react-router'

import { ROUTES } from '@/routes/paths'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from './SocialIcons'

// Колонка «Account» — существующие маршруты витрины.
const ACCOUNT_LINKS = [
  { to: ROUTES.account, label: 'My Account' },
  { to: ROUTES.cart, label: 'Cart' },
  { to: ROUTES.wishlist, label: 'Wishlist' },
  { to: ROUTES.products, label: 'Shop' }, // Shop ведёт в каталог (SOURCES_NOTES §6)
]

// Колонка «Quick Link». Privacy/Terms/FAQ — статические страницы-заглушки
// (решение Этапа 0); отдельных маршрутов пока нет → временно href="#".
const QUICK_LINKS: Array<{ label: string; to?: string; href?: string }> = [
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms Of Use' },
  { href: '#', label: 'FAQ' },
  { to: ROUTES.contact, label: 'Contact' },
]

const SOCIAL = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'Twitter', Icon: TwitterIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'LinkedIn', Icon: LinkedinIcon },
]

export default function Footer() {
  // Подписка на рассылку — вне рамок (нет email-бэкенда, ТЗ §14): форма-заглушка.
  function handleSubscribe(event: FormEvent) {
    event.preventDefault()
  }

  return (
    <footer className="mt-16 bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* Exclusive + подписка */}
        <div className="space-y-4">
          <p className="text-xl font-bold text-white">Exclusive</p>
          <p className="font-medium text-white">Subscribe</p>
          <p className="text-sm">Get 10% off your first order</p>
          <form
            onSubmit={handleSubscribe}
            className="flex items-center rounded-md border border-neutral-500"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              aria-label="Email для подписки"
              className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              aria-label="Подписаться"
              className="px-3 text-white"
            >
              <Send className="size-5" />
            </button>
          </form>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <p className="font-medium text-white">Support</p>
          <address className="space-y-2 text-sm not-italic">
            <p>Dushanbe, Tajikistan.</p>
            <p>support@fastcart.tj</p>
            <p>+992 00 000 00 00</p>
          </address>
        </div>

        {/* Account */}
        <nav className="space-y-4" aria-label="Account">
          <p className="font-medium text-white">Account</p>
          <ul className="space-y-2 text-sm">
            {ACCOUNT_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Link */}
        <nav className="space-y-4" aria-label="Quick Link">
          <p className="font-medium text-white">Quick Link</p>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <Link to={item.to} className="hover:text-white">
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className="hover:text-white">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} fastcart. All rights reserved.</p>
          <ul className="flex items-center gap-5">
            {SOCIAL.map(({ label, Icon }) => (
              <li key={label}>
                <a href="#" aria-label={label} className="hover:text-white">
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
