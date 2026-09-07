import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage, SignUpPage, SetupPage } from '@/pages/AuthPages'
import { DashboardPage } from '@/pages/DashboardPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { SoldPage } from '@/pages/SoldPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AddProductPage, EditProductPage, ProductDetailPage } from '@/pages/ProductPages'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ALLOW_GUEST } from '@/lib/guest'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/setup" element={<SetupPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/new" element={<AddProductPage />} />
              <Route path="/inventory/:id" element={<ProductDetailPage />} />
              <Route path="/inventory/:id/edit" element={<EditProductPage />} />
              <Route path="/sold" element={<SoldPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route
            path="/"
            element={
              <Navigate
                to={isSupabaseConfigured || ALLOW_GUEST ? '/dashboard' : '/setup'}
                replace
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'text-sm font-medium',
          style: {
            borderRadius: '12px',
            background: '#111827',
            color: '#fff',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#16A34A', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#fff' },
          },
        }}
      />
    </AuthProvider>
  )
}
