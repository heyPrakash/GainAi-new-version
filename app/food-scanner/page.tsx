import type { Metadata } from "next"
import { FoodScannerPage } from "@/components/food-scanner-page"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gain-ai.vercel.app"

export const metadata: Metadata = {
  title: "Food Scanner — AI Macro Analyzer",
  description:
    "Upload or take a photo of any meal and instantly get calories, protein, carbs, fats, and fiber with AI precision. Free food macro analyzer powered by Gemini AI.",
  keywords: [
    "food scanner",
    "AI macro tracker",
    "calorie scanner",
    "food photo analyzer",
    "instant nutrition facts",
    "meal macro breakdown",
  ],
  alternates: {
    canonical: `${siteUrl}/food-scanner`,
  },
  openGraph: {
    url: `${siteUrl}/food-scanner`,
    title: "Food Scanner — AI Macro Analyzer | GainAi",
    description:
      "Upload a photo of any meal and get instant calories, protein, carbs and fats with AI. Free and accurate.",
  },
}

export default function Page() {
  return <FoodScannerPage />
}
