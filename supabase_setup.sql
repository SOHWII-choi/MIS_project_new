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
  pages       text DEFAULT 'all',
  active      boolean DEFAULT true,
  last_login  timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- ── 4. kts_metrics_config (지표 관리 설정) ───────────────────
CREATE TABLE IF NOT EXISTS kts_metrics_config (
  id          int PRIMARY KEY DEFAULT 1,  -- 항상 id=1 단일 행 사용
  data        jsonb NOT NULL,
  updated_by  text,
  updated_at  timestamptz DEFAULT now()
);


-- ================================================================
-- RLS (Row Level Security) 설정
-- ================================================================
-- ⚠️ 앱이 anon 키로 읽기/쓰기를 모두 수행하므로 전체 허용
--    (보안의 핵심은 "데이터가 GitHub 공개 저장소에 없다"는 것)
--    데이터 접근은 앱 자체 로그인(kts_users) 으로 1차 통제됨
--
-- 향후 Supabase Auth 도입 시 아래 주석된 엄격한 정책으로 교체

ALTER TABLE kts_data           ENABLE ROW LEVEL SECURITY;
ALTER TABLE kts_upload_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kts_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kts_metrics_config ENABLE ROW LEVEL SECURITY;

-- 전체 테이블: anon 키로 읽기/쓰기 모두 허용
CREATE POLICY "kts_data_all"   ON kts_data           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "kts_log_all"    ON kts_upload_log     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "kts_users_all"  ON kts_users          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "kts_mc_all"     ON kts_metrics_config FOR ALL USING (true) WITH CHECK (true);


-- ================================================================
-- ※ 향후 Supabase Auth 기반 엄격한 RLS (참고용)
-- ================================================================
-- Supabase Auth 도입 후 위 정책을 삭제하고 아래로 교체:
--
-- -- 읽기: 로그인한 사용자만
-- CREATE POLICY "read_authenticated"
--   ON kts_data FOR SELECT
--   USING (auth.role() = 'authenticated');
--
-- -- 쓰기: 로그인 + admin 역할만
-- CREATE POLICY "write_admin"
--   ON kts_data FOR ALL
--   USING (
--     auth.role() = 'authenticated' AND
--     (SELECT role FROM kts_users WHERE user_id = auth.jwt()->>'email') = 'admin'
--   )
--   WITH CHECK (true);


-- ================================================================
-- 초기 데이터 업로드 방법
-- ================================================================
-- 1. 이 SQL을 Supabase SQL Editor에서 실행 (테이블 생성)
-- 2. 앱에 admin 계정으로 로그인
-- 3. Admin > 시스템 현황 > "전체 데이터 Supabase 재업로드" 버튼 클릭
--    → raw.js의 13개 카테고리가 kts_data에 저장됨
--    → 이후 raw.js는 오프라인 fallback 전용으로만 사용됨
