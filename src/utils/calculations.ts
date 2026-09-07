import type { Product } from '@/types'

/** Total cost basis when sold = purchase + fees + shipping + other */
export function calcTotalCost(
  purchasePrice: number,
  sellingFees = 0,
  shippingCost = 0,
  otherCosts = 0
): number {
  return purchasePrice + sellingFees + shippingCost + otherCosts
}

/** Net profit from a sale */
export function calcNetProfit(
  soldPrice: number,
  purchasePrice: number,
  sellingFees = 0,
  shippingCost = 0,
  otherCosts = 0
): number {
  return soldPrice - purchasePrice - sellingFees - shippingCost - otherCosts
}

/**
 * ROI % = (Net Profit / Purchase Price) * 100
 * Returns 0 when purchase price is 0 to avoid division by zero.
 */
export function calcRoi(netProfit: number, purchasePrice: number): number {
  if (!purchasePrice || purchasePrice === 0) return 0
  return (netProfit / purchasePrice) * 100
}

/** Potential profit before sale (estimated value − purchase price) */
export function calcPotentialProfit(
  estimatedValue: number | null | undefined,
  purchasePrice: number
): number | null {
  if (estimatedValue == null) return null
  return estimatedValue - purchasePrice
}

export function calcPotentialRoi(
  estimatedValue: number | null | undefined,
  purchasePrice: number
): number | null {
  const profit = calcPotentialProfit(estimatedValue, purchasePrice)
  if (profit == null) return null
  return calcRoi(profit, purchasePrice)
}

/** Helpers that work directly on a Product row */
export function getProductNetProfit(product: Product): number | null {
  if (product.status !== 'sold' || product.sold_price == null) return null
  return calcNetProfit(
    product.sold_price,
    product.purchase_price,
    product.selling_fees,
    product.shipping_cost,
    product.other_costs
  )
}

export function getProductRoi(product: Product): number | null {
  const profit = getProductNetProfit(product)
  if (profit == null) return null
  return calcRoi(profit, product.purchase_price)
}

export function getProductTotalCost(product: Product): number {
  if (product.status === 'sold') {
    return calcTotalCost(
      product.purchase_price,
      product.selling_fees,
      product.shipping_cost,
      product.other_costs
    )
  }
  return product.purchase_price
}
