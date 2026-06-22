import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rubjangnk.netlify.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/chat/",
        "/verify/",
        "/auth/",
        "/chat",
        "/verify",
        "/auth",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
