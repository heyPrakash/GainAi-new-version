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

  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) throw new Error('User not authenticated')

      // convert entered height to centimetres
      const heightInCm =
        (parseInt(heightFeet) * 30.48) +
        (parseInt(heightInches || '0') * 2.54)

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
You are a professional nutritionist and fitness coach.
Calculate PRECISE daily nutrition goals for this specific person:

- Name: ${formData.fullName}
- Age: ${formData.age} years
- Weight: ${formData.weight} kg
- Height: ${heightInCm.toFixed(1)} cm (${heightFeet}ft ${heightInches || 0}in)
- Fitness Goal: ${formData.goal}

Use the Mifflin-St Jeor formula to calculate BMR:
- For males: BMR = 10 × weight + 6.25 × height - 5 × age + 5
- For females: BMR = 10 × weight + 6.25 × height - 5 × age - 161
(assume male if gender not provided)

Then multiply BMR by activity factor 1.55 (moderately active) to get TDEE.

Then adjust based on goal:
- Lose Fat: TDEE - 500 calories
- Build Muscle: TDEE + 300 calories
- Maintain Weight: TDEE exactly

Calculate protein, carbs, fats, fiber based on the adjusted calories:
- Protein: 2g per kg of bodyweight for muscle building, 1.8g for fat loss, 1.6g for maintain
- Fats: 25% of total calories divided by 9
- Carbs: remaining calories divided by 4
- Fiber: 14g per 1000 calories

Respond ONLY with this exact JSON, no markdown, no explanation:
{
  "calorie_goal": <calculated number>,
  "protein_goal": <calculated number>,
  "carbs_goal": <calculated number>,
  "fat_goal": <calculated number>,
  "fiber_goal": <calculated number>,
  "bmr": <calculated number>,
  "tdee": <calculated number>
}
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
        .insert({
          id: user.id,
          name: formData.fullName,
          age: parseInt(formData.age.toString()),
          weight: parseFloat(formData.weight.toString()),
          height: parseFloat(heightInCm.toFixed(1)),
          goal: formData.goal,
          calorie_goal: goals.calorie_goal,
          protein_goal: goals.protein_goal,
          carbs_goal: goals.carbs_goal,
          fat_goal: goals.fat_goal,
          fiber_goal: goals.fiber_goal,
          bmr: goals.bmr,
          tdee: goals.tdee,
        })

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
                Height
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Feet (e.g. 5)"
                  min="3" max="8"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm'
                  required
                />
                <input
                  type="number"
                  placeholder="Inches (e.g. 10)"
                  min="0" max="11"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm'
                  required
                />
              </div>
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
