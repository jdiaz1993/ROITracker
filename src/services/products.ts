import { supabase } from '@/lib/supabase'
import {
  GUEST_USER_ID,
  isUsingGuestData,
  readGuestProducts,
  writeGuestProducts,
} from '@/lib/guest'
import type { Product, ProductFormData, ProductStatus, MarkSoldFormData } from '@/types'

function toNumber(value: string, fallback = 0): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

function formToPayload(form: ProductFormData, userId: string) {
  return {
    user_id: userId,
    name: form.name.trim(),
    category: form.category.trim() || null,
    description: form.description.trim() || null,
    image_url: form.image_url || null,
    purchase_price: toNumber(form.purchase_price),
    purchase_date: form.purchase_date || null,
    estimated_value: form.estimated_value ? toNumber(form.estimated_value) : null,
    quantity: Math.max(1, parseInt(form.quantity, 10) || 1),
    platform: form.platform || null,
    status: form.status,
    notes: form.notes.trim() || null,
  }
}

function sortByCreatedDesc(products: Product[]) {
  return [...products].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export async function fetchProducts(): Promise<Product[]> {
  if (isUsingGuestData()) {
    return sortByCreatedDesc(readGuestProducts())
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Product[]
}

export async function fetchProduct(id: string): Promise<Product | null> {
  if (isUsingGuestData()) {
    return readGuestProducts().find((p) => p.id === id) ?? null
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Product | null
}

export async function createProduct(form: ProductFormData, userId: string): Promise<Product> {
  const payload = formToPayload(form, userId)
  const soldExtras =
    form.status === 'sold'
      ? {
          sold_price: form.sold_price ? toNumber(form.sold_price) : null,
          sold_date: new Date().toISOString().slice(0, 10),
        }
      : {}

  if (isUsingGuestData()) {
    const now = new Date().toISOString()
    const product: Product = {
      id: crypto.randomUUID(),
      user_id: GUEST_USER_ID,
      name: payload.name,
      category: payload.category,
      description: payload.description,
      image_url: payload.image_url,
      purchase_price: payload.purchase_price,
      purchase_date: payload.purchase_date,
      estimated_value: payload.estimated_value,
      quantity: payload.quantity,
      platform: payload.platform,
      status: payload.status,
      sold_price: soldExtras.sold_price ?? null,
      selling_fees: 0,
      shipping_cost: 0,
      other_costs: 0,
      sold_date: soldExtras.sold_date ?? null,
      buyer: null,
      notes: payload.notes,
      created_at: now,
      updated_at: now,
    }
    writeGuestProducts([product, ...readGuestProducts()])
    return product
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...payload, ...soldExtras })
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, form: ProductFormData): Promise<Product> {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    category: form.category.trim() || null,
    description: form.description.trim() || null,
    image_url: form.image_url || null,
    purchase_price: toNumber(form.purchase_price),
    purchase_date: form.purchase_date || null,
    estimated_value: form.estimated_value ? toNumber(form.estimated_value) : null,
    quantity: Math.max(1, parseInt(form.quantity, 10) || 1),
    platform: form.platform || null,
    status: form.status,
    notes: form.notes.trim() || null,
  }

  if (form.status === 'sold') {
    payload.sold_price = form.sold_price ? toNumber(form.sold_price) : null
  }

  if (isUsingGuestData()) {
    const products = readGuestProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index < 0) throw new Error('Product not found')
    const updated: Product = {
      ...products[index],
      ...(payload as Omit<Product, 'id' | 'user_id' | 'created_at'>),
      updated_at: new Date().toISOString(),
    }
    products[index] = updated
    writeGuestProducts(products)
    return updated
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function markProductSold(id: string, form: MarkSoldFormData): Promise<Product> {
  const payload = {
    status: 'sold' as ProductStatus,
    sold_price: toNumber(form.sold_price),
    sold_date: form.sold_date,
    selling_fees: toNumber(form.selling_fees),
    shipping_cost: toNumber(form.shipping_cost),
    other_costs: toNumber(form.other_costs),
    buyer: form.buyer.trim() || null,
  }

  if (isUsingGuestData()) {
    const products = readGuestProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index < 0) throw new Error('Product not found')
    const updated: Product = {
      ...products[index],
      ...payload,
      updated_at: new Date().toISOString(),
    }
    products[index] = updated
    writeGuestProducts(products)
    return updated
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string): Promise<void> {
  if (isUsingGuestData()) {
    writeGuestProducts(readGuestProducts().filter((p) => p.id !== id))
    return
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(userId: string, file: File): Promise<string> {
  if (isUsingGuestData()) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Could not read image'))
      reader.readAsDataURL(file)
    })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function updateProfile(userId: string, fullName: string): Promise<void> {
  if (isUsingGuestData()) {
    throw new Error('Sign in to save profile settings')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', userId)

  if (error) throw error
}

export async function fetchProfile(userId: string) {
  if (isUsingGuestData()) {
    return {
      id: GUEST_USER_ID,
      full_name: 'Guest',
      email: 'guest@local',
      created_at: new Date().toISOString(),
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}
