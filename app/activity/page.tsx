"use client"

import { SessionProvider } from "next-auth/react"
import ActivityPage from "@/components/activityall"

export default function SettingsPage() {
  return (
    <SessionProvider>
      <ActivityPage />
    </SessionProvider>
  )
}