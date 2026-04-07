import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gain-ai.vercel.app"
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/food-scanner", "/body-scanner"],
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
