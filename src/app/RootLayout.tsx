import { Suspense } from 'react'
import { Outlet } from 'react-router'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import PageLoader from '@/components/PageLoader'

export default function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
