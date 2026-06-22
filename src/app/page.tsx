import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import DistanceSearchList from "@/components/DistanceSearchList";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient();

  let dbCategories = null;
  let dbTechnicians = null;

  try {
    const [catRes, techRes] = await Promise.all([
      supabase.from('service_categories').select('*'),
      supabase.from('technician_profiles')
        .select(`
          *,
          technician_applications!inner(
            full_name,
            experience_years,
            latitude,
            longitude,
            starting_rate,
            service_categories!inner(name_th)
          ),
          profiles!inner(display_name, avatar_url)
        `)
        .limit(8)
    ]);

    dbCategories = catRes.data;
    dbTechnicians = techRes.data;
  } catch (error) {
    console.warn("Supabase connection failed. Falling back to mock data.");
  }

  const categories = dbCategories && dbCategories.length > 0 ? dbCategories.map(c => ({
    id: c.id, name: c.name_th, iconUrl: c.icon_url || null,
  })) : [
    { id: "1", name: "ช่างแอร์", iconUrl: null },
    { id: "2", name: "ช่างประปา", iconUrl: null },
    { id: "3", name: "ช่างไฟฟ้า", iconUrl: null },
    { id: "4", name: "แม่บ้าน", iconUrl: null },
    { id: "5", name: "ช่างซ่อมบำรุง", iconUrl: null },
    { id: "6", name: "ช่างก่อสร้าง", iconUrl: null },
  ];

  const technicians = dbTechnicians && dbTechnicians.length > 0 ? dbTechnicians.map((t: any) => {
    const app = t.technician_applications;
    return {
      id: t.id,
      userId: t.user_id,
      name: t.profiles?.display_name || app?.full_name || 'ช่างนิรนาม',
      category: app?.service_categories?.name_th || 'ทั่วไป',
      avatarUrl: t.profiles?.avatar_url || null,
      isVerified: t.is_verified,
      isFeatured: t.is_featured,
      rating: t.rating_avg ?? null,
      reviewCount: t.review_count,
      experience: app?.experience_years || 0,
      startingRate: app?.starting_rate || null,
      latitude: app?.latitude || t.latitude || null,
      longitude: app?.longitude || t.longitude || null,
    };
  }) : [
    {
      id: "11111111-1111-1111-1111-111111111111",
      userId: "11111111-1111-1111-1111-111111111111",
      name: "ช่างสมชาย รับซ่อมแอร์",
      category: "ช่างแอร์",
      isVerified: true,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 24,
      experience: 5,
      latitude: 17.8810,
      longitude: 102.7480,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      userId: "22222222-2222-2222-2222-222222222222",
      name: "ช่างชัย เดินสายไฟ",
      category: "ช่างไฟฟ้า",
      isVerified: true,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 56,
      experience: 10,
      latitude: 17.8850,
      longitude: 102.7550,
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      userId: "33333333-3333-3333-3333-333333333333",
      name: "พี่นอม รับจ้างทำความสะอาด",
      category: "แม่บ้าน",
      isVerified: false,
      isFeatured: false,
      rating: 4.5,
      reviewCount: 12,
      experience: 2,
      latitude: 17.8700,
      longitude: 102.7400,
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      userId: "44444444-4444-4444-4444-444444444444",
      name: "ช่างเอก ท่อประปา",
      category: "ช่างประปา",
      isVerified: true,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 8,
      experience: 15,
      latitude: 17.8900,
      longitude: 102.7600,
    }
  ];

  return (
    <div className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>หาช่าง - แม่บ้าน ใกล้บ้านคุณในหนองคาย</h1>
          <p className={styles.heroSubtitle}>บริการคุณภาพ เชื่อถือได้ ค้นหาง่าย ครบจบในที่เดียว</p>
          <p className={styles.heroHighlight}>ฟรีไม่มีค่าคอม • ช่าง Verified</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <DistanceSearchList initialTechnicians={technicians} categories={categories} />
        </div>
      </section>
    </div>
  );
}
