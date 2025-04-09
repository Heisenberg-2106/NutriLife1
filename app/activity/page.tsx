"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Activity, Flame, Clock, TrendingUp, Heart, BarChart } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"

export default function ActivityPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activityForm, setActivityForm] = useState({
    type: "",
    duration: "",
    caloriesBurnt: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Mock data
  const activityData = [
    {
      id: 1,
      type: "Running",
      duration: 30,
      caloriesBurnt: 350,
      date: "2023-05-01",
    },
    {
      id: 2,
      type: "Cycling",
      duration: 45,
      caloriesBurnt: 400,
      date: "2023-05-02",
    },
    {
      id: 3,
      type: "Swimming",
      duration: 40,
      caloriesBurnt: 450,
      date: "2023-05-03",
    },
    {
      id: 4,
      type: "Weight Training",
      duration: 60,
      caloriesBurnt: 300,
      date: "2023-05-04",
    },
    {
      id: 5,
      type: "Yoga",
      duration: 50,
      caloriesBurnt: 200,
      date: "2023-05-05",
    },
  ]

  const caloriesTrendData = [
    { date: "Mon", calories: 350 },
    { date: "Tue", calories: 400 },
    { date: "Wed", calories: 450 },
    { date: "Thu", calories: 300 },
    { date: "Fri", calories: 200 },
    { date: "Sat", calories: 500 },
    { date: "Sun", calories: 0 },
  ]

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setActivityForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Activity logged",
        description: "Your activity has been recorded successfully.",
      })
      setActivityForm({
        type: "",
        duration: "",
        caloriesBurnt: "",
        date: new Date().toISOString().split("T")[0],
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold neon-text">Activity Tracker</h1>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glassmorphic">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="log">Log Activity</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glassmorphic">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Flame className="h-5 w-5 text-neon-pink mr-2" />
                  <div className="text-2xl font-bold text-neon-pink">0</div>
                </div>
                <p className="text-xs text-white/70 mt-1">No activity logged today</p>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-neon-green mr-2" />
                  <div className="text-2xl font-bold text-neon-green">1,700</div>
                </div>
                <p className="text-xs text-white/70 mt-1">Calories burnt this week</p>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-neon-blue mr-2" />
                  <div className="text-2xl font-bold text-neon-blue">225</div>
                </div>
                <p className="text-xs text-white/70 mt-1">Minutes active this week</p>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  <p className="text-xs text-white/70">2,500 cal weekly goal</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Calories Burnt Trend</CardTitle>
              <CardDescription>Your activity over the past week</CardDescription>
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
                  <LineChart data={caloriesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="calories" stroke="var(--color-calories)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>Breakdown by activity type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-neon-blue mr-2"></div>
                        Running
                      </span>
                      <span>350 cal (21%)</span>
                    </div>
                    <Progress value={21} className="h-2 bg-white/10">
                      <div className="h-full bg-neon-blue"></div>
                    </Progress>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-neon-green mr-2"></div>
                        Cycling
                      </span>
                      <span>400 cal (24%)</span>
                    </div>
                    <Progress value={24} className="h-2 bg-white/10">
                      <div className="h-full bg-neon-green"></div>
                    </Progress>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-neon-purple mr-2"></div>
                        Swimming
                      </span>
                      <span>450 cal (26%)</span>
                    </div>
                    <Progress value={26} className="h-2 bg-white/10">
                      <div className="h-full bg-neon-purple"></div>
                    </Progress>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-neon-pink mr-2"></div>
                        Weight Training
                      </span>
                      <span>300 cal (18%)</span>
                    </div>
                    <Progress value={18} className="h-2 bg-white/10">
                      <div className="h-full bg-neon-pink"></div>
                    </Progress>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-white/50 mr-2"></div>
                        Yoga
                      </span>
                      <span>200 cal (11%)</span>
                    </div>
                    <Progress value={11} className="h-2 bg-white/10">
                      <div className="h-full bg-white/50"></div>
                    </Progress>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Your fitness indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 text-neon-pink mr-2" />
                      <div>
                        <p className="text-sm font-medium">Resting Heart Rate</p>
                        <p className="text-xs text-white/70">Beats per minute</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-neon-pink">68</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-neon-green mr-2" />
                      <div>
                        <p className="text-sm font-medium">VO2 Max</p>
                        <p className="text-xs text-white/70">Cardio fitness score</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-neon-green">42</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-neon-blue mr-2" />
                      <div>
                        <p className="text-sm font-medium">Recovery Score</p>
                        <p className="text-xs text-white/70">Based on sleep & activity</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-neon-blue">85</div>
                  </div>

                  <div className="p-3 rounded-lg border border-neon-purple/20 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10">
                    <p className="text-white/70 mb-1 text-sm">Fitness Age</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-white">28</p>
                      <div className="flex items-center text-neon-green text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>-2 years</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="log" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Log New Activity</CardTitle>
              <CardDescription>Record your workout or physical activity</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Activity Type</Label>
                    <Input
                      id="type"
                      name="type"
                      value={activityForm.type}
                      onChange={handleFormChange}
                      className="glassmorphic"
                      placeholder="Running, Cycling, Swimming, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={activityForm.date}
                      onChange={handleFormChange}
                      className="glassmorphic"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      value={activityForm.duration}
                      onChange={handleFormChange}
                      className="glassmorphic"
                      placeholder="30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caloriesBurnt">Calories Burnt</Label>
                    <Input
                      id="caloriesBurnt"
                      name="caloriesBurnt"
                      type="number"
                      min="1"
                      value={activityForm.caloriesBurnt}
                      onChange={handleFormChange}
                      className="glassmorphic"
                      placeholder="300"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto bg-neon-green/80 hover:bg-neon-green animate-glow " style={{ backgroundColor: '#00f0ff' }}
                >
                  {isLoading ? "Saving..." : "Log Activity"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Your recent workouts and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityData.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-white/10 hover:border-neon-blue/30 transition-colors"
                  >
                    <div className="flex items-center mb-2 md:mb-0">
                      <div className="h-10 w-10 rounded-full bg-neon-blue/20 flex items-center justify-center mr-3">
                        <Activity className="h-5 w-5 text-neon-blue" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-xs text-white/70">{activity.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-white/70">Duration</p>
                        <p className="font-medium">{activity.duration} min</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/70">Calories</p>
                        <p className="font-medium text-neon-pink">{activity.caloriesBurnt}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="hidden md:flex">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

