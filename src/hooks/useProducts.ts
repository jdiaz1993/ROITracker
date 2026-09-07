import { useCallback, useEffect, useState } from 'react'
import { fetchProducts } from '@/services/products'
import type { Product } from '@/types'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ALLOW_GUEST, isUsingGuestData } from '@/lib/guest'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured && !(ALLOW_GUEST && isUsingGuestData())) {
      setProducts([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { products, loading, error, refresh, setProducts }
}
