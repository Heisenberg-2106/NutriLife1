// app/settings/page.tsx
"use client"

import { SessionProvider } from "next-auth/react"
import SettingsPageContent from "@/components/settingspagecontent"

export default function SettingsPage() {
  return (
    <SessionProvider>
      <SettingsPageContent />
    </SessionProvider>
  )
}