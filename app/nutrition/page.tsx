"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Utensils, Search, BookmarkPlus, Clock, Heart, Filter, Plus, Bookmark } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock user nutrition data
const mockUserNutrition = {
    dailyCalories: 1850,
    calorieGoal: 2200,
    macros: {
        protein: { current: 85, goal: 120 },
        carbs: { current: 210, goal: 250 },
        fat: { current: 55, goal: 70 },
    },
    meals: [
        { id: 1, name: "Breakfast", calories: 450, time: "08:30 AM" },
        { id: 2, name: "Lunch", calories: 650, time: "12:30 PM" },
        { id: 3, name: "Snack", calories: 200, time: "04:00 PM" },
        { id: 4, name: "Dinner", calories: 550, time: "07:30 PM" },
    ],
    savedRecipes: [],
}

export default function NutritionPage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [activeRecipe, setActiveRecipe] = useState<number | null>(null)
    const [savedRecipes, setSavedRecipes] = useState<number[]>(mockUserNutrition.savedRecipes)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        bodyType: "",
        medicalCondition: "",
        activityLevel: "",
        dietaryPreference: "",
        mealType: "",
        maxPrepTime: 60,
        calorieRange: [200, 800],
        isGlutenFree: false,
        isDairyFree: false,
        isVegetarian: false,
        isVegan: false,
    })
    const [recipes, setRecipes] = useState<any[]>([])
    const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]) // Ensure initialized as array
    const [isRecipesLoading, setIsRecipesLoading] = useState(true)
    

    // Fetch recipes from database
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                setIsRecipesLoading(true)
                const res = await fetch("/api/recipes")
                const data = await res.json()
                
                // Ensure data is always an array
                const recipesData = Array.isArray(data) ? data : []
                setRecipes(recipesData)
                setFilteredRecipes(recipesData)
            } catch (error) {
                console.error("Error fetching recipes:", error)
                toast({
                    title: "Error",
                    description: "Failed to load recipes",
                    variant: "destructive",
                })
                // Set empty array on error
                setRecipes([])
                setFilteredRecipes([])
            } finally {
                setIsRecipesLoading(false)
            }
        }

        fetchRecipes()
    }, [])

    // Filter recipes based on search and filters
    useEffect(() => {
        if (recipes.length === 0) return

        const recipeArray = Array.isArray(recipes) ? recipes : []

        let results = [...recipeArray]

        // Search filter
        if (searchQuery) {
            results = results.filter(
                (recipe) =>
                    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    recipe.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
            )
        }

        // Body type filter
        if (filters.bodyType) {
            results = results.filter((recipe) => recipe.suitableFor.includes(filters.bodyType))
        }

        // Medical condition filter
        if (filters.medicalCondition) {
            results = results.filter((recipe) => recipe.suitableFor.includes(filters.medicalCondition))
        }

        // Activity level filter
        if (filters.activityLevel) {
            if (filters.activityLevel === "Active") {
                results = results.filter((recipe) => recipe.suitableFor.includes("Active") || recipe.protein >= 20)
            } else if (filters.activityLevel === "Moderate") {
                results = results.filter((recipe) => recipe.calories >= 300 && recipe.calories <= 600)
            } else {
                results = results.filter((recipe) => recipe.calories < 400)
            }
        }

        // Dietary preference filters
        if (filters.isVegetarian) {
            results = results.filter((recipe) => recipe.dietaryInfo.isVegetarian)
        }
        if (filters.isVegan) {
            results = results.filter((recipe) => recipe.dietaryInfo.isVegan)
        }
        if (filters.isGlutenFree) {
            results = results.filter((recipe) => recipe.dietaryInfo.isGlutenFree)
        }
        if (filters.isDairyFree) {
            results = results.filter((recipe) => recipe.dietaryInfo.isDairyFree)
        }

        // Prep time filter
        results = results.filter((recipe) => recipe.prepTime <= filters.maxPrepTime)

        // Calorie range filter
        results = results.filter(
            (recipe) => recipe.calories >= filters.calorieRange[0] && recipe.calories <= filters.calorieRange[1],
        )

        setFilteredRecipes(Array.isArray(results) ? results : [])
    }, [searchQuery, filters, recipes])

    const handleFilterChange = (name: string, value: any) => {
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    const toggleSaveRecipe = (recipeId: number) => {
        setSavedRecipes((prev) => {
            if (prev.includes(recipeId)) {
                toast({
                    title: "Recipe removed",
                    description: "Recipe has been removed from your saved recipes.",
                })
                return prev.filter((id) => id !== recipeId)
            } else {
                toast({
                    title: "Recipe saved",
                    description: "Recipe has been added to your saved recipes.",
                })
                return [...prev, recipeId]
            }
        })
    }

    const handleAddMeal = (recipeId: number) => {
        toast({
            title: "Meal logged",
            description: "Recipe has been added to your meal log.",
        })
    }

    if (isRecipesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold neon-text">Nutrition & Recipes</h1>

            <Tabs defaultValue="recipes" className="w-full">
                <TabsList className="grid w-full grid-cols-3 glassmorphic">
                    <TabsTrigger value="recipes">Recipe Finder</TabsTrigger>
                    <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
                    <TabsTrigger value="tracking">Nutrition Tracking</TabsTrigger>
                </TabsList>

                <TabsContent value="recipes" className="mt-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            <Card className="glassmorphic">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Filter className="mr-2 h-5 w-5 text-neon-blue" />
                                        Recipe Filters
                                    </CardTitle>
                                    <CardDescription>Find recipes tailored to your needs</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bodyType">Body Type</Label>
                                        <Select value={filters.bodyType} onValueChange={(value) => handleFilterChange("bodyType", value)}>
                                            <SelectTrigger className="glassmorphic">
                                                <SelectValue placeholder="Select body type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="any">Any</SelectItem>
                                                <SelectItem value="Underweight">Underweight</SelectItem>
                                                <SelectItem value="Healthy">Healthy</SelectItem>
                                                <SelectItem value="Obese">Overweight/Obese</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="medicalCondition">Medical Condition</Label>
                                        <Select
                                            value={filters.medicalCondition}
                                            onValueChange={(value) => handleFilterChange("medicalCondition", value)}
                                        >
                                            <SelectTrigger className="glassmorphic">
                                                <SelectValue placeholder="Select condition" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="Diabetes">Diabetes</SelectItem>
                                                <SelectItem value="Heart Disease">Heart Disease</SelectItem>
                                                <SelectItem value="Hypertension">Hypertension</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="activityLevel">Activity Level</Label>
                                        <Select
                                            value={filters.activityLevel}
                                            onValueChange={(value) => handleFilterChange("activityLevel", value)}
                                        >
                                            <SelectTrigger className="glassmorphic">
                                                <SelectValue placeholder="Select activity level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="any">Any</SelectItem>
                                                <SelectItem value="Sedentary">Sedentary</SelectItem>
                                                <SelectItem value="Moderate">Moderately Active</SelectItem>
                                                <SelectItem value="Active">Very Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Dietary Preferences</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="isVegetarian"
                                                    checked={filters.isVegetarian}
                                                    onCheckedChange={(checked) => handleFilterChange("isVegetarian", checked === true)}
                                                />
                                                <Label htmlFor="isVegetarian">Vegetarian</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="isVegan"
                                                    checked={filters.isVegan}
                                                    onCheckedChange={(checked) => handleFilterChange("isVegan", checked === true)}
                                                />
                                                <Label htmlFor="isVegan">Vegan</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="isGlutenFree"
                                                    checked={filters.isGlutenFree}
                                                    onCheckedChange={(checked) => handleFilterChange("isGlutenFree", checked === true)}
                                                />
                                                <Label htmlFor="isGlutenFree">Gluten-Free</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="isDairyFree"
                                                    checked={filters.isDairyFree}
                                                    onCheckedChange={(checked) => handleFilterChange("isDairyFree", checked === true)}
                                                />
                                                <Label htmlFor="isDairyFree">Dairy-Free</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label htmlFor="maxPrepTime">Max Prep Time: {filters.maxPrepTime} mins</Label>
                                        </div>
                                        <Slider
                                            id="maxPrepTime"
                                            min={10}
                                            max={120}
                                            step={5}
                                            value={[filters.maxPrepTime]}
                                            onValueChange={(value) => handleFilterChange("maxPrepTime", value[0])}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label htmlFor="calorieRange">
                                                Calorie Range: {filters.calorieRange[0]} - {filters.calorieRange[1]} kcal
                                            </Label>
                                        </div>
                                        <Slider
                                            id="calorieRange"
                                            min={100}
                                            max={1000}
                                            step={50}
                                            value={filters.calorieRange}
                                            onValueChange={(value) => handleFilterChange("calorieRange", value)}
                                        />
                                    </div>

                                    <Button
                                        onClick={() =>
                                            setFilters({
                                                bodyType: "",
                                                medicalCondition: "",
                                                activityLevel: "",
                                                dietaryPreference: "",
                                                mealType: "",
                                                maxPrepTime: 60,
                                                calorieRange: [200, 800],
                                                isGlutenFree: false,
                                                isDairyFree: false,
                                                isVegetarian: false,
                                                isVegan: false,
                                            })
                                        }
                                        variant="outline"
                                        className="w-full border-neon-blue/50 text-neon-blue hover:bg-neon-blue/20"
                                    >
                                        Reset Filters
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="w-full md:w-2/3">
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                                    <Input
                                        placeholder="Search recipes by name or tag..."
                                        className="glassmorphic pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredRecipes.length === 0 ? (
                                    <Card className="glassmorphic">
                                        <CardContent className="flex flex-col items-center justify-center p-6">
                                            <Utensils className="h-12 w-12 text-white/50 mb-4" />
                                            <h3 className="text-xl font-medium mb-2">No recipes found</h3>
                                            <p className="text-white/70 text-center">
                                                Try adjusting your filters or search query to find more recipes.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    filteredRecipes.map((recipe) => (
                                        <Card key={recipe._id} className="glassmorphic overflow-hidden">
                                            <div className="flex flex-col md:flex-row">
                                                <div className="w-full md:w-1/3">
                                                    <img
                                                        src={recipe.image || "/placeholder.svg"}
                                                        alt={recipe.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="w-full md:w-2/3 p-4">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-xl font-bold">{recipe.title}</h3>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => toggleSaveRecipe(recipe._id)}
                                                            className="text-white/70 hover:text-neon-pink"
                                                        >
                                                            {savedRecipes.includes(recipe._id) ? (
                                                                <Bookmark className="h-5 w-5 fill-neon-pink text-neon-pink" />
                                                            ) : (
                                                                <BookmarkPlus className="h-5 w-5" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 my-2">
                                                        {recipe.tags.map((tag: string) => (
                                                            <Badge key={tag} variant="outline" className="border-neon-blue/50 text-neon-blue">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-2 my-3">
                                                        <div className="text-center">
                                                            <p className="text-xs text-white/70">Calories</p>
                                                            <p className="font-medium">{recipe.calories}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-white/70">Protein</p>
                                                            <p className="font-medium">{recipe.protein}g</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-white/70">Carbs</p>
                                                            <p className="font-medium">{recipe.carbs}g</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-white/70">Fat</p>
                                                            <p className="font-medium">{recipe.fat}g</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center text-white/70 text-sm mb-3">
                                                        <Clock className="h-4 w-4 mr-1" />
                                                        <span>{recipe.prepTime} mins</span>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setActiveRecipe(activeRecipe === recipe._id ? null : recipe._id)}
                                                            className="bg-neon-blue/80 hover:bg-neon-blue animate-glow" style={{ backgroundColor: '#00f0ff' }}
                                                        >
                                                            {activeRecipe === recipe._id ? "Hide Details" : "View Recipe"}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleAddMeal(recipe._id)}
                                                            className="border-neon-green/50 text-neon-green hover:bg-neon-green/20"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Log Meal
                                                        </Button>
                                                    </div>

                                                    {activeRecipe === recipe._id && (
                                                        <div className="mt-4 border-t border-white/10 pt-4">
                                                            <div className="mb-3">
                                                                <h4 className="font-medium mb-2">Ingredients</h4>
                                                                <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                                                                    {recipe.ingredients.map((ingredient: string, idx: number) => (
                                                                        <li key={idx}>{ingredient}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium mb-2">Instructions</h4>
                                                                <p className="text-sm text-white/70">{recipe.instructions}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="saved" className="mt-6">
                    <Card className="glassmorphic">
                        <CardHeader>
                            <CardTitle>Saved Recipes</CardTitle>
                            <CardDescription>Your favorite recipes for quick access</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {savedRecipes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center">
                                    <BookmarkPlus className="h-12 w-12 text-white/50 mb-4" />
                                    <h3 className="text-xl font-medium mb-2">No saved recipes</h3>
                                    <p className="text-white/70 max-w-md">
                                        Save your favorite recipes for quick access by clicking the bookmark icon on any recipe.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recipes
                                        .filter((recipe) => savedRecipes.includes(recipe._id))
                                        .map((recipe) => (
                                            <Card key={recipe._id} className="overflow-hidden border-white/10">
                                                <div className="relative h-40">
                                                    <img
                                                        src={recipe.image || "/placeholder.svg"}
                                                        alt={recipe.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleSaveRecipe(recipe._id)}
                                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                                                    >
                                                        <Bookmark className="h-5 w-5 fill-neon-pink text-neon-pink" />
                                                    </Button>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-bold mb-2">{recipe.title}</h3>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center text-white/70 text-sm">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            <span>{recipe.prepTime} mins</span>
                                                        </div>
                                                        <div className="text-sm font-medium">{recipe.calories} kcal</div>
                                                    </div>
                                                    <Button size="sm" className="w-full bg-neon-blue/80 hover:bg-neon-blue animate-glow" style={{ backgroundColor: '#00f0ff' }}>
                                                        View Recipe
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tracking" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="glassmorphic">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-neon-blue">
                                            {mockUserNutrition.dailyCalories}{" "}
                                            <span className="text-sm font-normal">/ {mockUserNutrition.calorieGoal}</span>
                                        </div>
                                        <p className="text-xs text-white/70">kcal consumed today</p>
                                    </div>
                                    <Utensils className="h-8 w-8 text-neon-blue" />
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Progress</span>
                                        <span>{Math.round((mockUserNutrition.dailyCalories / mockUserNutrition.calorieGoal) * 100)}%</span>
                                    </div>
                                    <Progress
                                        value={Math.round((mockUserNutrition.dailyCalories / mockUserNutrition.calorieGoal) * 100)}
                                        className="h-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glassmorphic">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Protein</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-neon-purple">
                                            {mockUserNutrition.macros.protein.current}{" "}
                                            <span className="text-sm font-normal">/ {mockUserNutrition.macros.protein.goal}g</span>
                                        </div>
                                        <p className="text-xs text-white/70">protein consumed today</p>
                                    </div>
                                    <Heart className="h-8 w-8 text-neon-purple" />
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Progress</span>
                                        <span>
                                            {Math.round(
                                                (mockUserNutrition.macros.protein.current / mockUserNutrition.macros.protein.goal) * 100,
                                            )}
                                            %
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.round(
                                            (mockUserNutrition.macros.protein.current / mockUserNutrition.macros.protein.goal) * 100,
                                        )}
                                        className="h-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glassmorphic">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Macronutrients</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Carbs</span>
                                            <span>
                                                {mockUserNutrition.macros.carbs.current}g / {mockUserNutrition.macros.carbs.goal}g
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.round(
                                                (mockUserNutrition.macros.carbs.current / mockUserNutrition.macros.carbs.goal) * 100
                                            )}
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Fat</span>
                                            <span>
                                                {mockUserNutrition.macros.fat.current}g / {mockUserNutrition.macros.fat.goal}g
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.round(
                                                (mockUserNutrition.macros.fat.current / mockUserNutrition.macros.fat.goal) * 100
                                            )}
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <p className="text-xs text-white/70">Protein</p>
                                                <p className="text-lg font-bold text-neon-blue">25%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/70">Carbs</p>
                                                <p className="text-lg font-bold text-neon-purple">55%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/70">Fat</p>
                                                <p className="text-lg font-bold text-neon-green">20%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glassmorphic">
                            <CardHeader>
                                <CardTitle>Today's Meals</CardTitle>
                                <CardDescription>Track your food intake throughout the day</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockUserNutrition.meals.map((meal) => (
                                        <div
                                            key={meal.id}
                                            className="flex items-center justify-between p-3 rounded-lg border border-white/10"
                                        >
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-neon-blue/20 flex items-center justify-center mr-3">
                                                    <Utensils className="h-5 w-5 text-neon-blue" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{meal.name}</p>
                                                    <p className="text-xs text-white/70">{meal.time}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-neon-blue">{meal.calories} kcal</p>
                                                <Button size="sm" variant="ghost" className="text-xs text-white/70 hover:text-white">
                                                    Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button className="w-full bg-neon-green/80 hover:bg-neon-green animate-glow" style={{ backgroundColor: '#00f0ff' }}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Meal
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="glassmorphic">
                                <CardHeader>
                                    <CardTitle>Nutrition Recommendations</CardTitle>
                                    <CardDescription>Personalized suggestions based on your profile</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[300px] pr-4">
                                        <div className="space-y-4">
                                            <div className="p-3 rounded-lg border border-neon-blue/20 bg-gradient-to-r from-neon-blue/10 to-transparent">
                                                <h3 className="font-medium text-neon-blue mb-1">Increase Protein Intake</h3>
                                                <p className="text-sm text-white/70">
                                                    You're currently at 70% of your daily protein goal. Consider adding more lean protein sources
                                                    like chicken, fish, tofu, or legumes to your meals.
                                                </p>
                                            </div>

                                            <div className="p-3 rounded-lg border border-neon-purple/20 bg-gradient-to-r from-neon-purple/10 to-transparent">
                                                <h3 className="font-medium text-neon-purple mb-1">Hydration Reminder</h3>
                                                <p className="text-sm text-white/70">
                                                    Don't forget to drink water throughout the day. Proper hydration supports metabolism and
                                                    nutrient absorption.
                                                </p>
                                            </div>

                                            <div className="p-3 rounded-lg border border-neon-green/20 bg-gradient-to-r from-neon-green/10 to-transparent">
                                                <h3 className="font-medium text-neon-green mb-1">Add More Vegetables</h3>
                                                <p className="text-sm text-white/70">
                                                    Try to include a variety of colorful vegetables in your meals to increase your micronutrient
                                                    intake and dietary fiber.
                                                </p>
                                            </div>

                                            <div className="p-3 rounded-lg border border-neon-pink/20 bg-gradient-to-r from-neon-pink/10 to-transparent">
                                                <h3 className="font-medium text-neon-pink mb-1">Pre-Workout Nutrition</h3>
                                                <p className="text-sm text-white/70">
                                                    Based on your activity schedule, consider having a balanced meal with carbs and protein 2-3
                                                    hours before your workout.
                                                </p>
                                            </div>

                                            <div className="p-3 rounded-lg border border-neon-blue/20 bg-gradient-to-r from-neon-blue/10 to-transparent">
                                                <h3 className="font-medium text-neon-blue mb-1">Healthy Fats</h3>
                                                <p className="text-sm text-white/70">
                                                    Include sources of healthy fats like avocados, nuts, seeds, and olive oil to support hormone
                                                    production and nutrient absorption.
                                                </p>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            <Card className="glassmorphic">
                                <CardHeader>
                                    <CardTitle>Meal Planning</CardTitle>
                                    <CardDescription>Plan your meals for the week</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                                            <div key={day} className="flex items-center justify-between">
                                                <h3 className="font-medium">{day}</h3>
                                                <Button size="sm" variant="ghost" className="text-neon-blue">
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full hover:bg-neon-purple animate-glow"  style={{ backgroundColor: '#00f0ff' }}>
                                        Generate Meal Plan
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}