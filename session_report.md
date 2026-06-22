# Session Report: SEO & AEO Optimizations

**Date:** 2026-06-23  
**Status:** Completed and Pushed  
**Branch:** `main`  
**Deploy URL:** https://rubjangnk.netlify.app  

---

## 1. Goal Overview
Implement full Search Engine Optimization (SEO) and Answer Engine Optimization (AEO) requirements for the **rubjangNK** platform, introduce a dynamic sitemap and robots handler, include metadata and JSON-LD schemas, configure verification tags for Google Search Console, and write the `/llm.txt` route.

---

## 2. Completed Deliverables

### A. Dynamic Crawler Setup
- **`src/app/robots.ts`**: Implemented dynamic rules. Allowed homepage, registration, and profile pages while blocking private/authenticated routes (`/chat`, `/verify`, `/auth`).
- **`src/app/sitemap.ts`**: Generates `sitemap.xml` dynamically. Queries the `technician_profiles` table for `id` and `created_at` timestamps (since `updated_at` does not exist in the database), falling back gracefully to static routes if Supabase is offline.

### B. Dynamic & Static Page Metadata
- **`src/app/layout.tsx`**: Upgraded global metadata with `metadataBase`, OpenGraph/Twitter card configurations, standard canonical references, and the Google Site Verification key (`icVY5R2IgYzi0ROcLohRFssC7SOTcggErsqBzx7oO3s`).
- **`src/app/register/page.tsx`**: Configured static metadata, targeting local search terms like `"สมัครเป็นช่าง/แม่บ้าน"`.
- **`src/app/technician/[id]/page.tsx`**: Implemented `generateMetadata()` to query individual provider profiles and construct customized titles, descriptions, and canonical URLs.

### C. AEO Structured Data (JSON-LD Schemas)
- **Homepage (`src/app/page.tsx`)**: Injected `WebSite` schema, `LocalBusiness` details for Nong Khai, and standard `FAQPage` snippets to target direct search questions.
- **Profile page (`src/app/technician/[id]/page.tsx`)**: Injected `Service` schema with `Person` attributes, starting rates, and rating aggregates (only generated if reviews exist).

### D. LLM Integration
- **`src/app/llm.txt/route.ts`**: Dynamic Next.js route handler serving a plain text guide on rubjangNK's features, categories, and route structure at `/llm.txt`.

### E. Social Card Asset & Git Configuration
- **`public/og-default.png`**: Generated a dark-themed OpenGraph social image.
- **`.gitignore`**: Added an exception `!public/**/*.png` under `*.png` rules to ensure `og-default.png` and other public UI assets are tracked by Git.

---

## 3. Verification Details
- **Build test:** Executed `npm run build` locally. The Next.js production build succeeded with no errors.
- **Dynamic mapping check:** Fixed a schema error where the database does not contain `updated_at` on the `technician_profiles` table, switching the query to utilize `created_at` successfully.
- **Git Push:** Changes have been committed and successfully pushed to branch `main`.

---

## 4. Next Steps for Next Assistant / Session
1. **Trigger Netlify Build:** Ensure the push has successfully finished compiling on Netlify.
2. **Verify Google Search Console:** Go to Search Console and complete site verification for `https://rubjangnk.netlify.app`.
3. **Submit Sitemap:** Submit `https://rubjangnk.netlify.app/sitemap.xml` within the Search Console dashboard.
