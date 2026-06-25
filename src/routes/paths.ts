export const ROUTES = {
  home: '/',
  products: '/products',
  productDetails: (productId: string | number = ':productId') =>
    `/products/${productId}`,
  cart: '/cart',
  checkout: '/checkout',
  orderSuccess: (orderId: string = ':orderId') => `/order-success/${orderId}`,
  account: '/account',
  wishlist: '/wishlist',
  login: '/login',
  register: '/register',
  contact: '/contact',
  about: '/about',
  admin: '/admin',
  adminProducts: '/admin/products',
  adminCategories: '/admin/categories',
  adminOrders: '/admin/orders',
} as const
