"use client"

import React, { useEffect } from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    height: "",
    weight: "",
    age: "",
    gender: "male",
  })
  const [bmi, setBMI] = useState<number | null>(null)
  const [bmr, setBMR] = useState<number | null>(null)
  const [healthMetricsLoaded, setHealthMetricsLoaded] = useState(false)

  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: true,
    weeklyReports: true,
    achievementAlerts: true,
    hydrationReminders: false,
  })

  const [goalSettings, setGoalSettings] = useState({
    calorieGoal: "",
    waterGoal: "",
    weightGoal: "",
    activityGoal: "",
  })

  // Validation constants
  const MAX_WEIGHT = 550; // kg
  const MAX_HEIGHT = 250; // cm
  const MAX_AGE = 110; // years
  const MIN_VALUE = 0; // Minimum value for all numeric fields

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true)
        
        setProfileForm(prev => ({
          ...prev,
          name: session?.user?.name || "",
          email: session?.user?.email || ""
        }))

        const profileRes = await fetch('/api/user/profile')
        if (profileRes.ok) {
          const { profile: profileData } = await profileRes.json()
          setProfileForm(prev => ({
            ...prev,
            height: profileData.height?.toString() || "",
            weight: profileData.weight?.toString() || "",
            age: profileData.age?.toString() || "",
            gender: profileData.gender || "male",
          }))

          if (profileData.height && profileData.weight) {
            calculateHealthMetrics(
              parseFloat(profileData.height),
              parseFloat(profileData.weight),
              parseFloat(profileData.age || "0"),
              profileData.gender || "male"
            )
          }
        }
        
        const goalsRes = await fetch('/api/user/goals')
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json()
          setGoalSettings({
            calorieGoal: goalsData.calorieGoal?.toString() || "2500",
            waterGoal: goalsData.waterGoal?.toString() || "2500",
            weightGoal: goalsData.weightGoal?.toString() || "",
            activityGoal: goalsData.activityGoal?.toString() || "150",
          })
        }

      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      loadUserData()
    }
  }, [session, toast])

  const calculateHealthMetrics = (height: number, weight: number, age: number, gender: string) => {
    const calculatedBMI = parseFloat(calculateBMI(weight, height))
    const calculatedBMR = parseFloat(calculateBMR(weight, height, age, gender))
    
    setBMI(calculatedBMI)
    setBMR(calculatedBMR)
    setHealthMetricsLoaded(true)
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let processedValue = value

    // Validate input before updating state
    if (value !== "") {
      const numValue = parseFloat(value)
      
      if (isNaN(numValue) || numValue < MIN_VALUE) {
        toast({
          title: "Invalid Input",
          description: `Value cannot be negative`,
          variant: "destructive",
        })
        return
      }

      if (name === "weight" && numValue > MAX_WEIGHT) {
        toast({
          title: "Invalid Weight",
          description: `Weight cannot exceed ${MAX_WEIGHT} kg`,
          variant: "destructive",
        })
        return
      }

      if (name === "height" && numValue > MAX_HEIGHT) {
        toast({
          title: "Invalid Height",
          description: `Height cannot exceed ${MAX_HEIGHT} cm`,
          variant: "destructive",
        })
        return
      }

      if (name === "age" && numValue > MAX_AGE) {
        toast({
          title: "Invalid Age",
          description: `Age cannot exceed ${MAX_AGE} years`,
          variant: "destructive",
        })
        return
      }
    }

    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGoalSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Final validation before submission
    const height = parseFloat(profileForm.height)
    const weight = parseFloat(profileForm.weight)
    const age = parseFloat(profileForm.age)

    if (isNaN(height) || isNaN(weight) || isNaN(age)) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid numbers for all fields",
        variant: "destructive",
      })
      return
    }

    if (weight > MAX_WEIGHT) {
      toast({
        title: "Invalid Weight",
        description: `Weight cannot exceed ${MAX_WEIGHT} kg`,
        variant: "destructive",
      })
      return
    }

    if (height > MAX_HEIGHT) {
      toast({
        title: "Invalid Height",
        description: `Height cannot exceed ${MAX_HEIGHT} cm`,
        variant: "destructive",
      })
      return
    }

    if (age > MAX_AGE) {
      toast({
        title: "Invalid Age",
        description: `Age cannot exceed ${MAX_AGE} years`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          height,
          weight,
          age,
          gender: profileForm.gender
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      calculateHealthMetrics(height, weight, age, profileForm.gender)

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      })
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: error.message || "Could not update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calorieGoal: parseInt(goalSettings.calorieGoal) || 0,
          waterGoal: parseInt(goalSettings.waterGoal) || 0,
          weightGoal: parseInt(goalSettings.weightGoal) || 0,
          activityGoal: parseInt(goalSettings.activityGoal) || 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update goals')
      }

      toast({
        title: "Success!",
        description: "Your goals have been updated.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Goals update error:", error)
      toast({
        title: "Update failed",
        description: error.message || "Could not update goals",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationSubmit = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({
        title: "Success!",
        description: "Notification preferences saved.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100
    return (weight / (heightInMeters * heightInMeters)).toFixed(2)
  }

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === "male") {
      return (10 * weight + 6.25 * height - 5 * age + 5).toFixed(2)
    } else {
      return (10 * weight + 6.25 * height - 5 * age - 161).toFixed(2)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight"
    if (bmi >= 18.5 && bmi < 24.9) return "Normal"
    if (bmi >= 25 && bmi < 29.9) return "Overweight"
    return "Obese"
  }

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return "text-yellow-400"
    if (bmi >= 18.5 && bmi < 24.9) return "text-green-400"
    if (bmi >= 25 && bmi < 29.9) return "text-orange-400"
    return "text-red-400"
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
              <CardDescription>
                Your name and email are managed by your account. 
                Update your other details below.
              </CardDescription>
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
                      className="glassmorphic bg-gray-700"
                      readOnly
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
                      className="glassmorphic bg-gray-700"
                      readOnly
                    />
                    <p className="text-xs text-white/50">
                      Contact support to change your email
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      min={MIN_VALUE}
                      max={MAX_HEIGHT}
                      value={profileForm.height}
                      onChange={handleProfileChange}
                      className="glassmorphic"
                      required
                    />
                    <p className="text-xs text-white/50">
                      Max: {MAX_HEIGHT} cm
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min={MIN_VALUE}
                      max={MAX_WEIGHT}
                      value={profileForm.weight}
                      onChange={handleProfileChange}
                      className="glassmorphic"
                      required
                    />
                    <p className="text-xs text-white/50">
                      Max: {MAX_WEIGHT} kg
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min={MIN_VALUE}
                      max={MAX_AGE}
                      value={profileForm.age}
                      onChange={handleProfileChange}
                      className="glassmorphic"
                      required
                    />
                    <p className="text-xs text-white/50">
                      Max: {MAX_AGE} years
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={profileForm.gender}
                    onValueChange={(value) => 
                      setProfileForm(prev => ({ ...prev, gender: value }))
                    }
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

              {healthMetricsLoaded && bmi !== null && bmr !== null && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold neon-text">Your Health Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glassmorphic">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium uppercase tracking-wide text-white/70">
                          Body Mass Index (BMI)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-4xl font-bold ${getBMIColor(bmi)}`}>
                              {bmi}
                            </p>
                            <p className="text-sm text-white/70">
                              {getBMICategory(bmi)}
                            </p>
                          </div>
                          <div className="text-sm text-white/70">
                            <p>Healthy range: 18.5 - 24.9</p>
                            <p>Your weight status</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glassmorphic">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium uppercase tracking-wide text-white/70">
                          Basal Metabolic Rate (BMR)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-4xl font-bold text-neon-blue">
                              {bmr}
                              <span className="text-lg text-white/70"> kcal/day</span>
                            </p>
                            <p className="text-sm text-white/70">
                              Calories needed at rest
                            </p>
                          </div>
                          <div className="text-sm text-white/70">
                            <p>Based on Mifflin-St Jeor</p>
                            <p>formula</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                  className="bg-neon-green/80 hover:bg-neon-green animate-glow"
                  style={{ backgroundColor: '#00f0ff' }}
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
                  onClick={handleNotificationSubmit}
                  disabled={isLoading}
                  className="bg-neon-purple/80 hover:bg-neon-purple animate-glow"
                  style={{ backgroundColor: '#00f0ff' }}
                >
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}