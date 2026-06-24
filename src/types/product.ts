export interface Category {
  id: number
  categoryName: string
  categoryImage: string | null
}

export interface SubCategory {
  id: number
  subCategoryName: string
  categoryId: number
}

export interface Brand {
  id: number
  brandName: string
}

export interface Color {
  id: number
  colorName: string
}

export interface Product {
  id: number
  productName: string
  description: string
  code: string
  price: number
  discountPrice: number | null
  hasDiscount: boolean
  quantity: number
  weight: string | null
  size: string | null
  brand: Brand | null
  color: Color | null
  subCategory: SubCategory | null
  images: string[]
}

export interface ProductsQueryParams {
  productName?: string
  minPrice?: number
  maxPrice?: number
  brandId?: number
  colorId?: number
  categoryId?: number
  subCategoryId?: number
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
