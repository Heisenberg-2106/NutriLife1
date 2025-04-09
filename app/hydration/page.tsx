"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Droplet, Plus, Minus, TrendingUp, Calendar as CalendarIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

export default function HydrationPage() {
  const { toast } = useToast()
  const [currentWater, setCurrentWater] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(2500)
  const [waterHistory, setWaterHistory] = useState<Array<{ day: string; amount: number; date: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [stats, setStats] = useState({
    average: 2130,
    streak: 5,
    score: 8.5,
    trend: "+5%"
  })
  const [date, setDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Get user ID from session
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/auth/session")
        const session = await res.json()
        setUserId(session?.user?.id)
      } catch (error) {
        console.error("Error fetching user session:", error)
      }
    }
    fetchUserId()
  }, [])

  // Fetch hydration data when userId or date changes
  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const dateParam = format(date, 'yyyy-MM-dd')
        const res = await fetch(`/api/hydration?userId=${userId}&date=${dateParam}`)
        const data = await res.json()

        setCurrentWater(data.today?.waterConsumed || 0)
        setDailyGoal(data.today?.waterGoal || 2500)

        // Format weekly data for the chart
        if (data.weekly.length > 0) {
          const formattedData = data.weekly.map((entry: any) => {
            const entryDate = new Date(entry.date)
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            return {
              day: dayNames[entryDate.getDay()],
              amount: entry.waterConsumed,
              date: entry.date
            }
          })
          setWaterHistory(formattedData)
        }

        // Calculate stats
        if (data.weekly.length > 0) {
          const average = Math.round(data.weekly.reduce((sum: number, day: any) => sum + day.waterConsumed, 0) / data.weekly.length)
          const streak = calculateStreak(data.weekly)
          const score = calculateHydrationScore(data.weekly, data.today?.waterGoal || 2500)
          const trend = calculateTrend(data.weekly)
          
          setStats({
            average,
            streak,
            score,
            trend
          })
        }
      } catch (error) {
        console.error("Error fetching hydration data:", error)
        toast({
          title: "Error",
          description: "Failed to load hydration data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, date, toast])

  const addWater = (amount: number) => {
    const newAmount = Math.max(0, currentWater + amount)
    setCurrentWater(newAmount)
  }

  const saveHydrationData = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/hydration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          waterConsumed: currentWater,
          waterGoal: dailyGoal,
          date: date.toISOString()
        }),
      })

      if (!response.ok) throw new Error("Failed to save data")

      // Update local history
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dayName = dayNames[date.getDay()]

      setWaterHistory(prev => {
        const updated = [...prev]
        const dayIndex = updated.findIndex(item => 
          new Date(item.date).toDateString() === date.toDateString()
        )
        if (dayIndex !== -1) {
          updated[dayIndex].amount = currentWater
        } else if (updated.length < 7) {
          updated.push({ 
            day: dayName, 
            amount: currentWater,
            date: date.toISOString()
          })
        }
        return updated
      })

      // Recalculate stats after save
      const newAverage = Math.round(
        [...waterHistory.filter(d => d.day !== dayName), { day: dayName, amount: currentWater }]
          .reduce((sum, day) => sum + day.amount, 0) / 7
      )
      
      setStats(prev => ({
        ...prev,
        average: newAverage
      }))

      toast({
        title: "Success",
        description: "Hydration data saved successfully",
      })
    } catch (error) {
      console.error("Error saving hydration data:", error)
      toast({
        title: "Error",
        description: "Failed to save hydration data",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Helper functions for stats
  const calculateStreak = (weeklyData: any[]) => {
    const sorted = [...weeklyData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    let streak = 0
    const goal = dailyGoal
    const today = new Date().toDateString()
    
    for (const entry of sorted) {
      const entryDate = new Date(entry.date).toDateString()
      if (entry.waterConsumed >= goal || entryDate === today) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const calculateHydrationScore = (weeklyData: any[], goal: number) => {
    if (weeklyData.length === 0) return 0
    
    const totalDays = weeklyData.length
    const metGoalDays = weeklyData.filter(day => day.waterConsumed >= goal).length
    const percentage = (metGoalDays / totalDays) * 100
    
    return Math.min(10, Math.round(percentage / 10))
  }

  const calculateTrend = (weeklyData: any[]) => {
    if (weeklyData.length < 2) return "+0%"
    
    const sorted = [...weeklyData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const lastWeek = sorted.slice(0, 7)
    const thisWeek = sorted.slice(-7)
    
    const lastWeekAvg = lastWeek.reduce((sum, day) => sum + day.waterConsumed, 0) / lastWeek.length
    const thisWeekAvg = thisWeek.reduce((sum, day) => sum + day.waterConsumed, 0) / thisWeek.length
    
    const change = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100
    return `${change >= 0 ? '+' : ''}${Math.round(change)}%`
  }

  const percentComplete = Math.min(100, Math.round((currentWater / dailyGoal) * 100))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold neon-text">Hydration Tracker</h1>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate)
                  setCalendarOpen(false)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Hydration Card */}
        <Card className="glassmorphic lg:col-span-2">
          <CardHeader>
            <CardTitle>{format(date, "PPPP")} Hydration</CardTitle>
            <CardDescription>Track your water intake for the selected day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Circle */}
            <div className="flex flex-col items-center">
              <div className="relative h-48 w-48">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl font-bold text-neon-blue">{currentWater}ml</div>
                  <div className="text-sm text-white/70">of {dailyGoal}ml goal</div>
                </div>
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * percentComplete) / 100}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-white/70">
                  {percentComplete < 50
                    ? date.toDateString() === new Date().toDateString()
                      ? "You're falling behind on your water intake today."
                      : "You were falling behind on your water intake that day."
                    : percentComplete < 100
                      ? date.toDateString() === new Date().toDateString()
                        ? "You're doing well, keep drinking water!"
                        : "You were doing well that day."
                      : date.toDateString() === new Date().toDateString()
                        ? "Great job! You've reached your water goal for today."
                        : "Great job! You reached your water goal that day."}
                </p>
              </div>
            </div>

            {/* Water Controls */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => addWater(250)}
                className="flex items-center gap-2 bg-neon-blue/80 hover:bg-neon-blue animate-glow" 
                style={{ backgroundColor: '#00f0ff' }}
              >
                <Plus className="h-4 w-4" />
                <Droplet className="h-4 w-4" />
                250ml
              </Button>
              <Button
                onClick={() => addWater(500)}
                className="flex items-center gap-2 hover:bg-neon-blue animate-glow" 
                style={{ backgroundColor: '#00f0ff' }}
              >
                <Plus className="h-4 w-4" />
                <Droplet className="h-4 w-4" />
                500ml
              </Button>
              <Button
                onClick={() => addWater(1000)}
                className="flex items-center gap-2 bg-neon-blue/80 hover:bg-neon-blue animate-glow" 
                style={{ backgroundColor: '#00f0ff' }}
              >
                <Plus className="h-4 w-4" />
                <Droplet className="h-4 w-4" />
                1000ml
              </Button>
              <Button
                onClick={() => addWater(-250)}
                variant="outline"
                className="flex items-center gap-2 border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10"
              >
                <Minus className="h-4 w-4" />
                250ml
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current: {currentWater}ml</span>
                <span>Goal: {dailyGoal}ml</span>
              </div>
              <Progress value={percentComplete} className="h-2" />
              <div className="flex justify-between text-xs text-white/70">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={saveHydrationData}
              disabled={isSaving}
              className="w-full mt-4"
            >
              {isSaving ? "Saving..." : "Save Hydration Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Hydration Tips Card */}
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Hydration Tips</CardTitle>
            <CardDescription>Stay hydrated throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-neon-blue/20 p-3">
              <h3 className="font-medium text-neon-blue">Morning Routine</h3>
              <p className="mt-1 text-sm text-white/70">
                Start your day with a glass of water to kickstart your metabolism.
              </p>
            </div>

            <div className="rounded-lg border border-neon-blue/20 p-3">
              <h3 className="font-medium text-neon-blue">Workout Hydration</h3>
              <p className="mt-1 text-sm text-white/70">
                Drink 500ml of water 2 hours before exercise and 250ml every 15 minutes during workout.
              </p>
            </div>

            <div className="rounded-lg border border-neon-blue/20 p-3">
              <h3 className="font-medium text-neon-blue">Hydration Foods</h3>
              <p className="mt-1 text-sm text-white/70">
                Eat water-rich foods like cucumber, watermelon, and oranges to boost hydration.
              </p>
            </div>

            <div className="rounded-lg border border-neon-blue/20 p-3">
              <h3 className="font-medium text-neon-blue">Set Reminders</h3>
              <p className="mt-1 text-sm text-white/70">Set hourly reminders to drink water throughout your workday.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Hydration Chart */}
      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Weekly Hydration</CardTitle>
          <CardDescription>Your water intake over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              amount: {
                label: "Water (ml)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  name="Water Intake" 
                  fill="var(--color-amount)" 
                  barSize={30} 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphic">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Daily Intake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold text-neon-blue">{stats.average}ml</div>
              <div className="ml-2 flex items-center text-neon-green">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{stats.trend}</span>
              </div>
            </div>
            <p className="text-xs text-white/70 mt-1">Compared to last week</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-purple">{stats.streak} days</div>
            <p className="text-xs text-white/70 mt-1">Consecutive days meeting your goal</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hydration Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-green">{stats.score}/10</div>
            <p className="text-xs text-white/70 mt-1">Based on consistency and goal achievement</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}