'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Gym {
  id: string
  name: string
  slug: string
  location: string
  is_active: boolean
}

interface GymMember {
  id: string
  gym_id: string
  user_id: string | null
  name: string
  phone: string
  is_active: boolean
}

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [gym, setGym] = useState<Gym | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form states
  const [step, setStep] = useState<'check' | 'create'>('check')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('+91')
  const [memberFound, setMemberFound] = useState(false)
  const [checkLoading, setCheckLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  // Create account states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Fetch gym on mount
  useEffect(() => {
    const fetchGym = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('gyms')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        if (fetchError || !data) {
          setError('Invalid or expired invite link.')
          setGym(null)
        } else {
          setGym(data)
        }
      } catch (err) {
        console.error('Error fetching gym:', err)
        setError('Invalid or expired invite link.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchGym()
    }
  }, [slug])

  const handleCheckAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gym || !fullName || !phone) {
      toast.error('Please fill all fields')
      return
    }

    setCheckLoading(true)
    try {
      const { data, error: checkError } = await supabase
        .from('gym_members')
        .select('*')
        .eq('gym_id', gym.id)
        .eq('phone', phone)
        .eq('is_active', true)
        .single()

      if (checkError || !data) {
        setMemberFound(false)
        setError(`❌ Your number isn&apos;t on the list. Ask your gym owner to add you.`)
      } else {
        setMemberFound(true)
        setError('')
        setStep('create')
      }
    } catch (err: any) {
      console.error('Error checking access:', err)
      setMemberFound(false)
      setError(`❌ Your number isn&apos;t on the list. Ask your gym owner to add you.`)
    } finally {
      setCheckLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!gym) {
      toast.error('Gym information not available')
      return
    }

    setCreateLoading(true)
    try {
      // Sign up
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      })

      if (signupError) throw signupError
      if (!signupData.user) throw new Error('Signup failed')

      // Find the member record by phone
      const { data: memberData, error: memberError } = await supabase
        .from('gym_members')
        .select('*')
        .eq('gym_id', gym.id)
        .eq('phone', phone)
        .single()

      if (memberError) throw memberError

      // Update member with user_id
      const { error: updateError } = await supabase
        .from('gym_members')
        .update({ user_id: signupData.user.id })
        .eq('id', memberData.id)

      if (updateError) throw updateError

      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error creating account:', err)
      toast.error(err.message || 'Failed to create account')
    } finally {
      setCreateLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!gym) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invalid Invite Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="GainAi Logo"
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </div>
          <CardTitle className="text-2xl">You&apos;ve been invited to join {gym.name}</CardTitle>
          <CardDescription>
            This gives you free access to GainAi — AI food scanning, body analysis, and workout plans.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'check' ? (
            <form onSubmit={handleCheckAccess} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={checkLoading}
              />
              <Input
                type="tel"
                placeholder="Phone (starts with +91)"
                value={phone}
                onChange={(e) => {
                  let val = e.target.value
                  if (!val.startsWith('+91')) val = '+91'
                  setPhone(val)
                }}
                disabled={checkLoading}
              />

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-semibold rounded-xl hover:opacity-90"
                disabled={checkLoading}
              >
                {checkLoading ? 'Checking...' : 'Check Access'}
              </Button>
            </form>
          ) : memberFound ? (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <p className="text-center text-sm font-semibold text-[#00ff88]">✅ You&apos;re on the list! Create your account below.</p>

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createLoading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={createLoading}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={createLoading}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-semibold rounded-xl hover:opacity-90"
                disabled={createLoading}
              >
                {createLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('check')
                  setError('')
                  setMemberFound(false)
                }}
              >
                Back
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
