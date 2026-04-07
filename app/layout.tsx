import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { AuthLayout } from "@/components/auth-layout"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gain-ai.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GainAi — AI-Powered Nutrition & Body Analysis",
    template: "%s | GainAi",
  },
  description:
    "Scan any food for instant macro breakdowns, analyze your body composition with AI, and get personalized fitness coaching. The smartest nutrition tool for serious athletes.",
  keywords: [
    "AI nutrition tracker",
    "food scanner app",
    "body composition analysis",
    "macro tracker",
    "AI fitness coach",
    "calorie counter",
    "body fat analyzer",
    "nutrition AI",
    "fitness app",
    "meal scanner",
  ],
  authors: [{ name: "GainAi" }],
  creator: "GainAi",
  publisher: "GainAi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "GainAi",
    title: "GainAi — AI-Powered Nutrition & Body Analysis",
    description:
      "Scan any food for instant macro breakdowns, analyze your body composition with AI, and get personalized fitness coaching. The smartest nutrition tool for serious athletes.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "GainAi — AI-Powered Nutrition & Body Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainAi — AI-Powered Nutrition & Body Analysis",
    description:
      "Scan any food for instant macro breakdowns, analyze your body composition with AI, and get personalized fitness coaching.",
    images: ["/logo.png"],
    creator: "@gainai",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  category: "health & fitness",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthLayout>{children}</AuthLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
