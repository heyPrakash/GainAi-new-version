'use client'

import { useAuth } from '@/lib/auth-context'
import { AuthScreen } from './auth-screen'
import { AiChat } from './ai-chat'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

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

  return (
    <>
      {children}
      <AiChat />
    </>
  )
}
