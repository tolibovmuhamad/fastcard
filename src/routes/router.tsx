import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import AdminLayout from '@/app/AdminLayout'
import RootLayout from '@/app/RootLayout'

// Ленивые страницы — каждая попадает в отдельный чанк (code splitting).
// Suspense-фолбэк находится в лейаутах (RootLayout / AdminLayout).
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailsPage = lazy(() => import('@/pages/ProductDetailsPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const WishlistPage = lazy(() => import('@/pages/WishlistPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const AdminDashboardPage = lazy(
  () => import('@/pages/admin/AdminDashboardPage')
)

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'products', Component: ProductsPage },
      { path: 'products/:productId', Component: ProductDetailsPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'account', Component: AccountPage },
      { path: 'wishlist', Component: WishlistPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'contact', Component: ContactPage },
      { path: 'about', Component: AboutPage },
      // 404 в рамках витрины
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    // Админка (Этап 6); guard роли — Этап 2.7.
    path: '/admin',
    Component: AdminLayout,
    children: [{ index: true, Component: AdminDashboardPage }],
  },
])
