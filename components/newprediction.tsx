"use client"

import { useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const PredictForm = () => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    Preferred_Cuisine: "",
    Age: "",
    Physical_Activity_Level: "",
    BMI: "",
    Disease_Type: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")
  const [dietInfo, setDietInfo] = useState<{
    title: string
    description: string
    benefits: string[]
    recommendations: string[]
    sampleMealPlan: {
      breakfast: string
      lunch: string
      dinner: string
      snacks: string
    }
    tips: string[]
    caution?: string
    icon: string
    color: string
  } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.Age || !formData.BMI) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        Preferred_Cuisine: formData.Preferred_Cuisine || "Unknown",
        Age: Number(formData.Age),
        Physical_Activity_Level: formData.Physical_Activity_Level || "Moderate",
        BMI: parseFloat(formData.BMI),
        Disease_Type: formData.Disease_Type || "Healthy"
      };

      const response = await axios.post("http://127.0.0.1:8000/predict", payload);
      console.log("API Response:", response.data);

      const recommendedDiet = response.data.recommended_diet;
      setResult(recommendedDiet);

      const dietDetails = {
        Low_Carb: {
          title: "Low-Carb Diet",
          description: "Focuses on reducing carbohydrates while increasing healthy fats and proteins to promote fat burning and stabilize blood sugar.",
          benefits: [
            "Promotes weight loss",
            "Helps control blood sugar",
            "May reduce risk of heart disease",
            "Can improve mental clarity"
          ],
          recommendations: [
            "Focus on non-starchy vegetables",
            "Choose healthy fats like avocados and nuts",
            "Include quality protein sources",
            "Limit processed foods"
          ],
          sampleMealPlan: {
            breakfast: "Scrambled eggs with spinach and avocado",
            lunch: "Grilled chicken salad with olive oil dressing",
            dinner: "Salmon with roasted asparagus and cauliflower mash",
            snacks: "Celery with almond butter or cheese cubes"
          },
          tips: [
            "Drink plenty of water to avoid dehydration",
            "Monitor your electrolyte levels",
            "Gradually reduce carbs to minimize side effects"
          ],
          caution: "Not recommended for those with certain medical conditions without doctor supervision.",
          icon: "🥑",
          color: "bg-emerald-500/20 border-emerald-500"
        },
        Low_Sodium: {
          title: "Low-Sodium Diet",
          description: "Designed to reduce sodium intake to help manage blood pressure and decrease fluid retention.",
          benefits: [
            "Lowers blood pressure",
            "Reduces risk of stroke",
            "Decreases water retention",
            "Supports kidney health"
          ],
          recommendations: [
            "Cook meals at home to control salt",
            "Use herbs and spices for flavor",
            "Read nutrition labels carefully",
            "Choose fresh over processed foods"
          ],
          sampleMealPlan: {
            breakfast: "Oatmeal with fresh berries and walnuts",
            lunch: "Grilled fish with quinoa and steamed vegetables",
            dinner: "Lentil soup with whole grain bread (no salt added)",
            snacks: "Unsalted nuts or fresh fruit"
          },
          tips: [
            "Be cautious with condiments and sauces",
            "Rinse canned foods to remove excess sodium",
            "Ask for meals prepared without salt when dining out"
          ],
          caution: "Consult with a doctor before making drastic sodium reductions.",
          icon: "🧂",
          color: "bg-blue-500/20 border-blue-500"
        },
        Balanced: {
          title: "Balanced Diet",
          description: "A well-rounded approach incorporating all food groups in proper proportions for optimal health.",
          benefits: [
            "Provides all essential nutrients",
            "Supports long-term health",
            "Flexible and sustainable",
            "Promotes energy balance"
          ],
          recommendations: [
            "Include a variety of colorful fruits and vegetables",
            "Choose whole grains over refined",
            "Incorporate lean proteins",
            "Include healthy fats in moderation"
          ],
          sampleMealPlan: {
            breakfast: "Greek yogurt with granola and mixed berries",
            lunch: "Whole grain wrap with turkey, avocado, and veggies",
            dinner: "Grilled salmon with brown rice and roasted vegetables",
            snacks: "Hummus with carrot sticks or a handful of almonds"
          },
          tips: [
            "Practice portion control",
            "Stay hydrated throughout the day",
            "Listen to your hunger cues",
            "Allow for occasional treats in moderation"
          ],
          icon: "⚖️",
          color: "bg-purple-500/20 border-purple-500"
        }
      };

      const dietKey = recommendedDiet.replace(" ", "_") as keyof typeof dietDetails;
      
      if (dietDetails[dietKey]) {
        setDietInfo(dietDetails[dietKey]);
      } else {
        console.error("Unknown diet type received:", recommendedDiet);
        toast({
          title: "Unexpected recommendation",
          description: `We received a diet type we don't recognize: ${recommendedDiet}`,
          variant: "destructive",
        });
      }

      toast({
        title: "Diet recommendation generated",
        description: "Your personalized diet plan is ready!",
      });

    } catch (error) {
      console.error("API Error:", error);
      let errorMessage = "An error occurred while generating your diet plan";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      toast({
        title: "Prediction failed",
        description: errorMessage,
        variant: "destructive",
      });
      setResult("");
      setDietInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-6xl space-y-6">
        {/* Top Row - How it Works and Form Cards */}
        <div className="grid grid-cols-1 gap-6">

          {/* Form Card (Right) */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                NutriLife AI
              </CardTitle>
              <CardDescription className="text-center text-gray-300">
                Get your personalized diet recommendation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="Preferred_Cuisine" className="text-gray-300">Preferred Cuisine</Label>
                  <Input
                    id="Preferred_Cuisine"
                    name="Preferred_Cuisine"
                    placeholder="e.g., Italian, Indian, Mediterranean"
                    value={formData.Preferred_Cuisine}
                    onChange={handleChange}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Age" className="text-gray-300">Age *</Label>
                  <Input
                    id="Age"
                    name="Age"
                    type="number"
                    placeholder="Your age"
                    value={formData.Age}
                    onChange={handleChange}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Physical_Activity_Level" className="text-gray-300">Activity Level</Label>
                  <select
                    id="Physical_Activity_Level"
                    name="Physical_Activity_Level"
                    value={formData.Physical_Activity_Level}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="" className="bg-gray-800">Select your activity level</option>
                    <option value="Low" className="bg-gray-800">Low (sedentary)</option>
                    <option value="Moderate" className="bg-gray-800">Moderate (light exercise)</option>
                    <option value="High" className="bg-gray-800">High (intense exercise)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="BMI" className="text-gray-300">BMI *</Label>
                  <Input
                    id="BMI"
                    name="BMI"
                    type="number"
                    placeholder="Your Body Mass Index"
                    value={formData.BMI}
                    onChange={handleChange}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Disease_Type" className="text-gray-300">Health Condition</Label>
                  <Input
                    id="Disease_Type"
                    name="Disease_Type"
                    placeholder="e.g., Diabetes, Hypertension, PCOS"
                    value={formData.Disease_Type}
                    onChange={handleChange}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Your Plan...
                    </>
                  ) : (
                    "Get Personalized Diet Recommendation"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Full-width Results Card */}
        
      </div>
      {dietInfo && (
          <Card className={`border ${dietInfo.color} shadow-lg transition-all duration-500 animate-fade-in`}>
            <CardContent className="p-8">
              <div className="flex items-center mb-8">
                <span className="text-5xl mr-4">{dietInfo.icon}</span>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {dietInfo.title}
                  </h3>
                  <p className="text-gray-300 text-lg mt-2">{dietInfo.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-xl font-semibold text-cyan-400 mb-4">Key Benefits</h4>
                  <ul className="space-y-4">
                    {dietInfo.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-cyan-500/20 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-cyan-400 text-sm">✓</span>
                        </div>
                        <span className="text-gray-200 text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold text-cyan-400 mb-4">Recommendations</h4>
                  <ul className="space-y-4">
                    {dietInfo.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-cyan-500/20 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-cyan-400 text-sm">•</span>
                        </div>
                        <span className="text-gray-200 text-lg">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-cyan-400 mb-6">Sample Meal Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h5 className="font-medium text-cyan-400 text-lg mb-2">Breakfast</h5>
                    <p className="text-gray-200">{dietInfo.sampleMealPlan.breakfast}</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h5 className="font-medium text-cyan-400 text-lg mb-2">Lunch</h5>
                    <p className="text-gray-200">{dietInfo.sampleMealPlan.lunch}</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h5 className="font-medium text-cyan-400 text-lg mb-2">Dinner</h5>
                    <p className="text-gray-200">{dietInfo.sampleMealPlan.dinner}</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h5 className="font-medium text-cyan-400 text-lg mb-2">Snacks</h5>
                    <p className="text-gray-200">{dietInfo.sampleMealPlan.snacks}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-cyan-400 mb-6">Helpful Tips</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dietInfo.tips.map((tip, index) => (
                    <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                      <p className="text-gray-200">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {dietInfo.caution && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h4 className="font-semibold text-red-400 text-lg mb-2">Important Note</h4>
                  <p className="text-gray-200">{dietInfo.caution}</p>
                </div>
              )}
              
              <div className="mt-10 text-center">
                <Button 
                  variant="outline" 
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-500/10 px-8 py-4 text-lg"
                >
                  Download Full Plan PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

export default PredictForm