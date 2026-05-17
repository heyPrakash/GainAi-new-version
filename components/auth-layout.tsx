'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const memberProtectedRoutes = ['/dashboard', '/food-scanner', '/body-scanner']
  const memberAuthRoutes = ['/']
  const gymRoutes = ['/gym-admin', '/join']

  const isMemberProtectedRoute = memberProtectedRoutes.some(r => pathname?.startsWith(r))
  const isMemberAuthRoute = memberAuthRoutes.includes(pathname ?? '')
  const isGymRoute = gymRoutes.some(r => pathname?.startsWith(r))

  useEffect(() => {
    if (loading) return
    // Gym routes handle their own auth — never redirect from here
    if (isGymRoute) return
    // Member not logged in trying to access protected route
    if (!user && isMemberProtectedRoute) {
      router.replace('/')
      return
    }
    // Member logged in on home page — go to dashboard
    if (user && isMemberAuthRoute) {
      router.replace('/dashboard')
      return
    }
  }, [user, loading, pathname])

  if (loading && !isGymRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#00ff88] border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
