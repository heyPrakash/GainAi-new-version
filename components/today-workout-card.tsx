'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, Calendar, CheckCircle2, Loader2, X } from 'lucide-react'

interface Props {
  userId: string
  onCreatePlan: () => void
}

interface WorkoutDay {
  day_number: number
  day_name: string
  focus: string
  duration_minutes: number
  exercises: Array<{
    name: string
    sets: number
    reps: string
    rest_seconds: number
    notes: string
  }>
  warm_up: string
  cool_down: string
}

interface WorkoutLog {
  id: string
  plan_id: string
  workout_date: string
  day_name: string
  completed: boolean
  completed_at: string | null
}

interface WorkoutPlan {
  plan: {
    days: WorkoutDay[]
  }
}

export function TodayWorkoutCard({ userId, onCreatePlan }: Props) {
  const [state, setState] = useState<'loading' | 'no-plan' | 'rest-day' | 'not-completed' | 'completed'>('loading')
  const [todayLog, setTodayLog] = useState<WorkoutLog | null>(null)
  const [todayWorkout, setTodayWorkout] = useState<WorkoutDay | null>(null)
  const [showExerciseModal, setShowExerciseModal] = useState(false)

  useEffect(() => {
    const fetchTodayWorkout = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]

        // Fetch today's workout log
        const { data: log, error: logError } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('workout_date', today)
          .single()

        if (logError && logError.code === 'PGRST116') {
          // No workout log for today
          setState('no-plan')
          return
        }

        if (logError) throw logError

        setTodayLog(log)

        // Check if rest day
        if (log.day_name.toLowerCase().includes('rest')) {
          setState('rest-day')
          return
        }

        // Fetch the workout plan to get exercise details
        const { data: planData, error: planError } = await supabase
          .from('workout_plans')
          .select('plan')
          .eq('id', log.plan_id)
          .single()

        if (planError) throw planError

        const plan = planData as WorkoutPlan
        const dayWorkout = plan.plan.days.find(
          (day) => day.day_name === log.day_name
        )

        if (dayWorkout) {
          setTodayWorkout(dayWorkout)
        }

        // Set state based on completion
        setState(log.completed ? 'completed' : 'not-completed')
      } catch (error) {
        console.error('Error fetching workout:', error)
        setState('no-plan')
      }
    }

    fetchTodayWorkout()
  }, [userId])

  const handleMarkComplete = async () => {
    if (!todayLog) return

    try {
      const { error } = await supabase
        .from('workout_logs')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', todayLog.id)

      if (error) throw error

      setState('completed')
    } catch (error) {
      console.error('Error marking workout complete:', error)
    }
  }

  if (state === 'loading') {
    return (
      <Card className="bg-[#111111] border border-white/10 rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#00ff88]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === 'no-plan') {
    return (
      <Card className="bg-[#111111] border border-white/10 rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="text-center">
            <Calendar className="h-8 w-8 text-[#888] mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-1">No Workout Plan Yet</h3>
            <p className="text-xs text-[#888] mb-4">Let AI create your personalized plan</p>
            <Button
              onClick={onCreatePlan}
              className="w-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-semibold"
            >
              Create My Plan ✨
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === 'rest-day') {
    return (
      <Card className="bg-[#111111] border border-white/10 rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">😴</div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Rest Day</h3>
              <p className="text-xs text-[#888]">Recovery is part of the progress. Rest well.</p>
            </div>
            <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-0">
              Rest Day
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state === 'not-completed' && todayWorkout) {
    return (
      <>
        <Card className="bg-[#111111] border border-white/10 rounded-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <Activity className="h-5 w-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{todayWorkout.day_name}</h3>
                <p className="text-xs text-[#888] mt-1">
                  {todayWorkout.exercises.length} exercises · {todayWorkout.duration_minutes} mins
                </p>
              </div>
              <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-0">
                {todayWorkout.focus}
              </Badge>
            </div>

            <Progress value={0} className="h-2 bg-white/10 mb-4" />

            <div className="flex gap-3">
              <Button
                onClick={() => setShowExerciseModal(true)}
                className="flex-1 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-semibold"
              >
                View Today&apos;s Workout →
              </Button>
              <Button
                onClick={handleMarkComplete}
                variant="outline"
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                Mark Complete ✅
              </Button>
            </div>
          </CardContent>
        </Card>

        {showExerciseModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end">
            <div className="w-full bg-[#0a0a0a] border-t border-white/10 rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{todayWorkout.day_name}</h2>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="text-[#888] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Warm-up */}
                <div className="p-4 bg-[#111111] border border-white/10 rounded-xl">
                  <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">
                    Warm-up
                  </p>
                  <p className="text-sm text-white">{todayWorkout.warm_up}</p>
                </div>

                {/* Exercises */}
                {todayWorkout.exercises.map((exercise, idx) => (
                  <div key={idx} className="p-4 bg-[#111111] border border-white/10 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{exercise.name}</h3>
                      <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-0 text-xs">
                        {exercise.sets}x {exercise.reps}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#888] mb-2">Rest: {exercise.rest_seconds}s</p>
                    <p className="text-xs text-[#888]">{exercise.notes}</p>
                  </div>
                ))}

                {/* Cool-down */}
                <div className="p-4 bg-[#111111] border border-white/10 rounded-xl">
                  <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">
                    Cool-down
                  </p>
                  <p className="text-sm text-white">{todayWorkout.cool_down}</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowExerciseModal(false)
                  handleMarkComplete()
                }}
                className="w-full mt-6 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-semibold"
              >
                Mark Complete ✅
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }

  if (state === 'completed' && todayWorkout) {
    return (
      <Card className="bg-[#111111] border border-white/10 rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{todayWorkout.day_name}</h3>
              <p className="text-xs text-[#888] mt-1">Completed Today 🎉</p>
            </div>
            <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-0">
              Done
            </Badge>
          </div>

          <Progress value={100} className="h-2 bg-[#00ff88]/20" />
        </CardContent>
      </Card>
    )
  }

  return null
}
