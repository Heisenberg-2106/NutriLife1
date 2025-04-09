import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Activity,
  Droplet,
  ChefHat,
  LineChart,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-8">
      <div className="flex flex-col items-center justify-center flex-1 text-center">
        <h1 className="text-5xl font-bold tracking-tighter neon-text mb-6">
          NutriLife
        </h1>
        <p className="text-xl text-white/70 max-w-[600px] mb-8">
          Track your nutrition, get personalized recommendations, and achieve
          your health goals with NutriLife.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          {/* First Card */}
          <Link href="/login">
            <Card className="glassmorphic border border-transparent hover:border-red hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Track Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 mb-4">
                  Log your meals and track your daily calorie and nutrient
                  intake.
                </p>
                <ChefHat className="h-12 w-12 mx-auto text-neon-blue" />
              </CardContent>
            </Card>
          </Link>

          {/* Second Card */}
          <Link href="/login">
            <Card className="glassmorphic border border-transparent hover:border-neon-blue hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monitor Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 mb-4">
                  Record your workouts and track calories burned during
                  activities.
                </p>
                <Activity className="h-12 w-12 mx-auto text-neon-purple" />
              </CardContent>
            </Card>
          </Link>

          {/* Third Card */}
          <Link href="/login">
            <Card className="glassmorphic border border-transparent hover:border-neon-blue hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Analyze Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 mb-4">
                  View detailed insights and track your progress toward your
                  goals.
                </p>
                <LineChart className="h-12 w-12 mx-auto text-neon-green" />
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            asChild
            className="bg-neon-blue/80 hover:bg-neon-blue animate-glow"
            style={{ backgroundColor: "#00f0ff" }}
          >
            <Link href="/login">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-neon-blue/50 text-neon-blue hover:bg-neon-blue/20"
          >
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="features" className="w-full max-w-5xl mx-auto mt-12">
        <TabsList className="grid w-full grid-cols-3 glassmorphic">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <CalendarDays className="h-6 w-6 text-neon-blue mt-1" />
              <div>
                <h3 className="font-medium mb-2">Meal Planning</h3>
                <p className="text-sm text-white/70">
                  Plan your meals in advance with our easy-to-use meal planner.
                  Get suggestions based on your nutritional goals.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Activity className="h-6 w-6 text-neon-purple mt-1" />
              <div>
                <h3 className="font-medium mb-2">Workout Tracking</h3>
                <p className="text-sm text-white/70">
                  Log your workouts and track your progress over time. Get
                  insights into your activity patterns.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Droplet className="h-6 w-6 text-neon-green mt-1" />
              <div>
                <h3 className="font-medium mb-2">Hydration Tracking</h3>
                <p className="text-sm text-white/70">
                  Monitor your daily water intake and get reminders to stay
                  hydrated throughout the day.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <LineChart className="h-6 w-6 text-neon-pink mt-1" />
              <div>
                <h3 className="font-medium mb-2">Detailed Analytics</h3>
                <p className="text-sm text-white/70">
                  Get detailed insights into your nutrition, activity, and
                  progress toward your health goals.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glassmorphic">
              <CardContent className="pt-6">
                <p className="text-sm text-white/70 mb-4">
                  "NutriLife has completely transformed my approach to
                  nutrition. The insights and recommendations are spot on!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center mr-3">
                    <span className="text-neon-blue font-bold">JD</span>
                  </div>
                  <div>
                    <p className="font-medium">Jane Doe</p>
                    <p className="text-xs text-white/70">
                      Lost 15kg in 6 months
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardContent className="pt-6">
                <p className="text-sm text-white/70 mb-4">
                  "The activity tracking and nutrition insights work seamlessly
                  together. I've never felt healthier!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center mr-3">
                    <span className="text-neon-purple font-bold">MS</span>
                  </div>
                  <div>
                    <p className="font-medium">Mike Smith</p>
                    <p className="text-xs text-white/70">Fitness enthusiast</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>
                  Essential features for beginners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4 text-neon-blue">
                  Free
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> Nutrition tracking
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> Basic activity logging
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> Weekly reports
                  </li>
                </ul>
                <Button
                  className="w-full bg-neon-blue/80 hover:bg-neon-blue animate-glow"
                  style={{ backgroundColor: "#00f0ff" }}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="glassmorphic border-neon-purple">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>
                  Advanced features for enthusiasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4 text-neon-purple">
                  $9.99<span className="text-sm font-normal">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> All Basic features
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> Detailed analytics
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> Meal planning
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> Custom workout plans
                  </li>
                </ul>
                <Button
                  className="w-full bg-neon-purple/80 hover:bg-neon-purple animate-glow"
                  style={{ backgroundColor: "#00f0ff" }}
                >
                  Subscribe
                </Button>
              </CardContent>
            </Card>

            <Card className="glassmorphic">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>
                  Complete solution for professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4 text-neon-green">
                  $19.99<span className="text-sm font-normal">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> All Premium features
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> Personal coaching
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> Priority support
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="mr-2">✓</span> API access
                  </li>
                </ul>
                <Button
                  className="w-full bg-neon-green/80 hover:bg-neon-green animate-glow"
                  style={{ backgroundColor: "#00f0ff" }}
                >
                  Go Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <footer className="mt-12 text-center text-sm text-white/50">
        <p>© 2025 NutriLife. All rights reserved.</p>
      </footer>
    </div>
  );
}
