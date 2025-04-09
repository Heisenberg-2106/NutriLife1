"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Utensils, Activity, Droplet, TrendingUp, Calendar, Plus } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState({
    name: "Demo User",
    caloriesConsumed: 1850,
    caloriesGoal: 2200,
    waterConsumed: 1500,
    waterGoal: 2500,
    activityMinutes: 35,
    activityGoal: 60,
    weight: 70.5,
    weightGoal: 68,
  })

  // Mock data for charts
  const calorieData = [
    { day: "Mon", calories: 2100 },
    { day: "Tue", calories: 1950 },
    { day: "Wed", calories: 2200 },
    { day: "Thu", calories: 1800 },
    { day: "Fri", calories: 2050 },
    { day: "Sat", calories: 1900 },
    { day: "Sun", calories: 1850 },
  ]

  const weightData = [
    { date: "Week 1", weight: 72.0 },
    { date: "Week 2", weight: 71.5 },
    { date: "Week 3", weight: 71.0 },
    { date: "Week 4", weight: 70.5 },
  ]

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-neon-blue border-t-transparent"></div>
      </div>
    )
  }

  const caloriePercentage = Math.round((userData.caloriesConsumed / userData.caloriesGoal) * 100)
  const waterPercentage = Math.round((userData.waterConsumed / userData.waterGoal) * 100)
  const activityPercentage = Math.round((userData.activityMinutes / userData.activityGoal) * 100)
  const weightLossPercentage = Math.min(
    100,
    Math.round(((userData.weight - userData.weightGoal) / (72 - userData.weightGoal)) * 100),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold neon-text">Dashboard</h1>
        <div className="text-sm text-white/70 mt-2 md:mt-0">
          <Calendar className="inline-block mr-2 h-4 w-4" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphic">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-neon-blue">
                  {userData.caloriesConsumed} <span className="text-sm font-normal">/ {userData.caloriesGoal}</span>
                </div>
                <p className="text-xs text-white/70">kcal consumed today</p>
              </div>
              <Utensils className="h-8 w-8 text-neon-blue" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{caloriePercentage}%</span>
              </div>
              <Progress value={caloriePercentage} className="h-2" />
            </div>
            <div className="mt-4">
              <Button asChild size="sm" className="w-full bg-neon-blue/80 hover:bg-neon-blue animate-glow" style={{ backgroundColor: '#00f0ff' }}>
                <Link href="/nutrition">
                  <Plus className="mr-2 h-4 w-4" />
                  Log Meal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hydration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-neon-purple">
                  {userData.waterConsumed} <span className="text-sm font-normal">/ {userData.waterGoal}</span>
                </div>
                <p className="text-xs text-white/70">ml water consumed</p>
              </div>
              <Droplet className="h-8 w-8 text-neon-purple" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{waterPercentage}%</span>
              </div>
              <Progress value={waterPercentage} className="h-2" />
            </div>
            <div className="mt-4">
              <Button asChild size="sm" className="w-full bg-neon-purple/80 hover:bg-neon-purple animate-glow" style={{ backgroundColor: '#00f0ff' }}>
                <Link href="/hydration">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Water
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-neon-green">
                  {userData.activityMinutes} <span className="text-sm font-normal">/ {userData.activityGoal}</span>
                </div>
                <p className="text-xs text-white/70">minutes active today</p>
              </div>
              <Activity className="h-8 w-8 text-neon-green" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{activityPercentage}%</span>
              </div>
              <Progress value={activityPercentage} className="h-2" />
            </div>
            <div className="mt-4">
              <Button asChild size="sm" className="w-full bg-neon-green/80 hover:bg-neon-green animate-glow" style={{ backgroundColor: '#00f0ff' }}>
                <Link href="/activity">
                  <Plus className="mr-2 h-4 w-4" />
                  Log Activity
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glassmorphic">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Weekly Calorie Intake</CardTitle>
              <CardDescription>Your calorie consumption over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  calories: {
                    label: "Calories",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calorieData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="var(--color-calories)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-calories)", r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Today's Nutrition</CardTitle>
                <CardDescription>Breakdown of your macronutrients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Protein</span>
                      <span>95g / 120g</span>
                    </div>
                    <Progress value={79} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Carbs</span>
                      <span>210g / 250g</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fats</span>
                      <span>55g / 70g</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-white/70">Protein</p>
                        <p className="text-lg font-bold text-neon-blue">25%</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/70">Carbs</p>
                        <p className="text-lg font-bold text-neon-purple">55%</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/70">Fats</p>
                        <p className="text-lg font-bold text-neon-green">20%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest workouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-neon-green/20 flex items-center justify-center mr-3">
                        <Activity className="h-5 w-5 text-neon-green" />
                      </div>
                      <div>
                        <p className="font-medium">Morning Run</p>
                        <p className="text-xs text-white/70">Today, 7:30 AM</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neon-green">350 kcal</p>
                      <p className="text-xs text-white/70">30 mins</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-neon-purple/20 flex items-center justify-center mr-3">
                        <Activity className="h-5 w-5 text-neon-purple" />
                      </div>
                      <div>
                        <p className="font-medium">Yoga Session</p>
                        <p className="text-xs text-white/70">Yesterday, 6:00 PM</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neon-purple">200 kcal</p>
                      <p className="text-xs text-white/70">45 mins</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-neon-blue/20 flex items-center justify-center mr-3">
                        <Activity className="h-5 w-5 text-neon-blue" />
                      </div>
                      <div>
                        <p className="font-medium">Cycling</p>
                        <p className="text-xs text-white/70">Yesterday, 8:30 AM</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neon-blue">400 kcal</p>
                      <p className="text-xs text-white/70">40 mins</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-6 space-y-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
              <CardDescription>Your weight changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  weight: {
                    label: "Weight (kg)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-weight)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-weight)", r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glassmorphic">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weight Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-neon-blue">
                      {userData.weight} <span className="text-sm font-normal">/ {userData.weightGoal} kg</span>
                    </div>
                    <p className="text-xs text-white/70">Current weight</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-neon-blue" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{100 - weightLossPercentage}%</span>
                  </div>
                  <Progress value={100 - weightLossPercentage} className="h-2" />
                </div>
                <div className="mt-4 text-xs text-white/70">
                  <p>2.5 kg to go to reach your goal weight</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/70">Calories</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-neon-purple">2,050</p>
                      <div className="ml-2 flex items-center text-neon-green">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">-150</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/70">Water</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-neon-blue">2,200 ml</p>
                      <div className="ml-2 flex items-center text-neon-green">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">+300</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/70">Activity</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-neon-green">45 min</p>
                      <div className="ml-2 flex items-center text-neon-green">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">+10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-neon-blue/20 flex items-center justify-center mr-3">
                      <span className="text-neon-blue text-xl font-bold">7</span>
                    </div>
                    <div>
                      <p className="font-medium">7-Day Streak</p>
                      <p className="text-xs text-white/70">Logged your nutrition for 7 days in a row</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-neon-purple/20 flex items-center justify-center mr-3">
                      <span className="text-neon-purple text-xl font-bold">5</span>
                    </div>
                    <div>
                      <p className="font-medium">Hydration Hero</p>
                      <p className="text-xs text-white/70">Met your water goal 5 days this week</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-neon-green/20 flex items-center justify-center mr-3">
                      <span className="text-neon-green text-xl font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">First Milestone</p>
                      <p className="text-xs text-white/70">Lost your first kg</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

