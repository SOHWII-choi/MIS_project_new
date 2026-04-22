// render/admin.js — 관리자 페이지 렌더
import { RAW } from '../data/raw.js';
import { S, MENUS } from '../utils/state.js';
import { fmt } from '../utils/calc.js';
import { kpi } from '../utils/kpi.js';
import { showToast } from '../utils/toast.js';

// ── ADMIN DATA ──
export const UPLOAD_H = [
  { id: 1, file: '경영성과_재무.xlsx', cat: '재무', period: '23.1~25.12', rows: 8, cols: 36, size: '42KB', date: '2025-12-31 09:12', user: '최관리', ok: true, note: '23~25년 전체 재무지표', preview: [['월', '총매출', '통신매출', '영업이익'], ['25.12월', '507.17', '490.82', '-21.86'], ['25.11월', '569.38', '515.05', '-8.25'], ['25.10월', '572.42', '526.3', '-18.31']] },
  { id: 2, file: '경영성과_무선_가입자.xlsx', cat: '무선 가입자', period: '23.1~25.12', rows: 7, cols: 36, size: '38KB', date: '2025-12-31 09:14', user: '최관리', ok: true, note: '일반후불 채널별 무선 가입자', preview: [['월', '유지', 'CAPA', '해지', '순증'], ['25.12월', '1,647,799', '52,735', '19,584', '-24,490'], ['25.11월', '1,672,289', '52,601', '17,373', '-21,327']] },
  { id: 3, file: '경영성과_유선_가입자.xlsx', cat: '유선 가입자', period: '23.1~25.12', rows: 7, cols: 36, size: '36KB', date: '2025-12-31 09:15', user: '최관리', ok: true, note: '인터넷+TV 유선 가입자', preview: [['월', '유지_전체', '신규', '해지', '순증'], ['25.12월', '248,042', '7,134', '3,051', '-6,438'], ['25.11월', '254,480', '7,481', '2,850', '-6,165']] },
  { id: 4, file: '경영성과_유무선_가입자_조직별_.xlsx', cat: '통합본(14시트)', period: '23.1~25.12', rows: 120, cols: 36, size: '290KB', date: '2025-12-31 09:20', user: '최관리', ok: true, note: '재무·무선·유선·채널·기타 전체 통합', preview: [['시트명', '행수', '비고'], ['재무', '8행', '총매출~마케팅비'], ['무선(채널별)', '7행', '유지/CAPA/해지/순증'], ['유선(채널별)', '7행', '인터넷+TV'], ['유무선(조직별)', '5행', '소매/도매/디지털/B2B/소상공인']] },
  { id: 5, file: '경영성과_디지털_채널_.xlsx', cat: '디지털', period: '23.1~25.12', rows: 8, cols: 36, size: '34KB', date: '2025-12-31 09:22', user: '정데이터', ok: true, note: 'KT닷컴 채널 실적', preview: [['월', '일반후불_총계', '운영후불', '유선순신규', '인력'], ['25.12월', '12,178', '8,793', '242', '136'], ['25.11월', '11,138', '8,605', '270', '135']] },
  { id: 6, file: '경영성과_B2B_채널_.xlsx', cat: 'B2B', period: '23.1~25.12', rows: 16, cols: 36, size: '45KB', date: '2025-12-31 09:23', user: '정데이터', ok: true, note: '기업/법인 B2B 실적', preview: [['월', '전체_일반후불', '전체_무선순증', '가입자_무선유지'], ['25.12월', '3,470', '69', '207,314'], ['25.11월', '5,004', '3,977', '208,510']] },
  { id: 7, file: '경영성과_소상공인_채널_.xlsx', cat: '소상공인', period: '23.1~25.12', rows: 9, cols: 36, size: '32KB', date: '2025-12-31 09:24', user: '정데이터', ok: true, note: '소상공인 채널 상품 실적', preview: [['월', '일반후불', '운영후불', '인터넷순신규', '인력'], ['25.12월', '103', '74', '381', '68'], ['25.11월', '194', '131', '487', '102']] },
  { id: 8, file: '경영성과_유통플랫폼_채널_.xlsx', cat: '유통플랫폼', period: '24.1~25.12', rows: 6, cols: 24, size: '28KB', date: '2025-12-31 09:25', user: '정데이터', ok: true, note: '중고폰/시연폰 유통 실적', preview: [['월', '중고폰_매입건수', '중고폰_매각건수', '시연폰_매각이익'], ['25.12월', '1,959', '2,087', '1.2억'], ['25.11월', '2,397', '4,171', '2.8억']] },
  { id: 9, file: '경영성과_TCSI_기타_.xlsx', cat: 'TCSI', period: '23.1~25.12', rows: 13, cols: 36, size: '40KB', date: '2025-12-31 09:26', user: '정데이터', ok: true, note: 'TCSI·KT점수·지역별 소매점수', preview: [['월', 'TCSI점수', 'KT점수', '대리점점수'], ['25.12월', '98.7', '97.7', '97.4'], ['25.11월', '98.6', '97.7', '97.3']] },
  { id: 10, file: '경영성과_영업품질_기타_.xlsx', cat: '영업품질', period: '23.1~25.12', rows: 55, cols: 36, size: '48KB', date: '2025-12-31 09:27', user: '최관리', ok: true, note: 'R-VOC 발생률·대외민원', preview: [['월', '도+소매발생률', '소매발생률', '도매발생률', '대외민원'], ['25.12월', '0.4832%', '0.5054%', '0.4635%', '13건'], ['25.11월', '0.3911%', '0.4638%', '0.3251%', '19건']] },
  { id: 11, file: '경영성과_인력_기타_.xlsx', cat: '인력', period: '23.1~25.12', rows: 115, cols: 36, size: '62KB', date: '2025-12-31 09:28', user: '최관리', ok: true, note: '직급별·조직별·채널별 인력', preview: [['월', '전사계', '임원', '일반직', '영업직', 'SC직'], ['25.12월', '2,200', '8', '184', '1,830', '145'], ['25.11월', '2,193', '8', '189', '1,815', '146']] },
  { id: 12, file: '경영성과_인프라_기타_.xlsx', cat: '인프라', period: '23.1~25.12', rows: 340, cols: 36, size: '95KB', date: '2025-12-31 09:29', user: '최관리', ok: true, note: '소매매장수·생산성·도매취급점', preview: [['월', '소매매장수', '출점', '퇴점', '도매무선취급점'], ['25.12월', '250', '1', '3', '4,212'], ['25.11월', '252', '1', '1', '4,174']] },
  { id: 13, file: '경영성과_전략상품_기타_.xlsx', cat: '전략상품', period: '23.1~25.12', rows: 29, cols: 36, size: '38KB', date: '2025-12-31 09:30', user: '최관리', ok: true, note: '하이오더·GiGAeyes·AI전화 등', preview: [['월', '하이오더_점포수', 'GiGAeyes_계', 'AI전화'], ['25.12월', '57', '1,401', '6'], ['25.11월', '64', '1,839', '12']] },
];

export let METRICS_L = [
  { id: 1,  name: '총매출',              cat: '재무',    unit: '억원', pos: '재무 KPI',   desc: '수수료매출+상품매출 합산. 회사 최우선 핵심 지표',       src: 'finance.총매출',          on: true },
  { id: 2,  name: '수수료매출(통신)',     cat: '재무',    unit: '억원', pos: '재무 KPI',   desc: '통신 서비스 수수료 매출 (무선+유선)',                   src: 'finance.통신매출',         on: true },
  { id: 3,  name: '수수료매출(유통플랫폼)', cat: '재무',  unit: '억원', pos: '재무 KPI',   desc: '유통플랫폼(중고폰/시연폰) 수수료 매출',                 src: 'platform.중고폰_매입금액', on: true },
  { id: 4,  name: '영업이익',             cat: '재무',    unit: '억원', pos: '재무 KPI',   desc: '총매출 - 총비용. 최우선 수익성 지표',                   src: 'finance.영업이익',         on: true },
  { id: 5,  name: '소매 채널 영업이익',   cat: '채널',    unit: '억원', pos: '채널 KPI',   desc: '소매 채널 기여 영업이익 (추정)',                         src: 'org.소매',                 on: true },
  { id: 6,  name: '도매 채널 영업이익',   cat: '채널',    unit: '억원', pos: '채널 KPI',   desc: '도매 채널 기여 영업이익 (추정)',                         src: 'org.도매',                 on: true },
  { id: 7,  name: '디지털 채널 영업이익', cat: '채널',    unit: '억원', pos: '채널 KPI',   desc: '디지털(KT닷컴/O2O) 채널 기여 이익',                    src: 'org.디지털',               on: true },
  { id: 8,  name: 'B2B 채널 영업이익',   cat: '채널',    unit: '억원', pos: '채널 KPI',   desc: 'B2B(기업/법인) 채널 기여 이익',                        src: 'org.B2B',                  on: true },
  { id: 9,  name: '유선 유지 가입자',     cat: '유선',    unit: '명',   pos: '유선 KPI',   desc: '인터넷+TV 유지 가입자 전체',                           src: 'wired.유지_전체',          on: true },
  { id: 10, name: 'TCSI 점수',           cat: '품질',    unit: '점',   pos: '품질 KPI',   desc: '고객 서비스 만족도 (높을수록 우수)',                    src: 'tcsi.TCSI점수',            on: true },
  { id: 11, name: 'VOC 도+소매 발생률',  cat: '품질',    unit: '%',    pos: '품질 KPI',   desc: 'R-VOC 발생률 (낮을수록 우수)',                          src: 'voc.도소매발생률',          on: true },
  { id: 12, name: '소매 매장수',          cat: '인프라',  unit: '개',   pos: '인프라 KPI', desc: '소매 매장 Infra 합계',                                 src: 'infra.소매매장수_계',       on: true },
  { id: 13, name: 'GiGAeyes',            cat: '전략상품', unit: '대',  pos: '전략 KPI',   desc: '전략상품 GiGAeyes 신규 공급 누계',                      src: 'strategy.GiGAeyes_계',    on: true },
  { id: 14, name: '전사 인원',            cat: '인력',    unit: '명',   pos: '인력 KPI',   desc: 'KT M&S 전사 임직원 합계',                              src: 'hr.전사계',                on: true },
];
let _editMetricIdx = -1;

export let USERS_FULL = [
  { idx: 0, name: '김철수',   id: 'ceo',    pw: 'kt2025',     email: 'cs.kim@kt.com',  title: '대표이사',      role: 'executive', pages: ['all'], admin: [],               last: '2025-12-31', on: true },
  { idx: 1, name: '이영희',   id: 'cfo',    pw: 'kt2025',     email: 'yh.lee@kt.com',  title: '재무본부장',    role: 'executive', pages: ['all'], admin: [],               last: '2025-12-30', on: true },
  { idx: 2, name: '박민준',   id: 'cso',    pw: 'kt2025',     email: 'mj.park@kt.com', title: '영업총괄',      role: 'executive', pages: ['finance', 'wireless', 'wired', 'org'], admin: [], last: '2025-12-29', on: true },
  { idx: 3, name: '정지현',   id: 'cmo',    pw: 'kt2025',     email: 'jh.jung@kt.com', title: '마케팅본부장',  role: 'executive', pages: ['all'], admin: [],               last: '2025-12-28', on: true },
  { idx: 4, name: '최현우',   id: 'sales1', pw: 'kt2025',     email: 'hw.choi@kt.com', title: '소매영업팀장',  role: 'executive', pages: ['wireless', 'wired', 'org', 'digital'], admin: [], last: '2025-12-27', on: true },
  { idx: 5, name: '최관리',   id: 'admin',  pw: 'admin1234',  email: 'admin@kt.com',   title: '시스템관리자',  role: 'admin',     pages: ['all'], admin: ['all'],           last: '2025-12-31', on: true },
  { idx: 6, name: '정데이터', id: 'data',   pw: 'data1234',   email: 'data@kt.com',    title: '데이터팀',      role: 'admin',     pages: ['all'], admin: ['upload', 'export'], last: '2025-12-28', on: true },
];
let _editUserIdx = -1;

const ALL_PAGES = ['finance', 'wireless', 'wired', 'org', 'digital', 'b2b', 'smb', 'platform', 'quality', 'infra', 'strategy', 'hr'];
const PAGE_LABELS = { finance: '재무', wireless: '무선', wired: '유선', org: '조직별', digital: '디지털', b2b: 'B2B', smb: '소상공인', platform: '유통플랫폼', quality: 'TCSI/VOC', infra: '인프라', strategy: '전략상품', hr: '인력' };
const ADMIN_PAGES = ['overview', 'upload', 'metrics', 'users', 'export', 'beta'];
const ADMIN_LABELS = { overview: '시스템현황', upload: '데이터업로드', metrics: '지표관리', users: '사용자관리', export: '보고서', beta: '베타배포' };
let _showPwIdx = new Set();
let _findTab = 'id';
let _deployHistory = [
  { dt: '2025-12-31 09:00', user: '최관리', cnt: 3, ok: true },
  { dt: '2025-12-15 14:22', user: '최관리', cnt: 7, ok: true },
  { dt: '2025-12-01 10:05', user: '최관리', cnt: 2, ok: true },
];
const _pendingChanges = [
  { type: 'add', icon: '🟢', msg: '지표 추가: 수수료매출(유통플랫폼)' },
  { type: 'mod', icon: '🟡', msg: '지표 수정: 총매출 → 표시위치 변경' },
  { type: 'del', icon: '🔴', msg: '지표 삭제: 무선 순증 (비활성화)' },
  { type: 'mod', icon: '🟡', msg: '사용자 권한 변경: 최현우 열람범위 확대' },
  { type: 'add', icon: '🟢', msg: '파일 업로드: 경영성과_전략상품_기타_.xlsx' },
];
let _deployed = false;

export function addPendingChange(type, msg) {
  const icons = { add: '🟢', mod: '🟡', del: '🔴', edit: '🔵' };
  _pendingChanges.unshift({ type, icon: icons[type] || '🟡', msg, dt: new Date().toLocaleString('ko-KR') });
  _deployed = false;
  // 베타 페이지가 열려있으면 즉시 갱신
  if (document.getElementById('beta-changes')) {
    renderAdminBeta();
    const badge = document.getElementById('beta-status-badge');
    if (badge) { badge.textContent = `● BETA — 변경 ${_pendingChanges.length}건 대기`; badge.style.background = 'rgba(245,158,11,.15)'; badge.style.color = 'var(--gold)'; badge.style.borderColor = 'rgba(245,158,11,.3)'; }
    const deployBtn = document.getElementById('deploy-btn');
    if (deployBtn) { deployBtn.disabled = false; deployBtn.textContent = '🚀 지금 배포하기'; }
  }
}

// ── RAW 데이터 소스 맵 ──
const SRC_META = {
  finance:  { label: '💰 재무',       icon: '💰' },
  wireless: { label: '📱 무선 가입자', icon: '📱' },
  wired:    { label: '🌐 유선 가입자', icon: '🌐' },
  org:      { label: '🏢 조직별 실적', icon: '🏢' },
  digital:  { label: '💻 디지털 채널', icon: '💻' },
  b2b:      { label: '🏭 B2B 채널',   icon: '🏭' },
  smb:      { label: '🏪 소상공인',    icon: '🏪' },
  platform: { label: '♻️ 유통플랫폼',  icon: '♻️' },
  tcsi:     { label: '⭐ TCSI',        icon: '⭐' },
  voc:      { label: '📊 VOC 품질',    icon: '📊' },
  hr:       { label: '👥 인력',        icon: '👥' },
  infra:    { label: '🗺️ 인프라',      icon: '🗺️' },
  strategy: { label: '🚀 전략상품',    icon: '🚀' },
};

let _udCurrentIdx = -1;
let _meSelectedSrc = '';
let _meSelectedField = '';

export function renderAdminOverview() {
  document.getElementById('admin-kpi').innerHTML = [
    kpi('등록 지표', METRICS_L.filter(m => m.on).length + '', '개', null, 'gold', '전체 ' + METRICS_L.length + '개'),
    kpi('등록 사용자', USERS_FULL.filter(u => u.on).length + '', '명', null, 'teal', '임원' + USERS_FULL.filter(u => u.role === 'executive' && u.on).length + '/관리자' + USERS_FULL.filter(u => u.role === 'admin' && u.on).length),
    kpi('업로드 파일', UPLOAD_H.length + '', '개', null, 'blue', '최근 2025-12-31'),
    kpi('데이터 기간', '36', '개월', null, 'green', '23.1~25.12'),
  ].join('');
  document.getElementById('upload-log').innerHTML = UPLOAD_H.slice(0, 5).map(u => `<tr><td style="font-size:11px">${u.file}</td><td><span class="td-tag" style="background:rgba(74,158,255,.1);color:var(--blue)">${u.cat}</span></td><td style="color:var(--text3)">${u.date.split(' ')[0]}</td><td><span class="status st-on">정상</span></td></tr>`).join('');
  const cats = [...new Set(METRICS_L.map(m => m.cat))];
  document.getElementById('metric-stats').innerHTML = cats.map(c => {
    const cnt = METRICS_L.filter(m => m.cat === c).length;
    const colors = ['var(--gold)', 'var(--teal)', 'var(--blue)', 'var(--green)', 'var(--purple)', 'var(--orange)', 'var(--pink)', 'var(--red)'];
    const ci = ['재무', '채널', '무선', '유선', '품질', '인프라', '전략상품', '인력'].indexOf(c);
    const col = colors[ci] || colors[0];
    return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="color:var(--text2)">${c}</span><span style="color:var(--text3);font-family:var(--mono)">${cnt}개</span></div><div class="prog-bar"><div class="prog-fill" style="width:${Math.min(cnt * 14, 100)}%;background:${col}"></div></div></div>`;
  }).join('');
}

// ── UPLOAD DETAIL ──
export function openUploadDetail(i) {
  _udCurrentIdx = i;
  const u = UPLOAD_H[i];
  document.getElementById('ud-title').textContent = u.file;
  document.getElementById('ud-sub').textContent = `${u.cat} · ${u.period} · ${u.size} · ${u.date}`;
  document.getElementById('ud-redownload-btn').textContent = `📥 "${u.file.replace('.xlsx', '.csv')}" 다운로드`;

  const prevHTML = u.preview ? `
    <div class="card-wrap" style="margin-bottom:12px">
      <div class="chart-title" style="margin-bottom:10px">📊 데이터 미리보기 (최근 행)</div>
      <table class="data-table">
        <thead><tr>${u.preview[0].map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${u.preview.slice(1).map(r => `<tr>${r.map(c => `<td style="font-family:var(--mono);font-size:11px">${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>` : '';

  document.getElementById('ud-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      ${[['파일명', u.file], ['카테고리', u.cat], ['데이터 기간', u.period], ['파일 크기', u.size],
        ['업로드 일시', u.date], ['담당자', u.user], ['데이터 행수', u.rows + '행'], ['데이터 열수', u.cols + '열'],
        ['상태', u.ok ? '✅ 정상' : '❌ 오류'], ['비고', u.note]]
        .map(([k, v]) => `
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:10px 12px">
          <div style="font-size:10px;color:var(--text3);font-weight:600;margin-bottom:3px">${k}</div>
          <div style="font-size:12px;color:var(--text)">${v}</div>
        </div>`).join('')}
    </div>${prevHTML}`;

  window.openModal && window.openModal('modal-upload-detail');
}

export function redownloadFile() {
  const i = _udCurrentIdx;
  if (i < 0) return;
  const u = UPLOAD_H[i];
  const catMap = {
    '재무': 'finance', '무선 가입자': 'wireless', '유선 가입자': 'wired',
    '통합본(14시트)': 'finance', '디지털': 'digital', 'B2B': 'b2b',
    '소상공인': 'smb', '유통플랫폼': 'platform', 'TCSI': 'tcsi',
    '영업품질': 'voc', '인력': 'hr', '인프라': 'infra', '전략상품': 'strategy',
  };
  const rawKey = catMap[u.cat];
  const d = rawKey ? RAW[rawKey] : null;

  let csv = '﻿';
  csv += `# ${u.file} — KT M&S 경영성과 데이터\n`;
  csv += `# 카테고리: ${u.cat} | 기간: ${u.period} | 생성: ${new Date().toLocaleString('ko-KR')}\n\n`;

  if (d && d.months) {
    const fields = Object.keys(d).filter(k => k !== 'months' && Array.isArray(d[k]));
    csv += ['월', ...fields].join(',') + '\n';
    d.months.forEach((m, idx) => {
      const row = [m, ...fields.map(f => d[f][idx] ?? '')];
      csv += row.join(',') + '\n';
    });
  } else if (u.preview) {
    u.preview.forEach(row => { csv += row.join(',') + '\n'; });
  } else {
    csv += '데이터를 불러올 수 없습니다.\n';
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = u.file.replace('.xlsx', '.csv');
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`📥 "${a.download}" 다운로드 완료`);
}

// ── METRIC DATA PICKER ──
export function buildSrcPicker(currentSrc) {
  const list = document.getElementById('me-src-list');
  list.innerHTML = Object.entries(SRC_META).map(([key, meta]) => `
    <button class="src-btn ${currentSrc === key ? 'active' : ''}" onclick="selectMetricSrc('${key}')">
      <span>${meta.icon}</span><span>${meta.label.replace(/^[^ ]+ /, '')}</span>
    </button>`).join('');

  if (currentSrc && RAW[currentSrc]) {
    renderFieldList(currentSrc, _meSelectedField);
    document.getElementById('me-field-label').textContent = `${SRC_META[currentSrc].label} 필드 목록`;
  } else {
    document.getElementById('me-field-list').innerHTML = `
      <div style="grid-column:1/-1;font-size:11px;color:var(--text3);padding:20px;text-align:center">
        좌측에서 데이터 소스를 선택하세요
      </div>`;
  }
}

export function selectMetricSrc(key) {
  _meSelectedSrc = key;
  document.querySelectorAll('#me-src-list .src-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById('me-field-label').textContent = `${SRC_META[key].label} 필드 목록`;
  renderFieldList(key, '');
}

export function renderFieldList(key, selectedField) {
  const d = RAW[key];
  if (!d) { document.getElementById('me-field-list').innerHTML = '<div style="color:var(--text3);font-size:11px;padding:12px">데이터 없음</div>'; return; }

  const fields = Object.keys(d).filter(k => k !== 'months' && Array.isArray(d[k]));
  const objFields = Object.keys(d).filter(k => k !== 'months' && !Array.isArray(d[k]) && typeof d[k] === 'object');

  let html = '';
  fields.forEach(f => {
    const path = `${key}.${f}`;
    const isSelected = path === document.getElementById('me-src').value;
    const lastVal = d[f] ? d[f][d[f].length - 1] : '–';
    const dispVal = typeof lastVal === 'number' ? Number(lastVal).toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : lastVal;
    html += `<button class="field-btn ${isSelected ? 'selected' : ''}" title="${path}&#10;최근값: ${dispVal}" onclick="selectMetricField('${key}','${f}')">
      <div style="font-size:10px;font-weight:600;color:inherit;margin-bottom:1px">${f}</div>
      <div style="font-size:9px;color:var(--text3)">${dispVal}</div>
    </button>`;
  });

  objFields.forEach(obj => {
    const subKeys = Object.keys(d[obj]);
    subKeys.forEach(sf => {
      const path = `${key}.${obj}.${sf}`;
      const arr = d[obj][sf];
      const lastVal = Array.isArray(arr) ? arr[arr.length - 1] : '–';
      const dispVal = typeof lastVal === 'number' ? Number(lastVal).toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : lastVal;
      html += `<button class="field-btn" title="${path}&#10;최근값: ${dispVal}" onclick="selectMetricField('${key}','${obj}.${sf}')">
        <div style="font-size:10px;font-weight:600;color:inherit;margin-bottom:1px">${obj} › ${sf}</div>
        <div style="font-size:9px;color:var(--text3)">${dispVal}</div>
      </button>`;
    });
  });

  document.getElementById('me-field-list').innerHTML = html;
}

export function selectMetricField(srcKey, fieldPath) {
  const fullPath = `${srcKey}.${fieldPath}`;
  _meSelectedField = fieldPath;
  document.getElementById('me-src').value = fullPath;
  document.getElementById('me-src-display').textContent = fullPath;
  document.getElementById('me-src-display').style.color = 'var(--teal)';
  const d = RAW[srcKey];
  let arr;
  if (fieldPath.includes('.')) { const parts = fieldPath.split('.'); arr = d[parts[0]]?.[parts[1]]; }
  else { arr = d[fieldPath]; }
  if (Array.isArray(arr)) {
    const months = d.months;
    const last3 = arr.slice(-3).map((v, i) => `${months[months.length - 3 + i]}: ${typeof v === 'number' ? Number(v).toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : v}`);
    document.getElementById('me-src-preview').textContent = last3.join(' | ');
  } else { document.getElementById('me-src-preview').textContent = '–'; }
  document.querySelectorAll('#me-field-list .field-btn').forEach(b => b.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
}

export function clearMetricSrc() {
  _meSelectedSrc = ''; _meSelectedField = '';
  document.getElementById('me-src').value = '';
  document.getElementById('me-src-display').textContent = '선택 없음';
  document.getElementById('me-src-display').style.color = 'var(--text3)';
  document.getElementById('me-src-preview').textContent = '–';
  document.querySelectorAll('#me-field-list .field-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('#me-src-list .src-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('me-field-list').innerHTML = `<div style="grid-column:1/-1;font-size:11px;color:var(--text3);padding:20px;text-align:center">좌측에서 데이터 소스를 선택하세요</div>`;
}

export function renderAdminUpload() {
  window.resetUpload && window.resetUpload();
  const sb = window.sb;
  if (!sb) return;
  sb.from('kts_upload_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
    .then(({ data, error }) => {
      const tbody = document.getElementById('upload-history');
      if (!tbody) return;
      if (error || !data || data.length === 0) {
        tbody.innerHTML = UPLOAD_H.map(u => `
          <tr>
            <td style="font-size:11px"><b style="color:var(--text)">${u.file}</b></td>
            <td><span class="td-tag" style="background:rgba(74,158,255,.1);color:var(--blue)">${u.cat}</span></td>
            <td style="color:var(--text3);font-size:11px">${u.period}</td>
            <td style="color:var(--text3);font-size:11px;text-align:center">–</td>
            <td style="color:var(--text3);font-family:var(--mono);font-size:11px">${u.date}</td>
            <td style="color:var(--text2);font-size:11px">${u.user}</td>
            <td><span class="status ${u.ok ? 'st-on' : 'st-off'}">${u.ok ? '정상' : '오류'}</span></td>
          </tr>`).join('');
        return;
      }
      tbody.innerHTML = data.map(u => `
        <tr>
          <td style="font-size:11px"><b style="color:var(--text)">${u.filename}</b></td>
          <td><span class="td-tag" style="background:rgba(74,158,255,.1);color:var(--blue)">${(window.CAT_SHEET_MAP && window.CAT_SHEET_MAP[u.category]?.label) || u.category}</span></td>
          <td style="color:var(--text3);font-size:11px">${u.period || '–'}</td>
          <td style="color:var(--text3);font-size:11px;text-align:center">${u.rows_count ? u.rows_count + '행' : '–'}</td>
          <td style="color:var(--text3);font-family:var(--mono);font-size:11px">${new Date(u.created_at).toLocaleString('ko-KR')}</td>
          <td style="color:var(--text2);font-size:11px">${u.uploaded_by || '–'}</td>
          <td><span class="status ${u.status === 'success' ? 'st-on' : 'st-off'}">${u.status === 'success' ? '정상' : '오류'}</span></td>
        </tr>`).join('');
    });
}

export function renderAdminMetrics() {
  document.getElementById('metrics-tbody').innerHTML = METRICS_L.map((m, i) => `
    <tr>
      <td><b style="color:var(--text)">${m.name}</b></td>
      <td><span class="td-tag" style="background:rgba(74,158,255,.1);color:var(--blue)">${m.cat}</span></td>
      <td style="font-family:var(--mono);color:var(--text3)">${m.unit}</td>
      <td style="color:var(--text3);font-size:11px">${m.pos}</td>
      <td style="color:var(--text3);font-size:11px;max-width:160px;white-space:normal">${m.desc || ''}</td>
      <td>
        <label style="cursor:pointer;display:flex;align-items:center;gap:5px;font-size:11px">
          <input type="checkbox" ${m.on ? 'checked' : ''} onchange="toggleMetric(${i},this.checked)" style="accent-color:var(--gold)">
          <span class="status ${m.on ? 'st-on' : 'st-off'}">${m.on ? '활성' : '비활성'}</span>
        </label>
      </td>
      <td><button class="btn btn-ghost" style="padding:3px 10px;font-size:10px" onclick="openMetricEdit(${i})">편집</button></td>
    </tr>`).join('');
}

export function toggleMetric(i, val) {
  METRICS_L[i].on = val;
  const spans = document.querySelectorAll('#metrics-tbody tr');
  if (spans[i]) {
    const st = spans[i].querySelector('.status');
    if (st) { st.className = 'status ' + (val ? 'st-on' : 'st-off'); st.textContent = val ? '활성' : '비활성'; }
  }
  showToast(`${METRICS_L[i].name} ${val ? '활성화' : '비활성화'}`);
  addPendingChange(val ? 'add' : 'del', `지표 ${val ? '활성화' : '비활성화'}: ${METRICS_L[i].name}`);
}

export function openMetricEdit(i) {
  _editMetricIdx = i;
  const m = METRICS_L[i];
  document.getElementById('me-title').textContent = '지표 편집: ' + m.name;
  document.getElementById('me-name').value = m.name;
  document.getElementById('me-cat').value = m.cat;
  document.getElementById('me-unit').value = m.unit;
  document.getElementById('me-pos').value = m.pos;
  document.getElementById('me-desc').value = m.desc || '';
  document.getElementById('me-active').value = String(m.on);
  document.getElementById('me-agg').value = m.agg || 'last';
  document.getElementById('me-src').value = m.src || '';

  const srcParts = (m.src || '').split('.');
  _meSelectedSrc = srcParts[0] || '';
  _meSelectedField = srcParts.slice(1).join('.') || '';

  if (m.src) {
    document.getElementById('me-src-display').textContent = m.src;
    document.getElementById('me-src-display').style.color = 'var(--teal)';
    const d = RAW[srcParts[0]];
    const arr = srcParts.length === 2 ? d?.[srcParts[1]] : d?.[srcParts[1]]?.[srcParts[2]];
    if (Array.isArray(arr) && d?.months) {
      const last3 = arr.slice(-3).map((v, i) => `${d.months[d.months.length - 3 + i]}: ${typeof v === 'number' ? Number(v).toLocaleString('ko-KR', { maximumFractionDigits: 2 }) : v}`);
      document.getElementById('me-src-preview').textContent = last3.join(' | ');
    }
  } else {
    document.getElementById('me-src-display').textContent = '선택 없음';
    document.getElementById('me-src-display').style.color = 'var(--text3)';
    document.getElementById('me-src-preview').textContent = '–';
  }

  buildSrcPicker(_meSelectedSrc);
  window.openModal && window.openModal('modal-metric-edit');
}

export function openMetricAdd() {
  _editMetricIdx = -1;
  _meSelectedSrc = ''; _meSelectedField = '';
  document.getElementById('me-title').textContent = '새 지표 추가';
  ['me-name', 'me-unit', 'me-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('me-active').value = 'true';
  document.getElementById('me-agg').value = 'last';
  document.getElementById('me-src').value = '';
  document.getElementById('me-src-display').textContent = '선택 없음';
  document.getElementById('me-src-display').style.color = 'var(--text3)';
  document.getElementById('me-src-preview').textContent = '–';
  buildSrcPicker('');
  window.openModal && window.openModal('modal-metric-edit');
}

export function saveMetric() {
  const m = {
    id: _editMetricIdx >= 0 ? METRICS_L[_editMetricIdx].id : Date.now(),
    name: document.getElementById('me-name').value.trim(),
    cat: document.getElementById('me-cat').value,
    unit: document.getElementById('me-unit').value.trim(),
    pos: document.getElementById('me-pos').value,
    desc: document.getElementById('me-desc').value.trim(),
    on: document.getElementById('me-active').value === 'true',
    agg: document.getElementById('me-agg').value,
    src: document.getElementById('me-src').value.trim(),
  };
  if (!m.name) { showToast('❗ 지표명을 입력하세요'); return; }
  const isEdit = _editMetricIdx >= 0;
  if (isEdit) METRICS_L[_editMetricIdx] = m;
  else METRICS_L.push(m);
  window.closeModal && window.closeModal('modal-metric-edit');
  renderAdminMetrics();
  showToast(`✅ 지표 "${m.name}" ${isEdit ? '수정' : '추가'} 완료 ${m.src ? '· 데이터 연결: ' + m.src : ''}`);
  addPendingChange(isEdit ? 'mod' : 'add', `지표 ${isEdit ? '수정' : '추가'}: ${m.name}${m.src ? ' (' + m.src + ')' : ''}`);
}

export function deleteMetric() {
  if (_editMetricIdx < 0) return;
  const name = METRICS_L[_editMetricIdx].name;
  METRICS_L.splice(_editMetricIdx, 1);
  window.closeModal && window.closeModal('modal-metric-edit');
  renderAdminMetrics();
  showToast(`🗑️ 지표 "${name}" 삭제 완료`);
  addPendingChange('del', `지표 삭제: ${name}`);
}

export function renderAdminUsers() {
  document.getElementById('users-tbody').innerHTML = USERS_FULL.map((u, i) => {
    const pagesText = u.pages.includes('all') ? '전체' : u.pages.map(p => PAGE_LABELS[p] || p).join(', ');
    const adminText = u.admin.includes('all') ? '전체 관리' : u.admin.length ? u.admin.map(p => ADMIN_LABELS[p] || p).join(', ') : '–';
    const pwShown = _showPwIdx.has(i);
    return `<tr>
      <td><b style="color:var(--text)">${u.name}</b></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--text3)">${u.id}</td>
      <td style="font-size:11px;color:var(--text3)">${u.email}</td>
      <td style="font-size:12px">${u.title}</td>
      <td><span class="td-tag" style="background:${u.role === 'admin' ? 'rgba(56,217,192,.1)' : 'rgba(245,200,66,.1)'};color:${u.role === 'admin' ? 'var(--teal)' : 'var(--gold)'}">${u.role === 'admin' ? '관리자' : '임원'}</span></td>
      <td><div class="pw-cell"><span>${pwShown ? u.pw : '••••••••'}</span><button class="pw-toggle" onclick="togglePw(${i})">${pwShown ? '숨김' : '표시'}</button></div></td>
      <td style="font-size:11px;color:var(--text3);max-width:120px;white-space:normal;line-height:1.5">${pagesText}</td>
      <td style="font-size:11px;color:var(--text3)">${adminText}</td>
      <td style="font-size:11px;font-family:var(--mono);color:var(--text3)">${u.last}</td>
      <td><span class="status ${u.on ? 'st-on' : 'st-off'}">${u.on ? '활성' : '비활성'}</span></td>
      <td><button class="btn btn-ghost" style="padding:3px 10px;font-size:10px" onclick="openUserEdit(${i})">편집</button></td>
    </tr>`;
  }).join('');
}

export function togglePw(i) {
  if (_showPwIdx.has(i)) _showPwIdx.delete(i);
  else _showPwIdx.add(i);
  renderAdminUsers();
}

export function openUserEdit(i) {
  _editUserIdx = i;
  const u = USERS_FULL[i];
  document.getElementById('ue-title').textContent = '사용자 편집: ' + u.name;
  document.getElementById('ue-name').value = u.name;
  document.getElementById('ue-id').value = u.id;
  document.getElementById('ue-email').value = u.email;
  const titleInput = document.getElementById('ue-title'); if (titleInput && titleInput.tagName === 'INPUT') titleInput.value = u.title;
  document.getElementById('ue-pw').value = '';
  document.getElementById('ue-role').value = u.role;
  document.getElementById('ue-status').value = String(u.on);
  document.getElementById('ue-note').value = u.note || '';
  const pg = document.getElementById('ue-pages');
  pg.innerHTML = ALL_PAGES.map(p => `<label class="perm-item"><input type="checkbox" value="${p}" ${(u.pages.includes('all') || u.pages.includes(p)) ? 'checked' : ''}>${PAGE_LABELS[p]}</label>`).join('');
  const ag = document.getElementById('ue-admin');
  ag.innerHTML = ADMIN_PAGES.map(p => `<label class="perm-item"><input type="checkbox" value="${p}" ${(u.admin.includes('all') || u.admin.includes(p)) ? 'checked' : ''}>${ADMIN_LABELS[p]}</label>`).join('');
  window.openModal && window.openModal('modal-user-edit');
}

export function openUserAdd() {
  _editUserIdx = -1;
  document.getElementById('ue-title').textContent = '새 사용자 추가';
  ['ue-name', 'ue-id', 'ue-email', 'ue-pw', 'ue-note'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const titleEl = document.getElementById('ue-title'); if (titleEl && titleEl.tagName === 'INPUT') titleEl.value = '';
  document.getElementById('ue-role').value = 'executive';
  document.getElementById('ue-status').value = 'true';
  document.getElementById('ue-pages').innerHTML = ALL_PAGES.map(p => `<label class="perm-item"><input type="checkbox" value="${p}">${PAGE_LABELS[p]}</label>`).join('');
  document.getElementById('ue-admin').innerHTML = ADMIN_PAGES.map(p => `<label class="perm-item"><input type="checkbox" value="${p}">${ADMIN_LABELS[p]}</label>`).join('');
  window.openModal && window.openModal('modal-user-edit');
}

export function saveUser() {
  const name = document.getElementById('ue-name').value.trim();
  const uid = document.getElementById('ue-id').value.trim();
  const email = document.getElementById('ue-email').value.trim();
  const title = document.getElementById('ue-title').value ? document.getElementById('ue-title').value.trim() : '';
  const pw = document.getElementById('ue-pw').value;
  const role = document.getElementById('ue-role').value;
  const on = document.getElementById('ue-status').value === 'true';
  if (!name || !uid) { showToast('❗ 이름과 아이디는 필수입니다'); return; }
  const pages = [...document.querySelectorAll('#ue-pages input:checked')].map(c => c.value);
  const admin = [...document.querySelectorAll('#ue-admin input:checked')].map(c => c.value);
  const u = { name, id: uid, email, title, role, on, pages: pages.length === ALL_PAGES.length ? ['all'] : pages, admin: admin.length === ADMIN_PAGES.length ? ['all'] : admin, last: new Date().toISOString().slice(0, 10), note: document.getElementById('ue-note').value };
  if (_editUserIdx >= 0) {
    u.pw = pw || USERS_FULL[_editUserIdx].pw;
    u.idx = _editUserIdx;
    USERS_FULL[_editUserIdx] = u;
    const dbIdx = window.USERS_DB ? window.USERS_DB.findIndex(d => d.id === USERS_FULL[_editUserIdx].id) : -1;
    if (dbIdx >= 0 && pw && window.USERS_DB) window.USERS_DB[dbIdx].pw = pw;
  } else {
    if (!pw) { showToast('❗ 신규 사용자는 비밀번호가 필요합니다'); return; }
    u.pw = pw; u.idx = USERS_FULL.length;
    USERS_FULL.push(u);
    if (window.USERS_DB) window.USERS_DB.push({ id: uid, pw, role, name, title, pages: 'all' });
  }
  window.closeModal && window.closeModal('modal-user-edit');
  renderAdminUsers();
  showToast(`✅ ${name} 사용자 정보 저장 완료`);
}

export function deleteUser() {
  if (_editUserIdx < 0) return;
  const name = USERS_FULL[_editUserIdx].name;
  USERS_FULL.splice(_editUserIdx, 1);
  window.closeModal && window.closeModal('modal-user-edit');
  renderAdminUsers();
  showToast(`🗑️ ${name} 계정이 삭제되었습니다`);
}

export function openFindModal() { window.openModal && window.openModal('modal-find'); _findTab = 'id'; document.getElementById('find-id-tab').style.display = ''; document.getElementById('find-pw-tab').style.display = 'none'; }

export function switchFindTab(tab, btn) {
  _findTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('find-id-tab').style.display = tab === 'id' ? '' : 'none';
  document.getElementById('find-pw-tab').style.display = tab === 'pw' ? '' : 'none';
  document.getElementById('find-id-result').textContent = '';
  document.getElementById('find-pw-result').textContent = '';
}

export function doFind() {
  if (_findTab === 'id') {
    const name = document.getElementById('find-name').value.trim();
    const email = document.getElementById('find-email-id').value.trim();
    if (!name || !email) { showToast('❗ 이름과 이메일을 입력하세요'); return; }
    const u = USERS_FULL.find(u => u.name === name && u.email === email);
    const el = document.getElementById('find-id-result');
    if (u) { el.innerHTML = `<div style="background:rgba(52,211,138,.08);border:1px solid rgba(52,211,138,.3);border-radius:7px;padding:10px 14px;color:var(--green)">✅ 아이디: <b style="font-family:var(--mono);font-size:14px">${u.id}</b></div>`; }
    else { el.innerHTML = `<div style="color:var(--red);font-size:12px;padding:8px">❌ 일치하는 계정을 찾을 수 없습니다</div>`; }
  } else {
    const uid = document.getElementById('find-uid').value.trim();
    const email = document.getElementById('find-email-pw').value.trim();
    if (!uid || !email) { showToast('❗ 아이디와 이메일을 입력하세요'); return; }
    const u = USERS_FULL.find(u => u.id === uid && u.email === email);
    const el = document.getElementById('find-pw-result');
    if (u) {
      const tmp = 'TMP' + Math.random().toString(36).slice(2, 8).toUpperCase();
      el.innerHTML = `<div style="background:rgba(245,200,66,.08);border:1px solid rgba(245,200,66,.3);border-radius:7px;padding:10px 14px;color:var(--gold)">✅ 임시 비밀번호: <b style="font-family:var(--mono);font-size:14px">${tmp}</b><div style="font-size:10px;color:var(--text3);margin-top:4px">로그인 후 반드시 비밀번호를 변경하세요</div></div>`;
      u.pw = tmp; const db = window.USERS_DB ? window.USERS_DB.find(d => d.id === uid) : null; if (db) db.pw = tmp;
    } else { el.innerHTML = `<div style="color:var(--red);font-size:12px;padding:8px">❌ 아이디 또는 이메일이 올바르지 않습니다</div>`; }
  }
}

export function renderAdminBeta() {
  document.getElementById('beta-changes').innerHTML = _pendingChanges.map(c => `
    <div class="diff-row ${c.type === 'add' ? 'diff-add' : c.type === 'del' ? 'diff-del-row' : 'diff-mod'}">
      <span style="font-size:14px">${c.icon}</span>
      <span style="font-size:12px;color:var(--text2)">${c.msg}</span>
    </div>`).join('');
  document.getElementById('deploy-history').innerHTML = _deployHistory.map(h => `<tr>
    <td style="font-family:var(--mono);font-size:11px">${h.dt}</td>
    <td style="font-size:11px">${h.user}</td>
    <td style="font-family:var(--mono);font-size:11px;text-align:center">${h.cnt}</td>
    <td><span class="status ${h.ok ? 'st-on' : 'st-off'}">${h.ok ? '성공' : '실패'}</span></td>
  </tr>`).join('');
  document.getElementById('preview-btns').innerHTML = MENUS.executive.map(m => `<button class="btn btn-ghost" style="font-size:11px;padding:5px 12px;border-color:var(--border)" onclick="previewPage('${m.id}')">${m.icon} ${m.label}</button>`).join('');
  const badge = document.getElementById('beta-status-badge');
  const deployBtn = document.getElementById('deploy-btn');
  if (_deployed) {
    badge.textContent = '● LIVE — 배포 완료'; badge.style.background = 'rgba(52,211,138,.15)'; badge.style.color = 'var(--green)'; badge.style.borderColor = 'rgba(52,211,138,.3)';
    deployBtn.disabled = true; deployBtn.textContent = '✅ 배포 완료';
    document.getElementById('beta-title').textContent = '현재 버전이 배포되었습니다. 모든 임원이 최신 데이터를 볼 수 있습니다.';
  }
}

export function previewPage(id) {
  const existing = document.getElementById('__preview-banner');
  if (existing) existing.remove();

  if (window.nav) window.nav(id);

  const label = MENUS.executive.find(m => m.id === id)?.label || id;
  const banner = document.createElement('div');
  banner.id = '__preview-banner';
  banner.style.cssText = [
    'position:fixed','top:0','left:0','right:0','z-index:9999',
    'background:linear-gradient(90deg,#7c3aed,#4f46e5)',
    'color:#fff','display:flex','align-items:center','justify-content:space-between',
    'padding:8px 20px','font-size:12px','font-family:var(--font)',
    'box-shadow:0 2px 12px rgba(0,0,0,.4)',
  ].join(';');
  banner.innerHTML = `
    <span>🖥️ 베타 미리보기 — <strong>${label}</strong> (임원 화면과 동일한 실제 렌더링)</span>
    <button onclick="(function(){document.getElementById('__preview-banner').remove();if(window.nav)window.nav('admin-beta');})()"
      style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);color:#fff;padding:4px 14px;border-radius:6px;cursor:pointer;font-size:11px">
      ← Admin 돌아가기
    </button>`;
  document.body.appendChild(banner);
}

export function doDeploy() {
  if (_deployed) return;
  const btn = document.getElementById('deploy-btn');
  btn.disabled = true; btn.textContent = '⏳ 배포 중...';
  setTimeout(() => {
    _deployed = true;
    _deployHistory.unshift({ dt: new Date().toLocaleString('ko-KR').replace(/\./g, '-').replace(/\s/g, ' ').slice(0, 16), user: S.user?.name || '관리자', cnt: _pendingChanges.length, ok: true });
    renderAdminBeta();
    showToast('🚀 배포 완료! 임원 화면에 변경사항이 반영되었습니다');
    try { localStorage.setItem('kts_deployed', 'true'); } catch (e) { }
  }, 1800);
}
