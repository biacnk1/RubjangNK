import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ReviewForm from './ReviewForm';
import styles from './page.module.css';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();

  const { data: tech } = await supabase
    .from('technician_profiles')
    .select(`
      *,
      technician_applications!inner(
        full_name,
        experience_years,
        starting_rate,
        service_categories!inner(name_th)
      ),
      profiles!inner(display_name, avatar_url)
    `)
    .eq('id', params.id)
    .single();

  if (!tech) {
    return {
      title: 'ไม่พบข้อมูลช่าง | rubjangNK',
    };
  }

  const app = tech.technician_applications;
  const profile = tech.profiles;
  const name = profile?.display_name || app?.full_name || 'ช่างนิรนาม';
  const category = app?.service_categories?.name_th || 'ทั่วไป';
  const experience = app?.experience_years || 0;
  const rating = tech.rating_avg != null && tech.review_count > 0 ? Number(tech.rating_avg).toFixed(1) : '-';
  const reviewCount = tech.review_count || 0;
  const startingRate = app?.starting_rate != null ? Number(app.starting_rate).toLocaleString() : 'ไม่ระบุ';
  const avatarUrl = profile?.avatar_url || 'https://rubjangnk.netlify.app/og-default.png';

  const title = `${name} — ช่าง${category} หนองคาย | rubjangNK`;
  const description = `ช่าง${category} ประสบการณ์ ${experience} ปี ⭐ ${rating} (${reviewCount} รีวิว) เริ่มต้น ฿${startingRate} — หนองคาย`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [avatarUrl],
      type: 'profile',
    },
    alternates: {
      canonical: `https://rubjangnk.netlify.app/technician/${params.id}`,
    },
  };
}

export default async function TechnicianProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: tech } = await supabase
    .from('technician_profiles')
    .select(`
      *,
      technician_applications!inner(
        full_name,
        experience_years,
        latitude,
        longitude,
        starting_rate,
        portfolio_urls,
        service_categories!inner(name_th)
      ),
      profiles!inner(display_name, avatar_url)
    `)
    .eq('id', params.id)
    .single();

  if (!tech) return notFound();

  const app = tech.technician_applications;
  const profile = tech.profiles;

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles!reviewer_id(display_name, avatar_url)')
    .eq('technician_profile_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;
  const isOwnProfile = currentUserId === tech.user_id;

  const alreadyReviewed = reviews?.some(r => r.reviewer_id === currentUserId) ?? false;

  const name = profile?.display_name || app?.full_name || 'ช่างนิรนาม';
  const category = app?.service_categories?.name_th || 'ทั่วไป';
  const avatarUrl = profile?.avatar_url || '';
  const startingRateRaw = app?.starting_rate;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `บริการ${category} — ${name}`,
    "description": `บริการ${category}ในหนองคาย โดย ${name}`,
    "provider": {
      "@type": "Person",
      "name": name,
      ...(avatarUrl ? { "image": avatarUrl } : {}),
      "jobTitle": category,
      "worksFor": {
        "@type": "Organization",
        "name": "rubjangNK"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": "หนองคาย"
    },
    ...(startingRateRaw != null ? {
      "offers": {
        "@type": "Offer",
        "priceCurrency": "THB",
        "price": startingRateRaw,
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "THB",
          "price": startingRateRaw,
          "description": "ราคาเริ่มต้น"
        }
      }
    } : {}),
    ...(tech.review_count > 0 && tech.rating_avg != null ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tech.rating_avg,
        "reviewCount": tech.review_count,
        "bestRating": 5,
        "worstRating": 1
      }
    } : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.page}>
        <div className={styles.container}>
        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={120}
                height={120}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {(profile?.display_name || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.name}>
              {profile?.display_name || app?.full_name || 'ช่างนิรนาม'}
            </h1>
            <span className={styles.category}>{app?.service_categories?.name_th || 'ทั่วไป'}</span>

            <div className={styles.badges}>
              {tech.is_verified && (
                <span className={styles.badgeVerified}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Verified
                </span>
              )}
              {tech.is_featured && (
                <span className={styles.badgeFeatured}>&#9733; แนะนำ</span>
              )}
            </div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {tech.rating_avg != null && tech.review_count > 0
                    ? Number(tech.rating_avg).toFixed(1)
                    : '-'}
                </span>
                <span className={styles.statLabel}>คะแนน</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{tech.review_count || 0}</span>
                <span className={styles.statLabel}>รีวิว</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statValue}>{app?.experience_years || 0}</span>
                <span className={styles.statLabel}>ปี ประสบการณ์</span>
              </div>
            </div>

            {app?.starting_rate != null && (
              <div className={styles.price}>เริ่มต้น &#3647;{Number(app.starting_rate).toLocaleString()}</div>
            )}
          </div>
        </div>

        {/* Contact actions */}
        {!isOwnProfile && (
          <div className={styles.actions}>
            <Link href={`/chat/new/${tech.user_id}`} className={styles.btnContact}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              ติดต่อทาง LINE
            </Link>
          </div>
        )}

        {isOwnProfile && !tech.is_verified && (
          <div className={styles.verifyBanner}>
            <Link href="/verify" className={styles.verifyLink}>
              &#128179; ยืนยันตัวตน — อัพโหลดบัตรประชาชนเพื่อรับ Verified badge
            </Link>
          </div>
        )}

        {/* Portfolio */}
        {app?.portfolio_urls && app.portfolio_urls.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>ผลงาน / ลิงก์</h2>
            <div className={styles.portfolioList}>
              {app.portfolio_urls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={styles.portfolioLink}>
                  {url}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            รีวิวจากลูกค้า ({tech.review_count || 0})
          </h2>

          {reviews && reviews.length > 0 ? (
            <div className={styles.reviewList}>
              {reviews.map((review: any) => {
                const reviewer = review.profiles;
                return (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewerName}>
                        {reviewer?.display_name || 'ลูกค้า'}
                      </span>
                      <span className={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className={styles.reviewStars}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    {review.comment && (
                      <p className={styles.reviewComment}>{review.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyReviews}>ยังไม่มีรีวิว</p>
          )}

          {/* Review form — only for logged-in non-owner users */}
          {currentUserId && !isOwnProfile && !alreadyReviewed && (
            <ReviewForm techProfileId={params.id} />
          )}

          {alreadyReviewed && (
            <p className={styles.alreadyReviewed}>คุณได้รีวิวช่างคนนี้แล้ว</p>
          )}
        </section>

        <div className={styles.backLink}>
          <Link href="/">&#8592; กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
    </>
  );
}
