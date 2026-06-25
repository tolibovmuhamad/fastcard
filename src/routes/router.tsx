import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import AdminLayout from '@/app/AdminLayout'
import RootLayout from '@/app/RootLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailsPage = lazy(() => import('@/pages/ProductDetailsPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const WishlistPage = lazy(() => import('@/pages/WishlistPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      // Публичные маршруты
      { index: true, Component: HomePage },
      { path: 'products', Component: ProductsPage },
      { path: 'products/:productId', Component: ProductDetailsPage },
      { path: 'cart', Component: CartPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'contact', Component: ContactPage },
      { path: 'about', Component: AboutPage },
      // Защищённые маршруты покупателя
      {
        Component: ProtectedRoute,
        children: [
          { path: 'checkout', Component: CheckoutPage },
          { path: 'order-success/:orderId', Component: OrderSuccessPage },
          { path: 'account', Component: AccountPage },
          { path: 'wishlist', Component: WishlistPage },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboardPage },
      { path: 'products', Component: AdminProductsPage },
      { path: 'categories', Component: AdminCategoriesPage },
      { path: 'orders', Component: AdminOrdersPage },
    ],
  },
])
