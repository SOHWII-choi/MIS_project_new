// utils/kpi.js — KPI 카드 생성 및 팝업
import { RAW } from '../data/raw.js';
import { S } from './state.js';
import { sum, last, prev, fmt, pct } from './calc.js';
import { showToast } from './toast.js';
import { getInfraSeries } from './infra.js';
import { getHrOverride, getWiredOverride } from './source-overrides.js';

export function kpi(label, value, unit, diff, cls, sub = '', onclickKey = '') {
  const badge = diff != null ? `<div class="kpi-badge ${diff >= 0 ? 'kbd-up' : 'kbd-dn'}">${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff).toFixed(1)}%</div>` : '';
  const hint = onclickKey ? `<div style="font-size:9px;color:var(--text3);margin-top:5px;opacity:.7;display:flex;align-items:center;gap:3px"><span>🔍</span><span>클릭하여 상세분석</span></div>` : '';
  const inner = `<div class="kpi-label">${label}</div><div class="kpi-value">${value}<span class="kpi-unit">${unit}</span></div>${badge}${sub ? `<div class="kpi-sub">${sub}</div>` : ''}${hint}`;
  const extra = onclickKey ? `data-kpi-key="${onclickKey}" style="cursor:pointer" title="${label} 상세분석 클릭"` : '';
  return `<div class="kpi-card kc-${cls}" ${extra}>${inner}</div>`;
}

export function openKpiPopup(key) {
  try {
    const FIN = RAW.finance, ORG = RAW.org, PLAT = RAW.platform;
    const WL = RAW.wireless, WD = RAW.wired;
    const DIG = RAW.digital, B2B = RAW.b2b, SMB = RAW.smb;
    const TC = RAW.tcsi, VOC = RAW.voc, HR = RAW.hr;
    const platArr = (PLAT.시연폰_매각이익 || []).map((v, i) => (v || 0) + ((PLAT.중고폰_매입금액 || [])[i] || 0));
    const infra = getInfraSeries();
    const wiredOverride = getWiredOverride(WD.months, WD);
    const hrOverride = getHrOverride(HR.months, HR);

    const MAP = {
      // 재무
      'fin:총매출':     { arr: FIN.총매출,    months: FIN.months, label: '총매출',         unit: '억원', color: '#f59e0b', icon: '💰' },
      'fin:통신매출':   { arr: FIN.통신매출,  months: FIN.months, label: '통신매출',       unit: '억원', color: '#3b82f6', icon: '📡' },
      'fin:영업이익':   { arr: FIN.영업이익,  months: FIN.months, label: '영업이익',       unit: '억원', color: '#10b981', icon: '📈' },
      'fin:판관비':     { arr: FIN.판관비,    months: FIN.months, label: '판관비',         unit: '억원', color: '#8b5cf6', icon: '💼' },
      'fin:마케팅비':   { arr: FIN.마케팅비,  months: FIN.months, label: '마케팅비',       unit: '억원', color: '#f97316', icon: '📢' },
      'fin:인건비':     { arr: FIN.인건비,    months: FIN.months, label: '인건비',         unit: '억원', color: '#ec4899', icon: '👥' },
      'fin:유통플랫폼': { arr: platArr,       months: FIN.months, label: '유통플랫폼매출', unit: '억원', color: '#06b6d4', icon: '♻️' },
      // 무선
      'wl:유지':  { arr: WL.유지,  months: WL.months, label: '무선 유지가입자', unit: '건', color: '#3b82f6', icon: '📱' },
      'wl:CAPA':  { arr: WL.CAPA,  months: WL.months, label: '무선 CAPA',      unit: '건', color: '#f59e0b', icon: '📶' },
      'wl:해지':  { arr: WL.해지,  months: WL.months, label: '무선 해지',      unit: '건', color: '#ef4444', icon: '❌' },
      'wl:순증':  { arr: WL.순증,  months: WL.months, label: '무선 순증',      unit: '건', color: '#10b981', icon: '📊' },
      // 유선
      'wd:유지전체':   { arr: WD.유지_전체,   months: WD.months, label: '유선 유지(전체)', unit: '건', color: '#3b82f6', icon: '🌐' },
      'wd:신규전체':   { arr: WD.신규_전체,   months: WD.months, label: '유선 신규',       unit: '건', color: '#10b981', icon: '➕' },
      'wd:해지전체':   { arr: WD.해지_전체,   months: WD.months, label: '유선 해지',       unit: '건', color: '#ef4444', icon: '➖' },
      'wd:순증전체':   { arr: WD.순증_전체,   months: WD.months, label: '유선 순증',       unit: '건', color: '#8b5cf6', icon: '📊' },
      'wd:유지인터넷': { arr: WD.유지_인터넷, months: WD.months, label: '인터넷 유지',     unit: '건', color: '#f59e0b', icon: '💻' },
      'wd:신규인터넷': { arr: WD.신규_인터넷, months: WD.months, label: '인터넷 신규',     unit: '건', color: '#06b6d4', icon: '🔌' },
      // 조직별
      'org:소매':    { arr: ORG.소매,    months: ORG.months, label: '소매 CAPA',    unit: '건', color: '#f59e0b', icon: '🏪' },
      'org:도매':    { arr: ORG.도매,    months: ORG.months, label: '도매 CAPA',    unit: '건', color: '#06b6d4', icon: '🏭' },
      'org:디지털':  { arr: ORG.디지털,  months: ORG.months, label: '디지털 CAPA', unit: '건', color: '#3b82f6', icon: '💻' },
      'org:B2B':     { arr: ORG.B2B,    months: ORG.months, label: 'B2B CAPA',    unit: '건', color: '#8b5cf6', icon: '🤝' },
      'org:소상공인': { arr: ORG.소상공인, months: ORG.months, label: '소상공인 CAPA', unit: '건', color: '#f97316', icon: '🛒' },
      // 디지털
      'dig:일반후불':   { arr: DIG.일반후불_총계,         months: DIG.months, label: '디지털 일반후불',   unit: '건', color: '#f59e0b', icon: '📱' },
      'dig:KT닷컴':     { arr: DIG['일반후불_KT닷컴'],    months: DIG.months, label: 'KT닷컴 직접',      unit: '건', color: '#3b82f6', icon: '🌐' },
      'dig:운영후불':   { arr: DIG.운영후불_총계,         months: DIG.months, label: '디지털 운영후불',   unit: '건', color: '#06b6d4', icon: '⚙️' },
      'dig:유심단독':   { arr: DIG.유심단독,              months: DIG.months, label: '유심단독',          unit: '건', color: '#8b5cf6', icon: '💳' },
      'dig:유선순신규': { arr: DIG.유선순신규,             months: DIG.months, label: '디지털 유선순신규', unit: '건', color: '#10b981', icon: '📡' },
      // B2B
      'b2b:일반후불': { arr: B2B.전체_일반후불,  months: B2B.months, label: 'B2B 일반후불', unit: '건', color: '#f59e0b', icon: '🏢' },
      'b2b:후불신규': { arr: B2B.전체_후불신규,  months: B2B.months, label: 'B2B 후불신규', unit: '건', color: '#06b6d4', icon: '➕' },
      'b2b:무선순증': { arr: B2B.전체_무선순증,  months: B2B.months, label: 'B2B 무선순증', unit: '건', color: '#10b981', icon: '📊' },
      'b2b:무선유지': { arr: B2B.가입자_무선유지, months: B2B.months, label: 'B2B 무선유지', unit: '건', color: '#3b82f6', icon: '📱' },
      'b2b:기업무선': { arr: B2B.가입자_기업무선, months: B2B.months, label: '기업 무선유지', unit: '건', color: '#8b5cf6', icon: '🤝' },
      'b2b:법인무선': { arr: B2B.가입자_법인무선, months: B2B.months, label: '법인 무선유지', unit: '건', color: '#f97316', icon: '🏛️' },
      // 소상공인
      'smb:일반후불':    { arr: SMB.상품_일반후불, months: SMB.months, label: '소상공인 일반후불',   unit: '건', color: '#f59e0b', icon: '🛒' },
      'smb:운영후불':    { arr: SMB.상품_운영후불, months: SMB.months, label: '소상공인 운영후불',   unit: '건', color: '#06b6d4', icon: '⚙️' },
      'smb:인터넷순신규': { arr: SMB.인터넷순신규, months: SMB.months, label: '소상공인 인터넷순신규', unit: '건', color: '#10b981', icon: '🔌' },
      // TCSI
      'tc:TCSI점수':   { arr: TC.TCSI점수,    months: TC.months, label: 'TCSI 점수',   unit: '점', color: '#3b82f6', icon: '⭐' },
      'tc:KT점수':     { arr: TC.KT점수,      months: TC.months, label: 'KT 점수',     unit: '점', color: '#10b981', icon: '📊' },
      'tc:대리점점수': { arr: TC.대리점점수,   months: TC.months, label: '대리점 점수', unit: '점', color: '#f59e0b', icon: '🏪' },
      // VOC
      'voc:도소매발생률': { arr: VOC.도소매발생률, months: VOC.months, label: '도+소매 발생률', unit: '%', color: '#ef4444', icon: '📢' },
      'voc:소매발생률':   { arr: VOC.소매발생률,  months: VOC.months, label: '소매 발생률',    unit: '%', color: '#f97316', icon: '📢' },
      'voc:도매발생률':   { arr: VOC.도매발생률,  months: VOC.months, label: '도매 발생률',    unit: '%', color: '#8b5cf6', icon: '📢' },
      'voc:대외민원':     { arr: VOC.대외민원_건수, months: VOC.months, label: '대외민원 건수', unit: '건', color: '#ef4444', icon: '⚠️' },
      // 인프라
      'inf:소매매장수':       { arr: infra.storeCount,       months: infra.months, label: '소매 매장수',     unit: '개',   color: '#f59e0b', icon: '🏪' },
      'inf:도매무선':         { arr: infra.wholesaleWireless, months: infra.months, label: '도매 무선취급점', unit: '개',   color: '#3b82f6', icon: '🏭' },
      'inf:도매무선취급점':   { arr: infra.wholesaleWireless, months: infra.months, label: '도매 무선취급점', unit: '개',   color: '#3b82f6', icon: '🏭' },
      'inf:도매유선':         { arr: infra.wholesaleWireline, months: infra.months, label: '도매 유선취급점', unit: '개',   color: '#06b6d4', icon: '🏭' },
      'inf:점당생산성':       { arr: infra.wirelessPerStore,  months: infra.months, label: '무선 점당생산성', unit: '건/점', color: '#10b981', icon: '📊' },
      'inf:점당생산성_무선':  { arr: infra.wirelessPerStore,  months: infra.months, label: '무선 점당생산성', unit: '건/점', color: '#10b981', icon: '📊' },
      'inf:인당생산성':       { arr: infra.wirelessPerHead,   months: infra.months, label: '무선 인당생산성', unit: '건/명', color: '#8b5cf6', icon: '👤' },
      'inf:인당생산성_무선':  { arr: infra.wirelessPerHead,   months: infra.months, label: '무선 인당생산성', unit: '건/명', color: '#8b5cf6', icon: '👤' },
      // 인력
      'hr:전사계': { arr: HR.전사계, months: HR.months, label: '전사 인원',   unit: '명', color: '#3b82f6', icon: '👥' },
      'hr:영업직': { arr: HR.영업직, months: HR.months, label: '영업직 인원', unit: '명', color: '#10b981', icon: '👤' },
      'hr:SC직':   { arr: HR.SC직,   months: HR.months, label: 'SC직 인원',   unit: '명', color: '#f59e0b', icon: '👤' },
    };

    MAP['wdi:maintain'] = { arr: wiredOverride.유지_인터넷, months: WD.months, label: '인터넷 유지', unit: '건', color: '#f59e0b', icon: 'I' };
    MAP['wdi:new'] = { arr: wiredOverride.신규_인터넷, months: WD.months, label: '인터넷 신규', unit: '건', color: '#10b981', icon: 'N' };
    MAP['wdi:cancel'] = { arr: wiredOverride.해지_인터넷, months: WD.months, label: '인터넷 해지', unit: '건', color: '#ef4444', icon: 'C' };
    MAP['hro:sc'] = { arr: hrOverride.SC직, months: HR.months, label: 'SC직 인원', unit: '명', color: '#06b6d4', icon: 'H' };
    MAP['hro:retail'] = { arr: hrOverride.소매채널, months: HR.months, label: '소매채널 인원', unit: '명', color: '#22c55e', icon: 'R' };
    MAP['hro:wholesale'] = { arr: hrOverride.도매채널, months: HR.months, label: '도매채널 인원', unit: '명', color: '#f97316', icon: 'W' };

    const info = MAP[key];
    if (!info || !info.arr || !info.arr.length) { showToast('⚠ 데이터 없음'); return; }

    const { arr, months, label, unit, color, icon } = info;
    const valid = arr.filter(v => v != null && !isNaN(v));
    if (!valid.length) { showToast('⚠ 유효 데이터 없음'); return; }

    const maxV = Math.max(...valid), minV = Math.min(...valid), avgV = valid.reduce((s, v) => s + v, 0) / valid.length;
    const maxI = arr.findIndex(v => v === maxV), minI = arr.findIndex(v => v === minV);

    const curQtr = Math.floor((arr.length - 1) / 3);
    const cqVals = arr.slice(curQtr * 3).filter(v => v != null);
    const pqVals = curQtr > 0 ? arr.slice((curQtr - 1) * 3, curQtr * 3).filter(v => v != null) : [];
    const cqAvg = cqVals.length ? cqVals.reduce((s, v) => s + v, 0) / cqVals.length : 0;
    const pqAvg = pqVals.length ? pqVals.reduce((s, v) => s + v, 0) / pqVals.length : 0;
    const qoqPct = pqAvg ? ((cqAvg - pqAvg) / Math.abs(pqAvg) * 100) : 0;

    const getYearPart = m => (m || '').match(/^['\s]*(\d{2,4})[.년]/)?.[1] || '';
    const yMap = {};
    months.forEach((m, i) => {
      const y = getYearPart(m); if (!y) return;
      if (!yMap[y]) { yMap[y] = { s: 0, n: 0, vals: [] }; }
      if (arr[i] != null) { yMap[y].s += arr[i]; yMap[y].n++; yMap[y].vals.push(arr[i]); }
    });
    const yKeys = Object.keys(yMap).sort();
    const curY = yKeys[yKeys.length - 1], prevY = yKeys[yKeys.length - 2];
    const cyAvg = yMap[curY] && yMap[curY].n ? yMap[curY].s / yMap[curY].n : 0;
    const pyAvg = yMap[prevY] && yMap[prevY].n ? yMap[prevY].s / yMap[prevY].n : 0;
    const yoyPct = pyAvg ? ((cyAvg - pyAvg) / Math.abs(pyAvg) * 100) : 0;

    const r3 = arr.slice(-3).filter(v => v != null), p3 = arr.slice(-6, -3).filter(v => v != null);
    const rA = r3.length ? r3.reduce((s, v) => s + v, 0) / r3.length : 0;
    const pA = p3.length ? p3.reduce((s, v) => s + v, 0) / p3.length : 0;
    const tDir = !pA ? '보합' : rA > pA ? '상승▲' : rA < pA ? '하락▼' : '보합';
    const tPct = pA ? Math.abs((rA - pA) / Math.abs(pA) * 100).toFixed(1) : 0;
    const tC = tDir.includes('상승') ? '#10b981' : tDir.includes('하락') ? '#ef4444' : '#8b93b8';
    const f = (v, u) => fmt(v ?? 0, (u === '억원' || String(u).includes('/')) ? 1 : 0);
    const n12 = Math.min(arr.length, 12);

    const getQ = (ri) => {
      if (ri === 0) return null;
      const prev = arr[ri - 1]; const cur = arr[ri];
      if (prev == null || cur == null) return null;
      return prev ? (cur - prev) / Math.abs(prev) * 100 : null;
    };
    const getYoY = (ri) => {
      const curMon = getMon_local(months[ri]);
      const curYearStr = getYearPart(months[ri]);
      const prevYearStr = String(parseInt(curYearStr) - 1).padStart(2, '0');
      const prevIdx = months.findIndex((m, i) => i < ri && getYearPart(m) === prevYearStr && getMon_local(m) === curMon);
      if (prevIdx < 0) return null;
      const prevVal = arr[prevIdx], curVal = arr[ri];
      if (prevVal == null || curVal == null) return null;
      return prevVal ? (curVal - prevVal) / Math.abs(prevVal) * 100 : null;
    };

    function getMon_local(m) { return (m || '').replace(/^'?\d+\./, ''); }

    const tRows = arr.slice(-n12).map((v, ti) => {
      const ri = arr.length - n12 + ti;
      const q = getQ(ri), y = getYoY(ri);
      const isMax = ri === maxI, isMin = ri === minI;
      const qS = q != null ? `<span style="color:${q >= 0 ? '#10b981' : '#ef4444'};font-weight:700">${q >= 0 ? '▲' : '▼'}${Math.abs(q).toFixed(1)}%</span>` : '<span style="color:#d1d5db">-</span>';
      const yS = y != null ? `<span style="color:${y >= 0 ? '#10b981' : '#ef4444'};font-weight:700">${y >= 0 ? '▲' : '▼'}${Math.abs(y).toFixed(1)}%</span>` : '<span style="color:#d1d5db">-</span>';
      return `<tr style="background:${isMax ? 'rgba(16,185,129,.06)' : isMin ? 'rgba(239,68,68,.06)' : ''}">
        <td style="padding:8px 12px;font-size:11px;color:#4a5380;border-bottom:1px solid #f0f2f7;white-space:nowrap">${isMax ? '🔺' : isMin ? '🔻' : ''} ${months[ri]}</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:700;font-family:monospace;text-align:right;border-bottom:1px solid #f0f2f7;color:${(v ?? 0) >= 0 ? '#1a1f36' : '#ef4444'}">${f(v, unit)}</td>
        <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f0f2f7;font-size:11px">${qS}</td>
        <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f0f2f7;font-size:11px">${yS}</td>
      </tr>`;
    }).join('');

    const yCards = Object.entries(yMap).map(([y, o]) => `
      <div style="background:#f8f9fc;border:1px solid #e4e7f0;border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:10px;color:#8b93b8;font-weight:700;margin-bottom:4px">${y}년</div>
        <div style="font-size:13px;font-weight:800;font-family:monospace;color:${color}">${f(o.s / o.n, unit)}</div>
        <div style="font-size:9px;color:#8b93b8;margin-top:1px">월평균 · ${o.n}개월</div>
        <div style="font-size:11px;font-weight:700;color:#4a5380;margin-top:3px">${f(o.s, unit)} 합계</div>
      </div>`).join('');

    const qoqStr = pqAvg ? `<span style="color:${qoqPct >= 0 ? '#10b981' : '#ef4444'};font-weight:700">${qoqPct >= 0 ? '▲' : '▼'}${Math.abs(qoqPct).toFixed(1)}%</span>` : '<span style="color:#d1d5db">-</span>';
    const yoyStr = pyAvg ? `<span style="color:${yoyPct >= 0 ? '#10b981' : '#ef4444'};font-weight:700">${yoyPct >= 0 ? '▲' : '▼'}${Math.abs(yoyPct).toFixed(1)}%</span>` : '<span style="color:#d1d5db">-</span>';

    const html = `<div style="font-size:11px;color:#8b93b8;margin-bottom:14px">단위: ${unit} · ${arr.length}개월</div>
      <div style="background:linear-gradient(135deg,rgba(91,110,245,.06),rgba(6,182,212,.04));border:1px solid rgba(91,110,245,.15);border-radius:12px;padding:14px 16px;margin-bottom:14px">
        <div style="font-size:10px;font-weight:700;color:#5b6ef5;margin-bottom:8px;letter-spacing:.5px;text-transform:uppercase">📊 트렌드 요약</div>
        <div style="font-size:13px;color:#4a5380;line-height:1.9">
          최근 3개월 평균 <b style="color:${color}">${f(rA, unit)}${unit}</b> · 직전 3개월 대비 <b style="color:${tC}">${tDir} ${tPct}%</b><br>
          기간 최고 <b style="color:#10b981">${f(maxV, unit)}${unit}</b>(${months[maxI]}) · 최저 <b style="color:#ef4444">${f(minV, unit)}${unit}</b>(${months[minI]})
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="background:#fff;border:1.5px solid #e4e7f0;border-radius:12px;padding:14px">
          <div style="font-size:10px;color:#8b93b8;font-weight:700;margin-bottom:6px">QoQ · 분기평균 대비</div>
          <div style="font-size:22px;margin-bottom:4px">${qoqStr}</div>
          <div style="font-size:10px;color:#8b93b8">이번분기 평균 ${f(cqAvg, unit)} vs 전분기 ${f(pqAvg, unit)}</div>
        </div>
        <div style="background:#fff;border:1.5px solid #e4e7f0;border-radius:12px;padding:14px">
          <div style="font-size:10px;color:#8b93b8;font-weight:700;margin-bottom:6px">YoY · 연평균 대비</div>
          <div style="font-size:22px;margin-bottom:4px">${yoyStr}</div>
          <div style="font-size:10px;color:#8b93b8">${curY}년 평균 ${f(cyAvg, unit)} vs ${prevY || '전년'}년 ${f(pyAvg, unit)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        ${[['🔺 최고', f(maxV, unit) + unit, months[maxI], '#10b981'], ['🔻 최저', f(minV, unit) + unit, months[minI], '#ef4444'], ['— 평균', f(avgV, unit) + unit, '기간 평균', '#6b7280']].map(([l, v, s, c]) => `<div style="background:#f8f9fc;border:1px solid #e4e7f0;border-radius:10px;padding:10px;text-align:center"><div style="font-size:10px;color:#8b93b8;font-weight:700;margin-bottom:4px">${l}</div><div style="font-size:14px;font-weight:800;font-family:monospace;color:${c}">${v}</div><div style="font-size:10px;color:#8b93b8;margin-top:2px">${s}</div></div>`).join('')}
      </div>
      <div style="font-size:12px;font-weight:700;color:#1a1f36;margin-bottom:8px">📅 연도별 현황</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;margin-bottom:14px">${yCards}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:#1a1f36">📋 최근 ${n12}개월 월별 추이</div>
        <div style="font-size:10px;color:#8b93b8">🔺최고 · 🔻최저</div>
      </div>
      <div style="border:1px solid #e4e7f0;border-radius:10px;overflow:hidden;max-height:300px;overflow-y:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead style="background:#f8f9fc;position:sticky;top:0;z-index:1"><tr>
            <th style="padding:8px 12px;font-size:10px;color:#8b93b8;text-align:left;font-weight:700">월</th>
            <th style="padding:8px 12px;font-size:10px;color:#8b93b8;text-align:right;font-weight:700">실적(${unit})</th>
            <th style="padding:8px 12px;font-size:10px;color:#8b93b8;text-align:center;font-weight:700">전월비</th>
            <th style="padding:8px 12px;font-size:10px;color:#8b93b8;text-align:center;font-weight:700">전년동월비</th>
          </tr></thead>
          <tbody>${tRows}</tbody>
        </table>
      </div>`;

    let panel = document.getElementById('kpi-side-panel');
    let overlay = document.getElementById('kpi-overlay');

    if (!panel) {
      const st = document.createElement('style');
      st.textContent = '#kpi-overlay{display:none;position:fixed;inset:0;z-index:8000;background:rgba(0,0,0,.3);backdrop-filter:blur(2px)}'
        + '#kpi-overlay.on{display:block}'
        + '#kpi-side-panel{position:fixed;top:0;right:-620px;width:min(580px,100vw);height:100vh;height:100dvh;background:#fff;z-index:8001;display:flex;flex-direction:column;box-shadow:-4px 0 30px rgba(0,0,0,.15);transition:right .3s ease}'
        + '#kpi-side-panel.on{right:0}';
      document.head.appendChild(st);

      overlay = document.createElement('div');
      overlay.id = 'kpi-overlay';
      overlay.onclick = closeKpiPanel;
      document.body.appendChild(overlay);

      panel = document.createElement('div');
      panel.id = 'kpi-side-panel';
      document.body.appendChild(panel);
    }

    panel.innerHTML = '';

    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e4e7f0;flex-shrink:0;background:#fff';
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:17px;font-weight:800;color:#1a1f36';
    titleDiv.innerHTML = icon + ' ' + label + ' 상세분석';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:#f0f2f7;border:none;color:#6b7280;font-size:18px;cursor:pointer;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center';
    closeBtn.onclick = closeKpiPanel;
    hdr.appendChild(titleDiv);
    hdr.appendChild(closeBtn);
    panel.appendChild(hdr);

    const scroll = document.createElement('div');
    scroll.style.cssText = 'flex:1;overflow-y:auto;padding:20px 24px 40px';
    scroll.innerHTML = html;
    panel.appendChild(scroll);

    overlay.classList.add('on');
    panel.classList.add('on');

  } catch (e) {
    console.error('KPI popup error:', e, 'key:', key);
    showToast('오류: ' + e.message);
  }
}

export function closeKpiPanel() {
  const p = document.getElementById('kpi-side-panel');
  const o = document.getElementById('kpi-overlay');
  if (p) p.classList.remove('on');
  if (o) o.classList.remove('on');
}

export function initKpiEvents() {
  document.addEventListener('click', function (e) {
    const card = e.target.closest('[data-kpi-key]');
    if (card) {
      e.stopPropagation();
      openKpiPopup(card.dataset.kpiKey);
    }
  });
}
