import type { Metadata } from "next"
import { BodyScannerPage } from "@/components/body-scanner-page"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gain-ai.vercel.app"

export const metadata: Metadata = {
  title: "Body Scanner — AI Body Composition Analysis",
  description:
    "Upload a full-body photo and get an instant AI-powered body composition analysis: body fat %, BMI, muscle mass, and personalized improvement areas.",
  keywords: [
    "body fat analyzer",
    "AI body composition",
    "body scanner app",
    "BMI calculator",
    "muscle mass analyzer",
    "body type analysis",
    "AI fitness analysis",
  ],
  alternates: {
    canonical: `${siteUrl}/body-scanner`,
  },
  openGraph: {
    url: `${siteUrl}/body-scanner`,
    title: "Body Scanner — AI Body Composition Analysis | GainAi",
    description:
      "Get an instant AI-powered body composition analysis from a photo. Know your body fat, BMI, and what to work on.",
  },
}

export default function Page() {
  return <BodyScannerPage />
}
