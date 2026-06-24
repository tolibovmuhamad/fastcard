import { Navigate, Outlet, useLocation } from 'react-router'

import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  return <Outlet />
}
