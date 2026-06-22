import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rubjangnk.netlify.app";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Sitemap: Supabase credentials missing. Returning static entries only.");
      return staticEntries;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: profiles, error } = await supabase
      .from("technician_profiles")
      .select("id, created_at");

    if (error) {
      console.error("Sitemap: Error fetching technician profiles:", error);
      return staticEntries;
    }

    if (profiles && profiles.length > 0) {
      const dynamicEntries: MetadataRoute.Sitemap = profiles.map((p) => ({
        url: `${baseUrl}/technician/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
      return [...staticEntries, ...dynamicEntries];
    }
  } catch (err) {
    console.error("Sitemap generation failed, returning static only:", err);
  }

  return staticEntries;
}
