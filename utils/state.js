// utils/state.js — 전역 상태 및 설정
export const S = { role: null, page: null, pi: { s: 24, e: 35 }, charts: {} };

export const C = {
  primary: 'rgba(91,110,245,1)',    primaryA: 'rgba(91,110,245,0.12)',
  gold:    'rgba(245,158,11,1)',    goldA:    'rgba(245,158,11,0.12)',
  teal:    'rgba(6,182,212,1)',     tealA:    'rgba(6,182,212,0.12)',
  blue:    'rgba(59,130,246,1)',    blueA:    'rgba(59,130,246,0.12)',
  red:     'rgba(239,68,68,1)',     redA:     'rgba(239,68,68,0.12)',
  green:   'rgba(16,185,129,1)',    greenA:   'rgba(16,185,129,0.12)',
  purple:  'rgba(139,92,246,1)',    purpleA:  'rgba(139,92,246,0.12)',
  orange:  'rgba(249,115,22,1)',    orangeA:  'rgba(249,115,22,0.12)',
  pink:    'rgba(236,72,153,1)',    pinkA:    'rgba(236,72,153,0.12)',
  indigo:  'rgba(99,102,241,1)',    indigoA:  'rgba(99,102,241,0.12)',
};

export const COLORS = [C.primary, C.teal, C.blue, C.purple, C.orange, C.red, C.green, C.pink];
export const COLORS_A = [C.primaryA, C.tealA, C.blueA, C.purpleA, C.orangeA, C.redA, C.greenA, C.pinkA];
export const COLORS_BAR = [
  'rgba(91,110,245,0.72)', 'rgba(6,182,212,0.72)', 'rgba(59,130,246,0.72)',
  'rgba(139,92,246,0.72)', 'rgba(249,115,22,0.72)', 'rgba(239,68,68,0.72)',
  'rgba(16,185,129,0.72)', 'rgba(236,72,153,0.72)'
];

export const MENUS = {
  executive: [
    { id: 'summary',   icon: '🏠', label: '경영요약',   sec: '홈' },
    { id: 'finance',   icon: '💰', label: '재무',       sec: '경영성과' },
    { id: 'wireless',  icon: '📱', label: '무선 가입자', sec: '가입자 현황' },
    { id: 'wired',     icon: '🌐', label: '유선 가입자', sec: '가입자 현황' },
    { id: 'org',       icon: '🏢', label: '조직별 실적', sec: '채널별 실적' },
    { id: 'digital',   icon: '💻', label: '디지털 채널', sec: '채널별 실적' },
    { id: 'b2b',       icon: '🏭', label: 'B2B 채널',   sec: '채널별 실적' },
    { id: 'smb',       icon: '🏪', label: '소상공인',    sec: '채널별 실적' },
    { id: 'platform',  icon: '♻️', label: '유통플랫폼',  sec: '채널별 실적' },
    { id: 'quality',   icon: '⭐', label: 'TCSI / VOC', sec: '기타 실적' },
    { id: 'infra',     icon: '🗺️', label: '매장 인프라', sec: '기타 실적' },
    { id: 'strategy',  icon: '🚀', label: '전략상품',    sec: '기타 실적' },
    { id: 'hr',        icon: '👥', label: '인력 현황',   sec: '기타 실적' },
  ],
  admin: [
    { id: 'admin-overview', icon: '🖥️', label: '시스템 현황',        sec: '관리' },
    { id: 'admin-upload',   icon: '📂', label: '데이터 업로드',       sec: '관리' },
    { id: 'admin-metrics',  icon: '📐', label: '지표 관리',           sec: '관리' },
    { id: 'admin-users',    icon: '👤', label: '사용자 권한',         sec: '관리' },
    { id: 'admin-export',   icon: '📤', label: '보고서 내보내기',     sec: '보고' },
    { id: 'admin-beta',     icon: '🧪', label: '베타 테스트 · 배포', sec: '배포' },
  ]
};

export const AI_MODEL = 'claude-sonnet-4-20250514';
