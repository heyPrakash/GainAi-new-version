import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  calorie_goal: number
  protein_goal: number
  carbs_goal?: number
  fat_goal?: number
}

interface FoodScan {
  calories: number
  protein: number
  carbs: number
  fats: number
  scanned_at: string
}

const istDateKey = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))

export async function saveFuelScore(
  userId: string,
  profile: Profile,
  updatedTodayScans: FoodScan[]
) {
  const scoreDate = istDateKey(new Date().toISOString())

  const totalCalories = updatedTodayScans.reduce((s, x) => s + (x.calories ?? 0), 0)
  const totalProtein = updatedTodayScans.reduce((s, x) => s + (x.protein ?? 0), 0)
  const totalCarbs = updatedTodayScans.reduce((s, x) => s + (x.carbs ?? 0), 0)
  const totalFats = updatedTodayScans.reduce((s, x) => s + (x.fats ?? 0), 0)

  const calorieScore = Math.min((totalCalories / (profile.calorie_goal || 1)) * 100, 100) * 0.30
  const proteinScore = Math.min((totalProtein / (profile.protein_goal || 1)) * 100, 100) * 0.30
  const carbsScore = Math.min((totalCarbs / (profile.carbs_goal || 1)) * 100, 100) * 0.20
  const fatsScore = Math.min((totalFats / (profile.fat_goal || 1)) * 100, 100) * 0.20
  const fuelScore = Math.round(calorieScore + proteinScore + carbsScore + fatsScore)

  const { error } = await supabase.from('fuel_scores').upsert(
    {
      user_id: userId,
      score_date: scoreDate,
      fuel_score: fuelScore,
      calorie_score: calorieScore,
      protein_score: proteinScore,
      carbs_score: carbsScore,
      fats_score: fatsScore,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,score_date' }
  )

  if (error) {
    console.error('Error saving fuel score:', error)
  }
}
