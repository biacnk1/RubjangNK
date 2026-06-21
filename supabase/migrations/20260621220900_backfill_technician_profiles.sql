-- =============================================================================
-- Backfill technician_profiles สำหรับช่างที่สมัครไปแล้ว
-- 
-- สาเหตุ: register/actions.ts เดิมใช้ supabase client ปกติ insert technician_profiles
--         แต่ table นี้มีแค่ SELECT policy → RLS บล็อก insert เงียบๆ
-- 
-- แก้ไขแล้ว: เปลี่ยนไปใช้ adminSupabase (service_role) แทนใน register/actions.ts
-- =============================================================================

INSERT INTO public.technician_profiles (user_id, application_id, is_verified, rating_avg, review_count)
SELECT 
  ta.user_id,
  ta.id,
  true,
  5.0,
  0
FROM public.technician_applications ta
LEFT JOIN public.technician_profiles tp ON tp.user_id = ta.user_id
WHERE tp.user_id IS NULL
  AND ta.status = 'approved';
