import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Dashboard } from "@/components/dashboard"

export const metadata: Metadata = {
  title: "Dashboard — Your Fitness Overview",
  description:
    "Track your daily calories, macros, food scans, and body composition progress all in one place.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Navbar />
      <main className="flex-1">
        <Dashboard />
      </main>
    </div>
  )
}
