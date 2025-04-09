"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        toast({
          title: "Authentication failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-dark-theme">
      <Card className="w-full max-w-md glassmorphic">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center neon-text">NutriLife</CardTitle>
          <CardDescription className="text-center">Enter your credentials to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="glassmorphic"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-neon-blue hover:underline">Forgot password?</Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="glassmorphic"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neon-blue/80 hover:bg-neon-blue animate-glow" style={{ backgroundColor: '#00f0ff' }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-white/70">Don't have an account?</span>{" "}
            <Link href="/register" className="text-neon-blue hover:underline">Sign up</Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="relative my-4 w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-white/70">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125V19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875H12V2Z"></path>
              </svg>
              GitHub
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
