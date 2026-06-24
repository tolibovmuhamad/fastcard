/**
 * Централизованные пути маршрутов.
 * Единый источник для роутера, навигации и guard-ов (Этап 2.7).
 */
export const ROUTES = {
  home: '/',
  products: '/products',
  productDetails: (productId: string | number = ':productId') =>
    `/products/${productId}`,
  cart: '/cart',
  checkout: '/checkout',
  account: '/account',
  wishlist: '/wishlist',
  login: '/login',
  register: '/register',
  contact: '/contact',
  about: '/about',
  admin: '/admin',
} as const
