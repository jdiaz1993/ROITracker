import type { Product } from '@/types'

/** Temporary: browse and use the app without signing in. */
export const ALLOW_GUEST = true

export const GUEST_USER_ID = 'guest-local'

const PRODUCTS_KEY = 'flipmargin_guest_products'

/** When true, product CRUD uses localStorage instead of Supabase. */
let usingGuestData = ALLOW_GUEST

export function setUsingGuestData(value: boolean) {
  usingGuestData = value
}

export function isUsingGuestData() {
  return usingGuestData
}

export function readGuestProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Product[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeGuestProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}
