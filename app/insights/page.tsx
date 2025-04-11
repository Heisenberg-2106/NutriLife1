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
  BarChart,
  Bar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface Recipe {
  _id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  isVegetarian: boolean
  description?: string
  prepTime?: number
}

interface MealLog {
  breakfast: Recipe | null
  lunch: Recipe | null
  dinner: Recipe | null
  snack: Recipe | null
  date: string
}

export default function InsightsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [mealLog, setMealLog] = useState<MealLog>({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
    date: new Date().toISOString().split('T')[0]
  })
  const [logs, setLogs] = useState<MealLog[]>([])
  const [timeRange, setTimeRange] = useState<string>("week")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipesRes = await fetch("/api/recipes")
        if (!recipesRes.ok) throw new Error("Failed to fetch recipes")
        
        const recipesData = await recipesRes.json()
        const recipesArray = Array.isArray(recipesData) 
          ? recipesData 
          : Array.isArray(recipesData?.recipes) 
            ? recipesData.recipes 
            : []
        
        if (recipesArray.length === 0) {
          console.warn("No recipes found in response:", recipesData)
        }
        
        setRecipes(recipesArray)

        try {
          const logsRes = await fetch("/api/meal-logs")
          if (logsRes.ok) {
            const logsData = await logsRes.json()
            const enrichedLogs = await Promise.all(
              logsData.map(async (log: any) => {
                const getRecipe = async (id: string) => {
                  if (!id) return null
                  const res = await fetch(`/api/recipes?id=${id}`)
                  return res.ok ? await res.json() : null
                }

                return {
                  date: log.date,
                  breakfast: await getRecipe(log.breakfast),
                  lunch: await getRecipe(log.lunch),
                  dinner: await getRecipe(log.dinner),
                  snack: await getRecipe(log.snack),
                }
              })
            )
            setLogs(enrichedLogs)
          } else {
            throw new Error("Failed to fetch logs")
          }
        } catch (logError) {
          console.warn("Using mock data for logs:", logError)
          const mockLogs = generateMockLogs(recipesArray)
          setLogs(mockLogs)
        }
      } catch (error) {
        console.error("Error fetching insights data:", error)
        toast({
          title: "Error",
          description: "Failed to load insights data. Please try again.",
          variant: "destructive",
        })
        setRecipes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const generateMockLogs = (recipes: Recipe[]): MealLog[] => {
    if (!recipes?.length) return []
    
    const vegRecipes = recipes.filter(r => r.isVegetarian)
    const nonVegRecipes = recipes.filter(r => !r.isVegetarian)
    
    return [
      {
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        breakfast: vegRecipes[0 % vegRecipes.length] || null,
        lunch: nonVegRecipes[0 % nonVegRecipes.length] || null,
        dinner: nonVegRecipes[1 % nonVegRecipes.length] || null,
        snack: vegRecipes[1 % vegRecipes.length] || null
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        breakfast: nonVegRecipes[2 % nonVegRecipes.length] || null,
        lunch: vegRecipes[2 % vegRecipes.length] || null,
        dinner: nonVegRecipes[0 % nonVegRecipes.length] || null,
        snack: null
      }
    ]
  }

  const handleMealSelect = (mealType: keyof MealLog, recipeId: string) => {
    const selectedRecipe = recipes.find(r => r._id === recipeId) || null
    setMealLog(prev => ({ ...prev, [mealType]: selectedRecipe }))
  }

  const handleSubmit = async () => {
    try {
      const logToSend = {
        breakfast: mealLog.breakfast?._id || null,
        lunch: mealLog.lunch?._id || null,
        dinner: mealLog.dinner?._id || null,
        snack: mealLog.snack?._id || null,
        date: mealLog.date
      }

      const response = await fetch("/api/meal-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logToSend)
      })

      if (!response.ok) throw new Error("Failed to save meal log")

      const enrichedLog = {
        date: mealLog.date,
        breakfast: mealLog.breakfast,
        lunch: mealLog.lunch,
        dinner: mealLog.dinner,
        snack: mealLog.snack
      }
      
      setLogs(prev => [enrichedLog, ...prev])
      setMealLog({
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null,
        date: new Date().toISOString().split('T')[0]
      })
      
      toast({ title: "Success!", description: "Meal logged successfully." })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log meal.",
        variant: "destructive",
      })
    }
  }

  // Data calculations
  const calculateCalorieDistribution = () => {
    const distribution: {name: string, value: number, dish?: string}[] = []
    
    logs.forEach(log => {
      if (log.breakfast) {
        distribution.push({
          name: "Breakfast",
          value: log.breakfast.calories,
          dish: log.breakfast.name
        })
      }
      if (log.lunch) {
        distribution.push({
          name: "Lunch",
          value: log.lunch.calories,
          dish: log.lunch.name
        })
      }
      if (log.dinner) {
        distribution.push({
          name: "Dinner",
          value: log.dinner.calories,
          dish: log.dinner.name
        })
      }
      if (log.snack) {
        distribution.push({
          name: "Snack",
          value: log.snack.calories,
          dish: log.snack.name
        })
      }
    })
    
    return distribution
  }

  const calculateProteinQuality = () => {
    let animalProtein = 0, plantProtein = 0
    logs.forEach(log => {
      const addProtein = (meal: Recipe | null) => {
        if (!meal) return
        meal.isVegetarian ? plantProtein += meal.protein : animalProtein += meal.protein
      }
      addProtein(log.breakfast)
      addProtein(log.lunch)
      addProtein(log.dinner)
      addProtein(log.snack)
    })
    const totalProtein = animalProtein + plantProtein
    return {
      animalProtein: totalProtein > 0 ? Math.round((animalProtein / totalProtein) * 100) : 0,
      plantProtein: totalProtein > 0 ? Math.round((plantProtein / totalProtein) * 100) : 0,
      totalProtein
    }
  }

  const calculateMacroDistribution = () => {
    let protein = 0, carbs = 0, fats = 0
    logs.forEach(log => {
      const addMacros = (meal: Recipe | null) => {
        if (!meal) return
        protein += meal.protein
        carbs += meal.carbs
        fats += meal.fats
      }
      addMacros(log.breakfast)
      addMacros(log.lunch)
      addMacros(log.dinner)
      addMacros(log.snack)
    })
    const total = protein + carbs + fats
    return {
      protein: total > 0 ? Math.round((protein / total) * 100) : 0,
      carbs: total > 0 ? Math.round((carbs / total) * 100) : 0,
      fats: total > 0 ? Math.round((fats / total) * 100) : 0,
    }
  }

  // Chart data
  const calorieDistributionData = calculateCalorieDistribution()
  const proteinQuality = calculateProteinQuality()
  const macroDistribution = calculateMacroDistribution()
  const nutritionScore = 85

  const nutrientTrendData = [
    { date: "Week 1", protein: 120, carbs: 280, fats: 75 },
    { date: "Week 2", protein: 135, carbs: 250, fats: 80 },
    { date: "Week 3", protein: 140, carbs: 230, fats: 70 },
    { date: "Week 4", protein: 130, carbs: 210, fats: 65 },
  ]
  
  const weightTrendData = [
    { date: "Week 1", weight: 71.5 },
    { date: "Week 2", weight: 71.0 },
    { date: "Week 3", weight: 70.5 },
    { date: "Week 4", weight: 70.2 },
  ]
  
  const macroTrendData = [
    { name: "Protein", value: macroDistribution.protein },
    { name: "Carbs", value: macroDistribution.carbs },
    { name: "Fats", value: macroDistribution.fats },
  ]

  const COLORS = ["#00F0FF", "#8A2BE2", "#FF00FF", "#39FF14"]
  const MACRO_COLORS = ["#00F0FF", "#8A2BE2", "#FF00FF"]

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

      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] glassmorphic-select">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="glassmorphic-dropdown">
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Log Your Meals</CardTitle>
          <CardDescription>Track what you eat to get personalized insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => (
              <div className="space-y-2" key={mealType}>
                <Label>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Label>
                <Select 
                  value={mealLog[mealType]?._id || undefined}
                  onValueChange={(value) => handleMealSelect(mealType, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${mealType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.length > 0 ? (
                      recipes.map(recipe => (
                        <SelectItem key={`${mealType}-${recipe._id}`} value={recipe._id}>
                          {recipe.name} ({recipe.calories} kcal)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-recipes" disabled>
                        No recipes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSubmit}
            className="mt-4 bg-neon-blue/80 hover:bg-neon-blue animate-glow"
            style={{ backgroundColor: '#00f0ff' }}
          >
            Log Meals
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Nutrient Trends</CardTitle>
            <CardDescription>Your macronutrient intake over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={{
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
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nutrientTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    stroke="var(--color-protein)" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="carbs" 
                    stroke="var(--color-carbs)" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fats" 
                    stroke="var(--color-fats)" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
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
                    label={({ name, dish, percent }) => 
                      `${name}: ${dish ? dish.substring(0, 15) + (dish.length > 15 ? '...' : '') : ''} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {calorieDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, entry: any) => [
                      `${value} calories (${entry.payload.dish || 'Unknown'})`,
                      name
                    ]} 
                  />
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
          <CardDescription>Your weight changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[300px]" config={{
            weight: {
              label: "Weight (kg)",
              color: "hsl(var(--chart-4))",
            },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" domain={['dataMin - 1', 'dataMax + 1']} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--color-weight)" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle>Nutrition Score</CardTitle>
            <CardDescription>Overall quality of your diet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative h-36 w-36">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-neon-green">{nutritionScore}</div>
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
                    strokeDashoffset={283 - (283 * nutritionScore / 100)}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <p className="mt-4 text-center text-sm text-white/70">
                {nutritionScore >= 85 
                  ? "Excellent! Your diet is well-balanced and nutritious."
                  : nutritionScore >= 75
                  ? "Good! Your diet is balanced but could use some improvements."
                  : "Fair. Consider adding more variety to your meals."}
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
                <span className="text-sm font-medium">{proteinQuality.animalProtein}%</span>
              </div>
              <Progress value={proteinQuality.animalProtein} className="h-2 bg-white/10">
                <div
                  className="h-full bg-neon-blue"
                  style={{ width: `${proteinQuality.animalProtein}%` }}
                ></div>
              </Progress>

              <div className="flex items-center justify-between">
                <span className="text-sm">Plant Protein</span>
                <span className="text-sm font-medium">{proteinQuality.plantProtein}%</span>
              </div>
              <Progress value={proteinQuality.plantProtein} className="h-2 bg-white/10">
                <div
                  className="h-full bg-neon-green"
                  style={{ width: `${proteinQuality.plantProtein}%` }}
                ></div>
              </Progress>

              <div className="pt-4">
                <p className="text-sm">Total Protein: <span className="font-medium">{proteinQuality.totalProtein}g</span></p>
              </div>

              <p className="mt-2 text-xs text-white/70">
                {proteinQuality.animalProtein > 70 
                  ? "Consider adding more plant protein sources for a more balanced diet."
                  : "Good balance between animal and plant protein sources."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glassmorphic">
        <CardHeader>
          <CardTitle>Macronutrient Distribution</CardTitle>
          <CardDescription>Percentage of protein, carbs and fats in your diet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={macroTrendData}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={MACRO_COLORS[0]} name="Protein (%)" />
                <Bar dataKey="value" fill={MACRO_COLORS[1]} name="Carbs (%)" />
                <Bar dataKey="value" fill={MACRO_COLORS[2]} name="Fats (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}