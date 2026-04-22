-- ================================================================
-- KT M&S 경영성과 대시보드 — Supabase 테이블 & RLS 설정
-- Supabase 대시보드 > SQL Editor에서 실행하세요
-- ================================================================

-- ── 1. kts_data (카테고리별 경영 데이터) ──────────────────────
CREATE TABLE IF NOT EXISTS kts_data (
  category    text PRIMARY KEY,   -- 'finance', 'wireless', 'wired', ...
  data        jsonb NOT NULL,     -- RAW[category] 전체 객체 (months + 지표 배열)
  updated_by  text,
  updated_at  timestamptz DEFAULT now()
);

-- ── 2. kts_upload_log (업로드 이력) ──────────────────────────
CREATE TABLE IF NOT EXISTS kts_upload_log (
  id          bigserial PRIMARY KEY,
  filename    text,
  category    text,
  period      text,
  rows_count  int,
  uploaded_by text,
  status      text DEFAULT 'success',
  note        text,
  created_at  timestamptz DEFAULT now()
);

-- ── 3. kts_users (사용자 계정) ───────────────────────────────
CREATE TABLE IF NOT EXISTS kts_users (
  user_id     text PRIMARY KEY,
  pw          text NOT NULL,
  role        text DEFAULT 'executive',  -- 'admin' | 'executive'
  name        text,
  title       text,
  pages       text DEFAULT 'all',        -- 'all' | 쉼표 구분 페이지 ID
  active      boolean DEFAULT true,
  last_login  timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- ── 4. kts_metrics_config (지표 관리 설정) ───────────────────
CREATE TABLE IF NOT EXISTS kts_metrics_config (
  id          int PRIMARY KEY DEFAULT 1,  -- 항상 id=1 단일 행 사용
  data        jsonb NOT NULL,             -- METRICS_L 배열 전체
  updated_by  text,
  updated_at  timestamptz DEFAULT now()
);


-- ================================================================
-- RLS (Row Level Security) 설정
-- ================================================================
-- ⚠️ 현재 앱은 Supabase Auth 미사용 (자체 kts_users 테이블로 인증)
--    → anon 키로 SELECT 허용, INSERT/UPDATE/DELETE는 service_role만 허용
--    → 향후 Supabase Auth 도입 시 아래 주석 처리된 정책으로 교체

ALTER TABLE kts_data           ENABLE ROW LEVEL SECURITY;
ALTER TABLE kts_upload_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kts_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kts_metrics_config ENABLE ROW LEVEL SECURITY;

-- kts_data: 읽기는 anon 허용, 쓰기는 service_role만
CREATE POLICY "kts_data_read"   ON kts_data FOR SELECT USING (true);
CREATE POLICY "kts_data_write"  ON kts_data FOR ALL    USING (auth.role() = 'service_role');

-- kts_upload_log: 읽기/쓰기 모두 anon 허용 (앱 내부에서만 호출)
CREATE POLICY "kts_log_all"     ON kts_upload_log FOR ALL USING (true);

-- kts_users: 읽기는 anon 허용 (로그인 조회), 쓰기는 service_role만
CREATE POLICY "kts_users_read"  ON kts_users FOR SELECT USING (true);
CREATE POLICY "kts_users_write" ON kts_users FOR ALL    USING (auth.role() = 'service_role');

-- kts_metrics_config: 읽기는 anon 허용, 쓰기는 service_role만
CREATE POLICY "kts_mc_read"     ON kts_metrics_config FOR SELECT USING (true);
CREATE POLICY "kts_mc_write"    ON kts_metrics_config FOR ALL    USING (auth.role() = 'service_role');


-- ================================================================
-- ※ 현재 RLS 한계 & 향후 개선 방향
-- ================================================================
-- 현재: anon 키가 JS 소스에 노출 → 누구나 읽기 가능
--       (단, raw.js처럼 GitHub에 노출되지는 않음 → 보안 향상)
--
-- 완전한 보안을 위한 다음 단계:
--   1. Supabase Auth 도입 (이메일/비밀번호 또는 SSO)
--   2. kts_users 기반 인증을 Supabase Auth로 마이그레이션
--   3. RLS 정책을 auth.uid() 기반으로 변경:
--
--      CREATE POLICY "authenticated_read"
--        ON kts_data FOR SELECT
--        USING (auth.role() = 'authenticated');
--
--      CREATE POLICY "admin_write"
--        ON kts_data FOR ALL
--        USING (
--          auth.role() = 'authenticated' AND
--          EXISTS (
--            SELECT 1 FROM kts_users
--            WHERE user_id = auth.jwt()->>'sub'
--            AND role = 'admin'
--          )
--        );


-- ================================================================
-- 초기 데이터 업로드 방법
-- ================================================================
-- 앱에 로그인 후 Admin > 시스템 현황 페이지에서
-- "전체 데이터 Supabase 재업로드" 버튼을 클릭하세요.
-- → raw.js의 모든 카테고리 데이터가 kts_data 테이블에 저장됩니다.
-- → 이후 raw.js는 오프라인 fallback 전용으로만 사용됩니다.
