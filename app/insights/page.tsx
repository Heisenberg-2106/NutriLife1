"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"

export default function InsightsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch logs
        const logsRes = await fetch("/api/logs?days=30")
        if (!logsRes.ok) throw new Error("Failed to fetch logs")
        const logsData = await logsRes.json()

        setLogs(logsData.logs)
      } catch (error) {
        console.error("Error fetching insights data:", error)
        toast({
          title: "Error",
          description: "Failed to load insights data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Mock data for now
  const nutrientTrendData = [
    { date: "Week 1", protein: 110, carbs: 240, fats: 65 },
    { date: "Week 2", protein: 120, carbs: 230, fats: 70 },
    { date: "Week 3", protein: 125, carbs: 220, fats: 68 },
    { date: "Week 4", protein: 130, carbs: 210, fats: 65 },
  ]

  const calorieDistributionData = [
    { name: "Breakfast", value: 400 },
    { name: "Lunch", value: 600 },
    { name: "Dinner", value: 500 },
    { name: "Snacks", value: 300 },
  ]

  const COLORS = ["#00F0FF", "#8A2BE2", "#FF00FF", "#39FF14"]

  const weightTrendData = [
    { date: "Week 1", weight: 71.5 },
    { date: "Week 2", weight: 71.0 },
    { date: "Week 3", weight: 70.5 },
    { date: "Week 4", weight: 70.2 },
  ]

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-neon-blue border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold neon-text">Nutrition Insights</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Nutrient Trends</CardTitle>
            <CardDescription>Monthly breakdown of your macronutrient intake</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                protein: {
                  label: "Protein (g)",
                  color: "hsl(var(--chart-1))",
                },
                carbs: {
                  label: "Carbs (g)",
                  color: "hsl(var(--chart-2))",
                },
                fats: {
                  label: "Fats (g)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nutrientTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="protein" stroke="var(--color-protein)" strokeWidth={2} />
                  <Line type="monotone" dataKey="carbs" stroke="var(--color-carbs)" strokeWidth={2} />
                  <Line type="monotone" dataKey="fats" stroke="var(--color-fats)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Calorie Distribution</CardTitle>
            <CardDescription>How your calories are distributed throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={calorieDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {calorieDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} calories`, "Calories"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>Your weight changes over the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              weight: {
                label: "Weight (kg)",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" domain={["dataMin - 1", "dataMax + 1"]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Nutrition Score</CardTitle>
            <CardDescription>Overall quality of your diet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative h-36 w-36">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-neon-green">85</div>
                </div>
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(57, 255, 20, 0.2)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#39FF14"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset="42"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <p className="mt-4 text-center text-sm text-white/70">
                Your diet is well-balanced with good protein intake and adequate vegetables.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Protein Quality</CardTitle>
            <CardDescription>Sources of your protein intake</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Animal Protein</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-neon-blue" style={{ width: "65%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Plant Protein</span>
                <span className="text-sm font-medium">35%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-neon-green" style={{ width: "35%" }}></div>
              </div>

              <p className="mt-4 text-xs text-white/70">
                Try to increase plant protein sources for a more balanced diet.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Nutrient Deficiencies</CardTitle>
            <CardDescription>Areas to improve in your diet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Vitamin D</span>
                <span className="text-sm font-medium text-neon-pink">Low</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Iron</span>
                <span className="text-sm font-medium text-neon-yellow">Moderate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Calcium</span>
                <span className="text-sm font-medium text-neon-green">Good</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fiber</span>
                <span className="text-sm font-medium text-neon-yellow">Moderate</span>
              </div>

              <p className="mt-4 text-xs text-white/70">
                Consider adding more vitamin D rich foods like fatty fish and eggs to your diet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

