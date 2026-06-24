import type { Product } from './product'

export interface CartItem {
  product: Product
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

export interface BillingInfo {
  firstName: string
  lastName: string
  streetAddress: string
  apartment?: string
  city: string
  phone: string
  email: string
  saveInfo?: boolean
}

export interface Order {
  id: string
  items: CartItem[]
  billing: BillingInfo
  subtotal: number
  shipping: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: string
  createdAt: string
}

export interface CartApiItem {
  id: number
  productId: number
  productName: string
  price: number
  discountPrice: number | null
  count: number
  imageUrl: string | null
}
