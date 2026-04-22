// render/summary.js — 경영현황 요약 (홈)
import { RAW } from '../data/raw.js';
import { S } from '../utils/state.js';
import { sum, fmt, pct } from '../utils/calc.js';
import { getInfraSeries } from '../utils/infra.js';

function yr25slice(arr, months) {
  const s = (months || RAW.finance.months).findIndex(m => m.startsWith('25.'));
  return s < 0 ? arr : arr.slice(s);
}

function yoy(arr, months) {
  const ms = months || RAW.finance.months;
  const s25 = ms.findIndex(m => m.startsWith('25.'));
  if (s25 < 0 || s25 < 12) return null;
  const last25 = ms.length - 1;
  const cur = arr.slice(s25, last25 + 1).reduce((a, b) => a + (b || 0), 0);
  const prev = arr.slice(s25 - 12, last25 - 12 + 1).reduce((a, b) => a + (b || 0), 0);
  const pctV = prev ? ((cur - prev) / prev * 100) : 0;
  return { cur, prev, pct: pctV };
}

function badge(pctV, inverse = false) {
  if (pctV == null) return '';
  const up = inverse ? pctV < 0 : pctV >= 0;
  const cls = up ? '#10b981' : '#ef4444';
  const arrow = pctV >= 0 ? '▲' : '▼';
  return `<span style="font-size:11px;font-weight:700;color:${cls};margin-left:6px">${arrow} ${Math.abs(pctV).toFixed(1)}%</span>`;
}

function fmtK(v) {
  if (Math.abs(v) >= 10000) return (v / 10000).toFixed(1) + '만';
  return Math.round(v).toLocaleString();
}

function card(opts) {
  const { label, icon, value, unit, yoyPct, sub, color, page, inverse = false, wide = false } = opts;
  const bdg = badge(yoyPct, inverse);
  const cursor = page ? 'cursor:pointer' : '';
  const click = page ? `onclick="nav('${page}');showToast('📊 ${label} 상세 보기')"` : '';
  const hoverHint = page ? `<div style="font-size:9px;color:rgba(255,255,255,.6);margin-top:4px">클릭하여 상세 보기 →</div>` : '';
  return `
    <div class="sum-card" style="background:${color};${cursor};${wide ? 'grid-column:span 2' : ''}" ${click}>
      <div style="font-size:18px;margin-bottom:4px">${icon}</div>
      <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.85);letter-spacing:.3px;margin-bottom:6px">${label}</div>
      <div style="font-size:22px;font-weight:800;color:#fff;line-height:1.1">
        ${value}<span style="font-size:12px;font-weight:500;margin-left:3px;opacity:.85">${unit}</span>${bdg}
      </div>
      ${sub ? `<div style="font-size:10px;color:rgba(255,255,255,.7);margin-top:5px">${sub}</div>` : ''}
      ${hoverHint}
    </div>`;
}

function issueRow(label, cur, unit, pctV, color, inverse = false) {
  const isUp = pctV >= 0;
  const good = inverse ? !isUp : isUp;
  const dotColor = good ? '#10b981' : '#ef4444';
  const arrow = isUp ? '▲' : '▼';
  const sign = good ? '양호' : '주의';
  return `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--bg3);border:1px solid var(--border)">
      <div style="width:7px;height:7px;border-radius:50%;background:${dotColor};flex-shrink:0"></div>
      <div style="font-size:11px;font-weight:600;color:var(--text);flex:1">${label}</div>
      <div style="font-size:12px;font-weight:700;color:var(--text)">${fmt(cur, unit === '억원' ? 1 : 0)}<span style="font-size:10px;color:var(--text3);margin-left:2px">${unit}</span></div>
      <div style="font-size:10px;font-weight:700;color:${dotColor}">${arrow} ${Math.abs(pctV).toFixed(1)}%</div>
      <div style="font-size:9px;padding:2px 6px;border-radius:10px;background:${dotColor}22;color:${dotColor};font-weight:700">${sign}</div>
    </div>`;
}

function procCard(label, icon, value, unit, sub, color) {
  return `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:4px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
        <span style="font-size:14px">${icon}</span>
        <span style="font-size:10px;font-weight:600;color:var(--text3)">${label}</span>
      </div>
      <div style="font-size:20px;font-weight:800;color:${color}">${value}<span style="font-size:11px;font-weight:500;margin-left:3px;color:var(--text3)">${unit}</span></div>
      <div style="font-size:10px;color:var(--text3)">${sub}</div>
    </div>`;
}

export function renderSummary() {
  const FIN = RAW.finance;
  const WL  = RAW.wireless;
  const WD  = RAW.wired;
  const B2B = RAW.b2b;
  const VOC = RAW.voc;
  const TC  = RAW.tcsi;

  const fMonths = FIN.months;
  const lastIdx = fMonths.length - 1;
  const lastM   = fMonths[lastIdx];  // e.g. 25.12월

  // ── 서비스매출 = 통신수수료 + 유통플랫폼수수료 (raw.js finance.서비스매출)
  const 서비스Raw = FIN['서비스매출'] || FIN['수수료매출'];

  // ── YoY
  const yoy총매출   = yoy(FIN['총매출'],  fMonths);
  const yoy서비스   = yoy(서비스Raw,       fMonths);
  const yoy영업이익 = yoy(FIN['영업이익'], fMonths);

  const wlMs = WL.months;
  const yoy무선유지 = yoy(WL['유지'], wlMs);
  const yoy무선신규 = yoy(WL['CAPA'], wlMs);
  const wlLast = wlMs.length - 1;

  const wdMs = WD.months;
  const yoy유선유지 = yoy(WD['유지_전체'], wdMs);
  const yoy유선신규 = yoy(WD['신규_전체'], wdMs);
  const wdLast = wdMs.length - 1;

  // ── 최근월 값
  const 총매출last  = FIN['총매출'][lastIdx];
  const 서비스last  = 서비스Raw[lastIdx];
  const 영업이익last = FIN['영업이익'][lastIdx];

  const 무선유지last = WL['유지'][wlLast];
  const 무선신규last = WL['CAPA'][wlLast];
  const 유선유지last = WD['유지_전체'][wdLast];
  const 유선신규last = WD['신규_전체'][wdLast];

  // ── 채널별 영업이익 (25년 누계)
  const s25 = fMonths.findIndex(m => m.startsWith('25.'));
  const ch영업 = {
    소매:     { cur: FIN['영업이익_소매']?.slice(s25, lastIdx + 1).reduce((a,b)=>a+b,0) ?? 0,   prev: FIN['영업이익_소매']?.slice(s25-12, lastIdx-12+1).reduce((a,b)=>a+b,0) ?? 0 },
    도매:     { cur: FIN['영업이익_도매']?.slice(s25, lastIdx + 1).reduce((a,b)=>a+b,0) ?? 0,   prev: FIN['영업이익_도매']?.slice(s25-12, lastIdx-12+1).reduce((a,b)=>a+b,0) ?? 0 },
    디지털:   { cur: FIN['영업이익_디지털']?.slice(s25, lastIdx + 1).reduce((a,b)=>a+b,0) ?? 0, prev: FIN['영업이익_디지털']?.slice(s25-12, lastIdx-12+1).reduce((a,b)=>a+b,0) ?? 0 },
    소상공인: { cur: FIN['영업이익_소상공인']?.slice(s25, lastIdx + 1).reduce((a,b)=>a+b,0) ?? 0, prev: FIN['영업이익_소상공인']?.slice(s25-12, lastIdx-12+1).reduce((a,b)=>a+b,0) ?? 0 },
  };

  const chPct = (ch) => ch.prev ? ((ch.cur - ch.prev) / Math.abs(ch.prev) * 100) : 0;

  // ── 조직별 CAPA YoY (ORG)
  const ORG = RAW.org;
  const orgMs = ORG.months;
  const orgS25 = orgMs.findIndex(m => m.startsWith('25.'));
  const orgLast = orgMs.length - 1;
  const orgYoy = (key) => {
    const arr = ORG[key] || [];
    const cur = arr.slice(orgS25, orgLast + 1).reduce((a,b)=>a+b,0);
    const prev = arr.slice(orgS25 - 12, orgLast - 12 + 1).reduce((a,b)=>a+b,0);
    return prev ? ((cur - prev) / prev * 100) : 0;
  };

  // ── 과정형 지표
  const vocLast = VOC.months.length - 1;
  const vocRate = (VOC['도소매발생률']?.[vocLast] * 100 || 0).toFixed(2);
  const vocCnt  = VOC['원천인입건']?.[vocLast] ?? 0;

  const tcLast  = TC.months.length - 1;
  const tcsiScore = TC['TCSI점수']?.[tcLast] ?? 0;

  const b2bMs   = B2B.months;
  const b2bS25  = b2bMs.findIndex(m => m.startsWith('25.'));
  const b2bLast = b2bMs.length - 1;
  const b2b신규누계 = (B2B['전체_후불신규'] || []).slice(b2bS25, b2bLast + 1).reduce((a,b)=>a+b,0);
  const b2bYoy = (() => {
    const arr = B2B['전체_후불신규'] || [];
    const cur = arr.slice(b2bS25, b2bLast + 1).reduce((a,b)=>a+b,0);
    const prev = arr.slice(b2bS25 - 12, b2bLast - 12 + 1).reduce((a,b)=>a+b,0);
    return prev ? ((cur - prev) / prev * 100).toFixed(1) : '0.0';
  })();

  const infra = getInfraSeries();
  const infraLast = infra.storeCount?.[infra.storeCount.length - 1] ?? 0;

  // ── 무선 생산성 = 신규/유지 * 1000
  const 무선생산성 = 무선유지last > 0 ? (무선신규last / 무선유지last * 1000).toFixed(1) : '-';

  // ── 요약 텍스트 생성 (동적)
  const 서비스YoySign = yoy서비스?.pct >= 0 ? '+' : '';
  const 영업YoySign   = yoy영업이익?.pct >= 0 ? '+' : '';
  const 소상공이슈 = ch영업.소상공인.cur < 0 ? `소상공인 영업이익 누계 ${fmt(ch영업.소상공인.cur, 1)}억으로 손실 장기화,` : '';
  const 소매이슈   = 영업이익last < 0 ? `소매 최근월 ${fmt(영업이익last, 1)}억 적자 발생하여 수익성 집중 관리 요망함.` : `소매 최근월 ${fmt(영업이익last, 1)}억으로 수익성 양호함.`;

  const summaryText = `25년 누계 서비스매출 ${fmt(yoy서비스?.cur ?? 0, 0)}억(전년比${서비스YoySign}${yoy서비스?.pct.toFixed(1)}%), 영업이익 ${fmt(yoy영업이익?.cur ?? 0, 0)}억(${영업YoySign}${yoy영업이익?.pct.toFixed(1)}%)으로 핵심 KPI 목표 달성 중. 총매출은 ${fmt(yoy총매출?.cur ?? 0, 0)}억(${yoy총매출?.pct.toFixed(1)}%)으로 상품매출 부진 지속함. 무선신규 ${fmtK(yoy무선신규?.cur ?? 0)}건(+${yoy무선신규?.pct.toFixed(1)}%), 유선신규 ${fmtK(yoy유선신규?.cur ?? 0)}건(+${yoy유선신규?.pct.toFixed(1)}%)으로 신규 가입 호조세 유지함. ${소상공이슈} ${소매이슈}`;

  const el = document.getElementById('sum-body');
  if (!el) return;

  el.innerHTML = `
<style>
.sum-card {
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  transition: transform .15s, box-shadow .15s;
  display: flex;
  flex-direction: column;
}
.sum-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.18); }
.sum-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.sum-grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.sum-grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.sum-proc4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media (max-width: 900px) {
  .sum-grid3 { grid-template-columns: repeat(2,1fr); }
  .sum-grid4 { grid-template-columns: repeat(2,1fr); }
  .sum-proc4 { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 540px) {
  .sum-grid3, .sum-grid4, .sum-grid2, .sum-proc4 { grid-template-columns: 1fr; }
}
.sum-section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text3);
  letter-spacing: .5px;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.sum-section-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: var(--primary);
}
</style>

<!-- ① 이달의 요약 -->
<div style="background:linear-gradient(135deg,rgba(91,110,245,.12) 0%,rgba(6,182,212,.08) 100%);border:1px solid rgba(91,110,245,.2);border-radius:14px;padding:18px 20px;margin-bottom:18px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="font-size:16px">📋</span>
    <span style="font-size:13px;font-weight:800;color:var(--primary)">이달의 경영 요약</span>
    <span style="margin-left:auto;font-size:10px;color:var(--text3);background:var(--bg3);border:1px solid var(--border);padding:3px 8px;border-radius:8px">${lastM} 기준</span>
  </div>
  <p style="font-size:12.5px;line-height:1.85;color:var(--text);margin:0;word-break:keep-all">${summaryText}</p>
</div>

<!-- ② 재무 KPI -->
<div style="margin-bottom:18px">
  <div class="sum-section-title">💰 재무 핵심 KPI (25년 누계, 클릭 시 상세)</div>
  <div class="sum-grid3">
    ${card({ label: '총매출', icon: '📊', value: fmt(yoy총매출?.cur ?? 0, 0), unit: '억원', yoyPct: yoy총매출?.pct, sub: `전년동기 ${fmt(yoy총매출?.prev ?? 0, 0)}억`, color: 'linear-gradient(135deg,#5b6ef5,#7c8ffa)', page: 'finance' })}
    ${card({ label: '서비스매출', icon: '🏆', value: fmt(yoy서비스?.cur ?? 0, 0), unit: '억원', yoyPct: yoy서비스?.pct, sub: `통신+유통플랫폼 수수료 · 전년 ${fmt(yoy서비스?.prev ?? 0, 0)}억`, color: 'linear-gradient(135deg,#06b6d4,#22d3ee)', page: 'finance' })}
    ${card({ label: '영업이익', icon: (yoy영업이익?.cur ?? 0) >= 0 ? '📈' : '📉', value: fmt(yoy영업이익?.cur ?? 0, 1), unit: '억원', yoyPct: yoy영업이익?.pct, sub: `전년동기 ${fmt(yoy영업이익?.prev ?? 0, 1)}억 · 최근월 ${fmt(영업이익last, 1)}억`, color: (yoy영업이익?.cur ?? 0) >= 0 ? 'linear-gradient(135deg,#10b981,#34d399)' : 'linear-gradient(135deg,#ef4444,#f87171)', page: 'finance' })}
  </div>
</div>

<!-- ③ 유무선 가입자 -->
<div style="margin-bottom:18px">
  <div class="sum-section-title">📱 유무선 가입자 현황 (클릭 시 상세)</div>
  <div class="sum-grid4">
    ${card({ label: '무선 유지가입자', icon: '📱', value: fmtK(무선유지last), unit: '건', yoyPct: yoy무선유지?.pct, inverse: true, sub: `25년 누계 ${fmtK(yoy무선유지?.cur ?? 0)}건`, color: 'linear-gradient(135deg,#3b82f6,#60a5fa)', page: 'wireless' })}
    ${card({ label: '무선 신규(CAPA)', icon: '📶', value: fmtK(무선신규last), unit: '건', yoyPct: yoy무선신규?.pct, sub: `25년 누계 ${fmtK(yoy무선신규?.cur ?? 0)}건`, color: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', page: 'wireless' })}
    ${card({ label: '유선 유지가입자', icon: '🌐', value: fmtK(유선유지last), unit: '건', yoyPct: yoy유선유지?.pct, inverse: true, sub: `25년 누계 ${fmtK(yoy유선유지?.cur ?? 0)}건`, color: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', page: 'wired' })}
    ${card({ label: '유선 신규', icon: '🔌', value: fmtK(유선신규last), unit: '건', yoyPct: yoy유선신규?.pct, sub: `25년 누계 ${fmtK(yoy유선신규?.cur ?? 0)}건`, color: 'linear-gradient(135deg,#14b8a6,#2dd4bf)', page: 'wired' })}
  </div>
</div>

<!-- ④ 조직별 이슈 -->
<div style="margin-bottom:18px">
  <div class="sum-section-title">🏢 조직별 영업이익 이슈 (25년 누계, YoY)</div>
  <div class="sum-grid2">
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:5px">
        <span>🏪</span> 소매 · 소상공인 본부
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${issueRow('소매 영업이익', ch영업.소매.cur, '억원', chPct(ch영업.소매))}
        ${issueRow('소상공인 영업이익', ch영업.소상공인.cur, '억원', chPct(ch영업.소상공인))}
        ${issueRow('소매 CAPA (최근월)', ORG['소매']?.[orgLast] ?? 0, '건', orgYoy('소매'))}
      </div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:5px">
        <span>🏭</span> 도매 · 디지털 본부
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${issueRow('도매 영업이익', ch영업.도매.cur, '억원', chPct(ch영업.도매))}
        ${issueRow('디지털 영업이익', ch영업.디지털.cur, '억원', chPct(ch영업.디지털))}
        ${issueRow('도매 CAPA (최근월)', ORG['도매']?.[orgLast] ?? 0, '건', orgYoy('도매'))}
      </div>
    </div>
  </div>
</div>

<!-- ⑤ 과정형 지표 -->
<div>
  <div class="sum-section-title">📐 과정형 지표</div>
  <div class="sum-proc4">
    ${procCard('R-VOC 발생률', '📞', vocRate, '%', `원천인입 ${vocCnt.toLocaleString()}건 · ${VOC.months[vocLast]}`, vocRate <= 0.5 ? '#10b981' : '#ef4444')}
    ${procCard('TCSI 점수', '⭐', tcsiScore.toFixed(1), '점', `${TC.months[tcLast]} 기준 · KT M&S`, tcsiScore >= 95 ? '#10b981' : tcsiScore >= 90 ? '#f59e0b' : '#ef4444')}
    ${procCard('B2B 후불신규', '🏭', b2b신규누계.toLocaleString(), '건', `25년 누계 · 전년比 ${b2bYoy >= 0 ? '+' : ''}${b2bYoy}%`, Number(b2bYoy) >= 0 ? '#10b981' : '#ef4444')}
    ${procCard('무선 생산성', '📊', 무선생산성, '건/천명', `유지 대비 신규율 · ${wlMs[wlLast]}`, Number(무선생산성) >= 30 ? '#10b981' : '#f59e0b')}
  </div>
</div>`;
}
