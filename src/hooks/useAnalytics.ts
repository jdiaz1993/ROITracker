import { useMemo } from 'react'
import type { Product, DashboardStats, DateRange } from '@/types'
import { getProductNetProfit, getProductRoi, calcRoi } from '@/utils/calculations'
import { subDays, subMonths, subYears, parseISO, isAfter, startOfMonth, format } from 'date-fns'

const UNSOLD: Product['status'][] = ['inventory', 'listed', 'pending', 'returned']

export function useDashboardStats(products: Product[]): DashboardStats {
  return useMemo(() => {
    const totalInvested = products.reduce((sum, p) => sum + Number(p.purchase_price) * p.quantity, 0)

    const unsold = products.filter((p) => UNSOLD.includes(p.status))
    const currentInventoryCount = unsold.reduce((sum, p) => sum + p.quantity, 0)
    const currentInventoryValue = unsold.reduce(
      (sum, p) => sum + Number(p.purchase_price) * p.quantity,
      0
    )

    const sold = products.filter((p) => p.status === 'sold' && p.sold_price != null)
    const totalProfit = sold.reduce((sum, p) => sum + (getProductNetProfit(p) ?? 0), 0)
    const soldPurchaseTotal = sold.reduce((sum, p) => sum + Number(p.purchase_price), 0)
    const averageRoi =
      sold.length === 0
        ? 0
        : sold.reduce((sum, p) => sum + (getProductRoi(p) ?? 0), 0) / sold.length
    const overallReturn = calcRoi(totalProfit, soldPurchaseTotal || totalInvested)

    return {
      totalInvested,
      currentInventoryCount,
      currentInventoryValue,
      totalProfit,
      averageRoi,
      totalSoldCount: sold.length,
      overallReturn,
    }
  }, [products])
}

function rangeStart(range: DateRange): Date | null {
  const now = new Date()
  switch (range) {
    case '30d':
      return subDays(now, 30)
    case '3m':
      return subMonths(now, 3)
    case '6m':
      return subMonths(now, 6)
    case '1y':
      return subYears(now, 1)
    case 'all':
    default:
      return null
  }
}

export function useProfitOverTime(products: Product[], range: DateRange) {
  return useMemo(() => {
    const start = rangeStart(range)
    const sold = products
      .filter((p) => p.status === 'sold' && p.sold_date && p.sold_price != null)
      .filter((p) => {
        if (!start) return true
        return isAfter(parseISO(p.sold_date!), start) || parseISO(p.sold_date!).getTime() === start.getTime()
      })
      .sort((a, b) => (a.sold_date! > b.sold_date! ? 1 : -1))

    const byDay = new Map<string, number>()
    let cumulative = 0

    for (const p of sold) {
      const profit = getProductNetProfit(p) ?? 0
      cumulative += profit
      const key = p.sold_date!
      byDay.set(key, cumulative)
    }

    return Array.from(byDay.entries()).map(([date, profit]) => ({
      date,
      label: format(parseISO(date), 'MMM d'),
      profit,
    }))
  }, [products, range])
}

export function useAnalytics(products: Product[]) {
  return useMemo(() => {
    const sold = products.filter((p) => p.status === 'sold' && p.sold_price != null)

    // Profit & revenue by month
    const monthMap = new Map<string, { profit: number; revenue: number; invested: number }>()
    for (const p of sold) {
      if (!p.sold_date) continue
      const key = format(startOfMonth(parseISO(p.sold_date)), 'yyyy-MM')
      const entry = monthMap.get(key) ?? { profit: 0, revenue: 0, invested: 0 }
      entry.profit += getProductNetProfit(p) ?? 0
      entry.revenue += Number(p.sold_price)
      entry.invested += Number(p.purchase_price)
      monthMap.set(key, entry)
    }
    const byMonth = Array.from(monthMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([month, values]) => ({
        month,
        label: format(parseISO(`${month}-01`), 'MMM yyyy'),
        ...values,
      }))

    // Money invested (all products) by purchase month
    const investMap = new Map<string, number>()
    for (const p of products) {
      if (!p.purchase_date) continue
      const key = format(startOfMonth(parseISO(p.purchase_date)), 'yyyy-MM')
      investMap.set(key, (investMap.get(key) ?? 0) + Number(p.purchase_price) * p.quantity)
    }
    const investedByMonth = Array.from(investMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([month, amount]) => ({
        month,
        label: format(parseISO(`${month}-01`), 'MMM yyyy'),
        amount,
      }))

    // Best / worst by ROI
    const withRoi = sold
      .map((p) => ({ product: p, roi: getProductRoi(p) ?? 0, profit: getProductNetProfit(p) ?? 0 }))
      .sort((a, b) => b.roi - a.roi)

    const best = withRoi.slice(0, 5)
    const worst = [...withRoi].sort((a, b) => a.roi - b.roi).slice(0, 5)

    // Sales by platform
    const platformMap = new Map<string, number>()
    for (const p of sold) {
      const key = p.platform || 'Other'
      platformMap.set(key, (platformMap.get(key) ?? 0) + 1)
    }
    const byPlatform = Array.from(platformMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Inventory by category
    const catMap = new Map<string, number>()
    for (const p of products.filter((x) => x.status !== 'sold')) {
      const key = p.category?.trim() || 'Uncategorized'
      catMap.set(key, (catMap.get(key) ?? 0) + p.quantity)
    }
    const byCategory = Array.from(catMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Average days to sell
    const daysList = sold
      .filter((p) => p.purchase_date && p.sold_date)
      .map((p) => {
        const buy = parseISO(p.purchase_date!).getTime()
        const sell = parseISO(p.sold_date!).getTime()
        return Math.max(0, Math.round((sell - buy) / (1000 * 60 * 60 * 24)))
      })
    const avgDaysToSell =
      daysList.length === 0 ? null : Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length)

    const avgRoi =
      sold.length === 0
        ? 0
        : sold.reduce((sum, p) => sum + (getProductRoi(p) ?? 0), 0) / sold.length

    const totalProfit = sold.reduce((sum, p) => sum + (getProductNetProfit(p) ?? 0), 0)
    let profitWins = 0
    let lossTotal = 0
    let winTotal = 0
    for (const p of sold) {
      const net = getProductNetProfit(p) ?? 0
      if (net >= 0) {
        profitWins += 1
        winTotal += net
      } else {
        lossTotal += Math.abs(net)
      }
    }

    return {
      byMonth,
      investedByMonth,
      best,
      worst,
      byPlatform,
      byCategory,
      avgDaysToSell,
      avgRoi,
      soldCount: sold.length,
      totalProfit,
      winCount: profitWins,
      lossCount: sold.length - profitWins,
      winTotal,
      lossTotal,
    }
  }, [products])
}
