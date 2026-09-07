export type ProductStatus = 'inventory' | 'listed' | 'pending' | 'sold' | 'returned'

export type Platform =
  | 'eBay'
  | 'Whatnot'
  | 'Depop'
  | 'Vinted'
  | 'Poshmark'
  | 'Facebook Marketplace'
  | 'Mercari'
  | 'OfferUp'
  | 'StockX'
  | 'Local Sale'
  | 'Other'

export const PLATFORMS: Platform[] = [
  'eBay',
  'Whatnot',
  'Depop',
  'Vinted',
  'Poshmark',
  'Facebook Marketplace',
  'Mercari',
  'OfferUp',
  'StockX',
  'Local Sale',
  'Other',
]

export const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'inventory', label: 'Inventory' },
  { value: 'listed', label: 'Listed' },
  { value: 'pending', label: 'Pending Sale' },
  { value: 'sold', label: 'Sold' },
  { value: 'returned', label: 'Returned' },
]

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  category: string | null
  description: string | null
  image_url: string | null
  purchase_price: number
  purchase_date: string | null
  estimated_value: number | null
  quantity: number
  platform: string | null
  status: ProductStatus
  sold_price: number | null
  selling_fees: number
  shipping_cost: number
  other_costs: number
  sold_date: string | null
  buyer: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ProductFormData {
  name: string
  category: string
  description: string
  image_url: string
  purchase_price: string
  purchase_date: string
  estimated_value: string
  sold_price: string
  quantity: string
  platform: string
  status: ProductStatus
  notes: string
}

export interface MarkSoldFormData {
  sold_price: string
  sold_date: string
  selling_fees: string
  shipping_cost: string
  other_costs: string
  buyer: string
}

export interface DashboardStats {
  totalInvested: number
  currentInventoryCount: number
  currentInventoryValue: number
  totalProfit: number
  averageRoi: number
  totalSoldCount: number
  overallReturn: number
}

export type SortOption =
  | 'recent'
  | 'oldest'
  | 'highest_cost'
  | 'lowest_cost'
  | 'highest_estimated'
  | 'highest_roi'

export type DateRange = '30d' | '3m' | '6m' | '1y' | 'all'

export type StatusFilter = 'all' | ProductStatus
