'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface ProfileFormData {
  fullName: string
  age: number
  weight: number
  goal: 'lose' | 'maintain' | 'gain'
}

export function ProfileSetup() {
  const { user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    age: 25,
    weight: 70,
    goal: 'maintain',
  })

  const [height, setHeight] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) throw new Error('User not authenticated')

      // use provided height in centimetres
      const heightInCm = parseFloat(height)

      let goals = {
        calorie_goal: 0,
        protein_goal: 0,
        carbs_goal: 0,
        fat_goal: 0,
        fiber_goal: 0,
        bmr: 0,
        tdee: 0,
      }

      try {
        const prompt = `
You are a professional nutritionist. Calculate daily nutrition goals for:
- Age: ${formData.age} years
- Weight: ${formData.weight} kg
- Height: ${height} cm
- Goal: ${formData.goal}

Use Mifflin-St Jeor formula:
BMR = 10 × ${formData.weight} + 6.25 × ${height} - 5 × ${formData.age} + 5
TDEE = BMR × 1.55

Adjust for goal:
- Lose Fat: TDEE - 500
- Gain Muscle: TDEE + 300
- Maintain Weight: TDEE

Respond ONLY with raw JSON no markdown:
{"calorie_goal": <number>, "protein_goal": <number>, "carbs_goal": <number>, "fat_goal": <number>, "fiber_goal": <number>}
`
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        )
        const data = await response.json()
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const clean = raw.replace(/```json|```/g, '').trim()
        goals = JSON.parse(clean)
      } catch (aiErr) {
        console.error('Failed to fetch goals from Gemini', aiErr)
        // fallback values when AI fails
        goals = {
          calorie_goal: 2000,
          protein_goal: 150,
          carbs_goal: 250,
          fat_goal: 70,
          fiber_goal: 28,
          bmr: 0,
          tdee: 0,
        }
      }

      const { error: err } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.fullName,
          age: parseInt(formData.age.toString()),
          weight: parseFloat(formData.weight.toString()),
          height: parseFloat(height),
          goal: formData.goal,
          calorie_goal: goals.calorie_goal,
          protein_goal: goals.protein_goal,
          carbs_goal: goals.carbs_goal,
          fat_goal: goals.fat_goal,
          fiber_goal: goals.fiber_goal,
        }, { onConflict: 'id' })

      if (err) throw err
      
      await refreshProfile()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to setup profile'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4'>
      <Card className='w-full max-w-md border-border/50'>
        <CardHeader className='space-y-2 text-center'>
          <CardTitle className='text-2xl'>Complete Your Profile</CardTitle>
          <CardDescription>
            Help us personalize your fitness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-foreground mb-1'>
                Full Name
              </label>
              <input
                type='text'
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none'
                placeholder='Your name'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  Age
                </label>
                <input
                  type='number'
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm'
                  min='13'
                  max='120'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>
                  Weight (kg)
                </label>
                <input
                  type='number'
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm'
                  min='30'
                  step='0.1'
                  required
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-foreground mb-1'>
                Height (cm)
              </label>
              <input
                type='number'
                placeholder='Height in cm (e.g. 175)'
                min='100' max='250'
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-foreground mb-1'>
                Fitness Goal
              </label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm'
                required
              >
                <option value='lose'>Lose Weight</option>
                <option value='maintain'>Maintain Weight</option>
                <option value='gain'>Gain Muscle</option>
              </select>
            </div>


            {error && (
              <div className='rounded-lg border border-red-500/50 bg-red-500/5 p-3'>
                <p className='text-sm text-red-600'>{error}</p>
              </div>
            )}

            <Button
              type='submit'
              disabled={loading}
              className='w-full rounded-lg'
            >
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
