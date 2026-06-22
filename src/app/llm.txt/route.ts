import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const content = `# rubjangNK - Platform for Local Technicians and Maids in Nong Khai

rubjangNK is a web application designed to connect customers with local service providers (technicians, handymen, and cleaners/maids) in Nong Khai, Thailand. The platform is entirely free for both customers and providers, with zero commission fees.

## Core Features
- Local Service Finder: Users can browse and filter technicians/maids by category and see distance-based listings.
- User/Provider Profiles: Dedicated pages displaying technician information, experiences, ratings, start rates, reviews, and LINE contact details.
- Real-time Chat: Direct communication between customers and providers (requires authentication/registration).
- Verified Badge System: Providers verified by ID cards have a certified badge.

## Core Service Categories
- Air Conditioning (ช่างแอร์)
- Plumbing (ช่างประปา)
- Electrical Services (ช่างไฟฟ้า)
- Maids & Cleaning (แม่บ้าน)
- Handyman/Maintenance (ช่างซ่อมบำรุง)
- Construction & Renovations (ช่างก่อสร้าง)

## Site Map & Routes
- Homepage: \`/\` - Main landing page listing categories and technicians.
- Register: \`/register\` - Signup form for technicians/maids.
- Technician Profile: \`/technician/[id]\` - Public profile page with reviews, rating average, experience details, and start rates.
- Verification: \`/verify\` - Internal verification route (ID card upload).
- Chat: \`/chat\` - Authenticated chat area.

## Key APIs & Data Fetching
- Database: Supabase is used as the primary data store.
- Authentication: Supabase Auth combined with LINE LIFF integration for login and verification.
- Location: Distances are calculated dynamically based on provider coordinates (latitude, longitude) and user-allowed geolocation coordinates.

---
For more information, visit https://rubjangnk.netlify.app.
`;

  return new NextResponse(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
