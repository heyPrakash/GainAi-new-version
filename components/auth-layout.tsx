'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AuthScreen } from './auth-screen'
import { ProfileSetup } from './profile-setup'
import { AiChat } from './ai-chat'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, hasProfile, intendedRoute } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Unauthenticated users can view home page and public content
    if (!user) {
      // Allow home page access, redirect scanners to login
      if (pathname.includes('food-scanner') || pathname.includes('body-scanner') || pathname.includes('dashboard')) {
        router.push('/')
      }
      return
    }

    // Authenticated users without profile should see setup form
    if (!hasProfile) {
      if (pathname !== '/' && !pathname.includes('food-scanner') && !pathname.includes('body-scanner')) {
        return
      }
    }

    // Authenticated users with profile should go to dashboard
    if (user && hasProfile && pathname === '/') {
      router.push('/dashboard')
    }
  }, [user, loading, hasProfile, pathname, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  if (!hasProfile) {
    return <ProfileSetup />
  }

  return (
    <>
      {children}
      <AiChat />
    </>
  )
}
