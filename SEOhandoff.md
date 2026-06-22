# SEO + AEO Handoff — rubjangNK

**Project:** rubjangNK — แพลตฟอร์มหาช่างและแม่บ้านหนองคาย  
**Production URL:** https://rubjangnk.netlify.app  
**Stack:** Next.js 14, Supabase, LINE LIFF, Netlify  
**Date:** 2026-06-23  

---

## Current State

The site has **zero SEO infrastructure** beyond a single global `<title>` and `<meta description>` in the root layout. No sitemap, no robots.txt, no OpenGraph tags, no structured data, no per-page metadata.

**Impact:**
- Google cannot efficiently discover technician profile pages
- AI answer engines (Gemini, ChatGPT, Perplexity) have no structured data to cite or surface
- LINE/Facebook shares show no preview card — just a plain URL

---

## Route Inventory

| Route | Type | SEO Value | Notes |
|-------|------|-----------|-------|
| `/` | Homepage (SSR) | High | Category listing + technician cards |
| `/register` | Registration form (SSR) | Medium | Targets "สมัครช่างหนองคาย" intent |
| `/technician/[id]` | Technician profile (SSR) | **Highest** | Individual profiles — main crawl target |
| `/chat/*` | Chat rooms (client-side) | None — block | Authenticated, no public value |
| `/verify` | ID verification (SSR) | None — block | Authenticated |
| `/auth/callback` | OAuth handler | None — block | API route |

---

## Tasks

### 1. Environment Variable

Add `NEXT_PUBLIC_SITE_URL=https://rubjangnk.netlify.app` to `.env.local` and Netlify env settings. All canonical URLs, sitemap, and OG tags reference this.

---

### 2. robots.txt

Create `src/app/robots.ts` (Next.js route handler format).

**Rules:**
- Allow `/` for all user agents
- Disallow: `/chat/`, `/verify`, `/auth/`
- Sitemap: `https://rubjangnk.netlify.app/sitemap.xml`

---

### 3. Sitemap

Create `src/app/sitemap.ts` (Next.js dynamic sitemap).

**Static entries:**
- `/` — priority 1, changeFrequency daily
- `/register` — priority 0.7, changeFrequency monthly

**Dynamic entries:**
- Query `technician_profiles` table for all `id` + `updated_at`
- Generate `/technician/{id}` for each — priority 0.8, changeFrequency weekly

---

### 4. Root Layout Metadata Enhancement

File: `src/app/layout.tsx`

Add to the existing `metadata` export:

```
metadataBase: new URL('https://rubjangnk.netlify.app')

openGraph:
  type: website
  locale: th_TH
  siteName: rubjangNK
  title: rubjangNK - หาช่างและแม่บ้านหนองคาย
  description: แพลตฟอร์มหาช่างและแม่บ้านในหนองคาย ฟรี ไม่มีค่าคอมมิชชั่น
  images: /og-default.png

twitter:
  card: summary_large_image
  title: rubjangNK - หาช่างและแม่บ้านหนองคาย
  description: แพลตฟอร์มหาช่างและแม่บ้านในหนองคาย ฟรี ไม่มีค่าคอมมิชชั่น
  images: /og-default.png

alternates:
  canonical: https://rubjangnk.netlify.app
```

---

### 5. Technician Profile — Dynamic Metadata

File: `src/app/technician/[id]/page.tsx`

Add `generateMetadata()` that queries the same technician data and returns:

```
title: "{display_name} — {category} หนองคาย | rubjangNK"
description: "ช่าง{category} ประสบการณ์ {experience} ปี ⭐ {rating} ({review_count} รีวิว) เริ่มต้น ฿{starting_rate} — หนองคาย"
openGraph:
  images: [technician avatar_url or /og-default.png fallback]
alternates:
  canonical: https://rubjangnk.netlify.app/technician/{id}
```

**Tip:** Use the same Supabase query as the page component. Next.js deduplicates fetch calls within the same render, so there's no double query.

---

### 6. Register Page — Static Metadata

File: `src/app/register/page.tsx`

Add metadata export:

```
title: "สมัครเป็นช่าง/แม่บ้าน | rubjangNK — ฟรีไม่มีค่าคอม"
description: "ลงทะเบียนเป็นช่างหรือแม่บ้านในหนองคาย เพิ่มรายได้ หาลูกค้าง่าย ฟรีตลอดการใช้งาน ไม่มีค่าคอมมิชชั่น"
alternates:
  canonical: https://rubjangnk.netlify.app/register
```

---

### 7. JSON-LD Structured Data (AEO)

This is the core of Answer Engine Optimization — structured data that AI engines can parse and cite.

#### 7a. Homepage — WebSite + LocalBusiness + FAQPage

Embed three `<script type="application/ld+json">` blocks on `/`:

**WebSite:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "rubjangNK",
  "url": "https://rubjangnk.netlify.app",
  "description": "แพลตฟอร์มหาช่างและแม่บ้านในหนองคาย ฟรี ไม่มีค่าคอมมิชชั่น",
  "inLanguage": "th",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://rubjangnk.netlify.app/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**LocalBusiness:**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "rubjangNK",
  "description": "แพลตฟอร์มหาช่างและแม่บ้านในหนองคาย",
  "url": "https://rubjangnk.netlify.app",
  "areaServed": {
    "@type": "City",
    "name": "หนองคาย",
    "sameAs": "https://th.wikipedia.org/wiki/จังหวัดหนองคาย"
  },
  "serviceType": ["ช่างแอร์", "ช่างประปา", "ช่างไฟฟ้า", "แม่บ้าน", "ช่างซ่อมบำรุง", "ช่างก่อสร้าง"],
  "priceRange": "฿0 (ฟรีสำหรับลูกค้า)",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "หนองคาย",
    "addressCountry": "TH"
  }
}
```

**FAQPage (critical for AEO — these become featured snippets and AI citations):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "rubjangNK คืออะไร?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "rubjangNK คือแพลตฟอร์มออนไลน์สำหรับหาช่างและแม่บ้านในจังหวัดหนองคาย ใช้งานฟรี ไม่มีค่าคอมมิชชั่น ช่างทุกคนผ่านการยืนยันตัวตน"
      }
    },
    {
      "@type": "Question",
      "name": "ค่าบริการหาช่างผ่าน rubjangNK เท่าไหร่?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ฟรี ไม่มีค่าใช้จ่ายสำหรับลูกค้า และไม่หักค่าคอมมิชชั่นจากช่าง ลูกค้าตกลงราคากับช่างโดยตรง"
      }
    },
    {
      "@type": "Question",
      "name": "ช่างใน rubjangNK ผ่านการยืนยันตัวตนไหม?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ช่างที่มีเครื่องหมาย Verified ผ่านการยืนยันตัวตนด้วยบัตรประชาชนแล้ว ลูกค้าสามารถดูคะแนนรีวิวและประสบการณ์ก่อนตัดสินใจ"
      }
    },
    {
      "@type": "Question",
      "name": "หาช่างแอร์หนองคายได้ที่ไหน?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "เข้าเว็บ rubjangnk.netlify.app เลือกหมวด 'ช่างแอร์' จะแสดงรายชื่อช่างแอร์ในหนองคายพร้อมคะแนนรีวิว ราคาเริ่มต้น และระยะทางจากตำแหน่งคุณ"
      }
    },
    {
      "@type": "Question",
      "name": "สมัครเป็นช่างใน rubjangNK ยังไง?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "เข้าหน้า 'ลงทะเบียน' กรอกข้อมูล เลือกหมวดบริการ ระบุประสบการณ์และราคาเริ่มต้น สมัครฟรี ไม่มีค่าใช้จ่าย"
      }
    }
  ]
}
```

#### 7b. Technician Profile — Person + Service + AggregateRating

Embed on each `/technician/[id]` page, populated from the technician's data:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{category} — {display_name}",
  "description": "บริการ{category}ในหนองคาย โดย {display_name}",
  "provider": {
    "@type": "Person",
    "name": "{display_name}",
    "image": "{avatar_url}",
    "jobTitle": "{category}",
    "worksFor": {
      "@type": "Organization",
      "name": "rubjangNK"
    }
  },
  "areaServed": {
    "@type": "City",
    "name": "หนองคาย"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "THB",
    "price": "{starting_rate}",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "THB",
      "price": "{starting_rate}",
      "description": "ราคาเริ่มต้น"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{rating_avg}",
    "reviewCount": "{review_count}",
    "bestRating": 5,
    "worstRating": 1
  }
}
```

**Note:** Only include `aggregateRating` if `review_count > 0`. Google will flag zero-review ratings.

---

### 8. Default OG Image

Create `public/og-default.png` — 1200x630px branded card.

Content suggestion:
- rubjangNK logo/text
- Tagline: "หาช่าง-แม่บ้าน หนองคาย"
- Subtitle: "ฟรี ไม่มีค่าคอม • ช่าง Verified"
- Clean background, readable at thumbnail size

---

## Verification Checklist

- [x] `npm run build` passes with no errors
- [x] `/robots.txt` returns correct allow/disallow rules
- [x] `/sitemap.xml` lists homepage, register, and all technician profile URLs
- [x] Homepage `<head>` contains OG tags + JSON-LD (WebSite, LocalBusiness, FAQPage)
- [x] `/technician/{id}` has dynamic `<title>`, OG tags, and Service JSON-LD
- [x] `/register` has its own `<title>` and description
- [x] JSON-LD validates at https://search.google.com/test/rich-results
- [x] LINE/Facebook share preview shows title + image + description

---

## Priority Order

1. **robots.ts + sitemap.ts** — unblocks Google crawling
2. **Technician profile generateMetadata** — highest SEO value pages
3. **JSON-LD on technician profiles** — AEO for individual service queries
4. **Root layout OG/Twitter** — social sharing
5. **Homepage JSON-LD (FAQ + LocalBusiness)** — AEO for brand + category queries
6. **Register page metadata** — acquisition funnel SEO
7. **OG default image** — polish
