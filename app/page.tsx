import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { ApkDownloadSection } from "@/components/apk-download-section"
import { FounderSection } from "@/components/founder-section"
import { Footer } from "@/components/footer"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gain-ai.vercel.app"

export const metadata: Metadata = {
  title: "GainAi — AI-Powered Nutrition & Body Analysis",
  description:
    "Scan any food for instant macro breakdowns, analyze your body composition with AI, and get personalized fitness coaching. Used by 500+ active users with 99% accuracy.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    url: siteUrl,
    title: "GainAi — AI-Powered Nutrition & Body Analysis",
    description:
      "Scan any food for instant macro breakdowns, analyze your body composition with AI, and get personalized fitness coaching.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "GainAi",
      description:
        "AI-powered nutrition and body analysis app for serious fitness enthusiasts.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#app`,
      name: "GainAi",
      url: siteUrl,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web, Android",
      description:
        "AI-powered nutrition tracker and body composition analyzer. Scan food for macros, analyze body fat, and get personalized AI coaching.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "500",
        bestRating: "5",
      },
      featureList: [
        "AI Food Scanner",
        "Body Composition Analysis",
        "Macro Tracking",
        "Personalized AI Fitness Coach",
        "Android APK Available",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "GainAi",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <ApkDownloadSection />
          <FounderSection />
        </main>
        <Footer />
      </div>
    </>
  )
}
