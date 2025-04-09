"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from "recharts"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: "Demo User",
    email: "demo@example.com",
    height: "175",
    weight: "70",
    age: "28",
    gender: "male",
  })
  const [bmi, setBMI] = useState<number | null>(null) // State to store BMI
  const [bmr, setBMR] = useState<number | null>(null) // State to store BMR

  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: true,
    weeklyReports: true,
    achievementAlerts: true,
    hydrationReminders: false,
  })

  const [goalSettings, setGoalSettings] = useState({
    calorieGoal: "2500",
    waterGoal: "2500",
    weightGoal: "68",
    activityGoal: "150",
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGoalSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Calculate BMI and BMR
    const height = parseFloat(profileForm.height)
    const weight = parseFloat(profileForm.weight)
    const age = parseFloat(profileForm.age)
    const gender = profileForm.gender

    const calculatedBMI = parseFloat(calculateBMI(weight, height))
    const calculatedBMR = parseFloat(calculateBMR(weight, height, age, gender))

    setBMI(calculatedBMI)
    setBMR(calculatedBMR)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Goals updated",
        description: "Your fitness goals have been updated successfully.",
      })
      setIsLoading(false)
    }, 1000)
  }

  // Helper function to calculate BMI
  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100
    return (weight / (heightInMeters * heightInMeters)).toFixed(2)
  }

  // Helper function to calculate BMR
  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === "male") {
      return (10 * weight + 6.25 * height - 5 * age + 5).toFixed(2)
    } else {
      return (10 * weight + 6.25 * height - 5 * age - 161).toFixed(2)
    }
  }

  // Helper function to classify BMI
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight"
    if (bmi >= 18.5 && bmi < 24.9) return "Normal"
    if (bmi >= 25 && bmi < 29.9) return "Overweight"
    return "Obese"
  }

  // Data for the semicircle chart (BMI categories)
  const bmiCategories = [
    { name: "Underweight", start: 0, end: 18.5, fill: "#FFC107" }, // Yellow
    { name: "Normal", start: 18.5, end: 24.9, fill: "#4CAF50" }, // Green
    { name: "Overweight", start: 25, end: 29.9, fill: "#FF9800" }, // Orange
    { name: "Obese", start: 30, end: 40, fill: "#F44336" }, // Red
  ]

  // Component to render the semicircle chart with an arrow
  const BMISemicircleChart = ({ bmi }: { bmi: number }) => {
    // Find the category where the BMI lies
    const currentCategory = bmiCategories.find(
      (category) => bmi >= category.start && bmi < category.end
    )

    // Calculate the angle for the arrow
    const arrowAngle = ((bmi - 0) / (40 - 0)) * 180 // Scale BMI to 0-180 degrees

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart
          innerRadius="50%"
          outerRadius="100%"
          data={bmiCategories}
          startAngle={180}
          endAngle={0}
          barSize={20}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 40]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="end"
            cornerRadius={10}
            background
            fill="#8884d8"
            animationDuration={1000}
          />
          {/* Arrow pointing to the BMI */}
          <g transform={`rotate(${arrowAngle}, 150, 150)`}>
            <polygon
              points="150,50 140,70 160,70"
              fill="#00f0ff"
              stroke="#00f0ff"
              strokeWidth={2}
            />
            <text
              x={150}
              y={90}
              textAnchor="middle"
              fill="#00f0ff"
              fontSize={14}
              fontWeight="bold"
            >
              Your BMI: {bmi}
            </text>
          </g>
        </RadialBarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold neon-text">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glassmorphic">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="glassmorphic"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="glassmorphic"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      min="0"
                      value={profileForm.height}
                      onChange={handleProfileChange}
                      className="glassmorphic"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min="0"
                      value={profileForm.weight}
                      onChange={handleProfileChange}
                      className="glassmorphic"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      value={profileForm.age}
                      onChange={handleProfileChange}
                      className="glassmorphic"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    defaultValue="male"
                    value={profileForm.gender}
                    onValueChange={(value) => setProfileForm((prev) => ({ ...prev, gender: value }))}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-neon-blue/80 hover:bg-neon-blue animate-glow"
                  style={{ backgroundColor: '#00f0ff' }}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>

              {/* Display BMI, BMR, and Chart after submission */}
              {bmi !== null && bmr !== null && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Your Health Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>BMI (Body Mass Index)</Label>
                      <p className="text-2xl font-bold">{bmi}</p>
                      <p className="text-sm text-white/70">
                        Category: {getBMICategory(bmi)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>BMR (Basal Metabolic Rate)</Label>
                      <p className="text-2xl font-bold">{bmr} kcal/day</p>
                      <p className="text-sm text-white/70">
                        Calories needed at rest
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <BMISemicircleChart bmi={bmi} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Fitness Goals</CardTitle>
              <CardDescription>Set your health and fitness targets</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGoalSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="calorieGoal">Daily Calorie Goal (kcal)</Label>
                    <Input
                      id="calorieGoal"
                      name="calorieGoal"
                      type="number"
                      min="0"
                      value={goalSettings.calorieGoal}
                      onChange={handleGoalChange}
                      className="glassmorphic"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waterGoal">Daily Water Goal (ml)</Label>
                    <Input
                      id="waterGoal"
                      name="waterGoal"
                      type="number"
                      min="0"
                      value={goalSettings.waterGoal}
                      onChange={handleGoalChange}
                      className="glassmorphic"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weightGoal">Target Weight (kg)</Label>
                    <Input
                      id="weightGoal"
                      name="weightGoal"
                      type="number"
                      min="0"
                      value={goalSettings.weightGoal}
                      onChange={handleGoalChange}
                      className="glassmorphic"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activityGoal">Weekly Activity Goal (minutes)</Label>
                    <Input
                      id="activityGoal"
                      name="activityGoal"
                      type="number"
                      min="0"
                      value={goalSettings.activityGoal}
                      onChange={handleGoalChange}
                      className="glassmorphic"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-neon-green/80 hover:bg-neon-green animate-glow" style={{ backgroundColor: '#00f0ff' }}
                >
                  {isLoading ? "Saving..." : "Save Goals"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="glassmorphic">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Reminders</p>
                    <p className="text-sm text-white/70">Receive daily reminders to log your meals and activities</p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReminders}
                    onCheckedChange={(checked) => handleNotificationChange("dailyReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-white/70">Get a weekly summary of your nutrition and fitness progress</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Achievement Alerts</p>
                    <p className="text-sm text-white/70">Be notified when you reach your goals or milestones</p>
                  </div>
                  <Switch
                    checked={notificationSettings.achievementAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("achievementAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Hydration Reminders</p>
                    <p className="text-sm text-white/70">Get hourly reminders to drink water throughout the day</p>
                  </div>
                  <Switch
                    checked={notificationSettings.hydrationReminders}
                    onCheckedChange={(checked) => handleNotificationChange("hydrationReminders", checked)}
                  />
                </div>

                <Button
                  onClick={() => {
                    toast({
                      title: "Notification settings saved",
                      description: "Your notification preferences have been updated.",
                    })
                  }}
                  className="bg-neon-purple/80 hover:bg-neon-purple animate-glow" style={{ backgroundColor: '#00f0ff' }}
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}