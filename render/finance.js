// render/finance.js — 재무 페이지 렌더
import { RAW } from '../data/raw.js';
import { S, C, COLORS, COLORS_A, COLORS_BAR } from '../utils/state.js';
import { gd, getPL, sum, last, prev, fmt, pct, yoySum } from '../utils/calc.js';
import { mkC, baseOpts, makeDonut, addSparklines } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';
import { callAI, setAILoading, setAIResult, setAIError } from '../utils/ai.js';
import { buildPB } from '../utils/period.js';
import { showToast } from '../utils/toast.js';

let _finCurrentCh = 'all';

function getChColor(ch) {
  return { all: C.gold, 소매: C.gold, 도매: C.teal, 디지털: C.blue, B2B: C.purple, 소상공인: C.orange }[ch] || C.gold;
}
function getChColorA(ch) {
  return { all: C.goldA, 소매: C.goldA, 도매: C.tealA, 디지털: C.blueA, B2B: C.purpleA, 소상공인: C.orangeA }[ch] || C.goldA;
}

export function calcChannelFinance(ch) {
  const fin = gd('finance');
  const org = gd('org');
  const chKeys = ['소매', '도매', '디지털', 'B2B', '소상공인'];
  const totalCapa = org.months.map((_, i) => chKeys.reduce((s, k) => s + (org[k]?.[i] || 0), 0));

  function apportionSeries(series, chKey) {
    return series.map((v, i) => {
      if (!totalCapa[i]) return 0;
      const ratio = chKey === 'all' ? 1 : (org[chKey]?.[i] || 0) / totalCapa[i];
      return parseFloat((v * ratio).toFixed(2));
    });
  }

  if (ch === 'all') {
    return { months: fin.months, 영업이익: fin.영업이익, 판관비: fin.판관비, 인건비: fin.인건비, 마케팅비: fin.마케팅비, 총매출: fin.총매출, 통신매출: fin.통신매출 };
  }
  return {
    months: fin.months,
    영업이익: apportionSeries(fin.영업이익, ch),
    판관비: apportionSeries(fin.판관비, ch),
    인건비: apportionSeries(fin.인건비, ch),
    마케팅비: apportionSeries(fin.마케팅비, ch),
    총매출: apportionSeries(fin.총매출, ch),
    통신매출: apportionSeries(fin.통신매출, ch),
  };
}

export function selectFinCh(ch, btn) {
  _finCurrentCh = ch;
  document.querySelectorAll('#fin-ch-tabs .ch-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const d = calcChannelFinance(ch);
  const chLabel = ch === 'all' ? '전체 합산' : ch;
  const col = getChColor(ch);
  const colA = getChColorA(ch);

  document.getElementById('fin-ch-kpi').innerHTML = [
    kpi('영업이익 (누계)', fmt(sum(d.영업이익), 1), '억원', pct(last(d.영업이익), prev(d.영업이익)), sum(d.영업이익) >= 0 ? 'green' : 'red', `${chLabel} · 최근월 ${fmt(last(d.영업이익), 1)}억`),
    kpi('총매출 기여 (누계)', fmt(sum(d.총매출), 1), '억원', null, 'gold', `${chLabel}`),
    kpi('판관비 (누계)', fmt(sum(d.판관비), 1), '억원', null, 'purple', `${chLabel}`),
    kpi('인건비 (누계)', fmt(sum(d.인건비), 1), '억원', null, 'blue', `${chLabel}`),
    kpi('마케팅비 (누계)', fmt(sum(d.마케팅비), 1), '억원', null, 'orange', `${chLabel}`),
    kpi('영업이익률 (추정)', fmt(sum(d.영업이익) / Math.max(sum(d.총매출), 1) * 100, 1), '%', null, sum(d.영업이익) >= 0 ? 'teal' : 'red', `${chLabel}`),
  ].join('');

  document.getElementById('fin-ch-title').textContent = `${chLabel} 영업이익 누적 추이`;
  document.getElementById('fin-ch-sub').textContent = ch === 'all' ? '전체 합산 영업이익 (억원)' : 'CAPA 비중 기반 추정 영업이익 (억원)';
  document.getElementById('fin-ch-cost-sub').textContent = `${chLabel} 비용 구조 (인건비 · 마케팅비 · 판관비)`;

  mkC('ch-fin-ch-profit', {
    type: 'bar', data: {
      labels: d.months, datasets: [
        { label: '영업이익', data: d.영업이익, backgroundColor: d.영업이익.map(v => v >= 0 ? colA : C.redA), borderColor: d.영업이익.map(v => v >= 0 ? col : C.red), borderWidth: 1.5 },
        { label: '누계', type: 'line', data: (() => { let s = 0; return d.영업이익.map(v => { s += v; return parseFloat(s.toFixed(2)); }); })(), borderColor: C.teal, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: .3, yAxisID: 'y2' },
      ]
    }, options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } }, y: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '월별(억원)', color: '#5c6e9a' } }, y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' }, title: { display: true, text: '누계(억원)', color: '#5c6e9a' } } } })
  });

  mkC('ch-fin-ch-cost', {
    type: 'bar', data: {
      labels: d.months, datasets: [
        { label: '인건비', data: d.인건비, backgroundColor: C.blueA, borderColor: C.blue, borderWidth: 1, stack: 's' },
        { label: '마케팅비', data: d.마케팅비, backgroundColor: C.orangeA, borderColor: C.orange, borderWidth: 1, stack: 's' },
        { label: '판관비(기타)', data: d.판관비.map((v, i) => Math.max(0, v - d.인건비[i] - d.마케팅비[i])), backgroundColor: C.purpleA, borderColor: C.purple, borderWidth: 1, stack: 's' },
      ]
    }, options: baseOpts({ scales: { x: { stacked: true, grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } } }, y: { stacked: true, grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { color: '#5c6e9a' } } } })
  });

  const chKeys = ['소매', '도매', '디지털', 'B2B', '소상공인'];
  if (ch === 'all') {
    const org = gd('org');
    const totals = chKeys.map(k => sum(org[k] || []));
    const grand = sum(totals) || 1;
    const shareColors = COLORS_A.slice(0, chKeys.length).map(c => c.replace('0.12', '0.80'));
    makeDonut('ch-fin-ch-share', chKeys, totals.map(v => parseFloat((v / grand * 100).toFixed(1))), shareColors, '채널별', '비중(%)');
  } else {
    const org = gd('org');
    const chCapa = sum(org[ch] || []);
    const otherCapa = chKeys.filter(k => k !== ch).reduce((s, k) => s + sum(org[k] || []), 0);
    const total = chCapa + otherCapa || 1;
    const chPct = parseFloat((chCapa / total * 100).toFixed(1));
    makeDonut('ch-fin-ch-share', [ch, '기타채널'], [chPct, parseFloat((otherCapa / total * 100).toFixed(1))], [colA.replace('0.12', '0.80'), 'rgba(228,231,240,0.8)'], chPct + '%', ch + ' 비중');
  }

  const aiCard = document.getElementById('fin-ch-ai-card');
  aiCard.style.display = '';
  document.getElementById('fin-ch-ai-subtitle').textContent = `${chLabel} 채널 분석 준비 완료 · 기간: ${getPL()}`;
  document.getElementById('fin-ch-ai-body').innerHTML = `<div style="font-size:12px;color:var(--text3);text-align:center;padding:10px 0">▶ '분석 실행' 버튼을 누르면 ${chLabel} 채널을 AI가 분석합니다</div>`;
  document.getElementById('fin-ch-ai-btn').disabled = false;
  document.getElementById('fin-ch-ai-btn').textContent = '✦ 분석 실행';
}

export async function runFinanceAI() {
  if (!document.getElementById('fin-ai-body')) return;
  const d = gd('finance');
  const period = getPL();
  setAILoading('fin-ai-body', 'fin-ai-btn');
  document.getElementById('fin-ai-subtitle').textContent = `분석 기간: ${period}`;

  const summary = `
[분석 기간] ${period}
[총매출] 누계 ${fmt(sum(d.총매출), 1)}억 / 최근월 ${fmt(last(d.총매출), 1)}억
[통신매출] 누계 ${fmt(sum(d.통신매출), 1)}억 / 최근월 ${fmt(last(d.통신매출), 1)}억
[상품매출] 누계 ${fmt(sum(d.상품매출), 1)}억
[상품이익] 누계 ${fmt(sum(d.상품이익), 1)}억
[영업이익] 누계 ${fmt(sum(d.영업이익), 1)}억 / 최근월 ${fmt(last(d.영업이익), 1)}억
[판관비] 누계 ${fmt(sum(d.판관비), 1)}억
[인건비] 누계 ${fmt(sum(d.인건비), 1)}억
[마케팅비] 누계 ${fmt(sum(d.마케팅비), 1)}억
[월별 영업이익 최근 6개월] ${d.영업이익.slice(-6).map((v, i) => `${d.months[d.months.length - 6 + i]}: ${fmt(v, 1)}억`).join(' / ')}
[전체 기간 영업이익 추이] ${d.영업이익.map((v, i) => `${d.months[i]}:${fmt(v, 1)}`).join(', ')}`;

  try {
    const result = await callAI(`아래 KT M&S 재무 데이터를 분석해주세요:\n${summary}\n\n다음 항목을 포함해 3~5문단으로 분석하세요:\n1. 전반적인 재무 성과 평가\n2. 수익성 트렌드 및 주요 변곡점\n3. 비용 구조 특이사항\n4. 향후 1~3개월 전망 및 리스크`);
    setAIResult('fin-ai-body', 'fin-ai-btn', result);
  } catch (e) {
    setAIError('fin-ai-body', 'fin-ai-btn', e.message);
  }
}

export async function runChannelAI() {
  const ch = _finCurrentCh;
  const d = calcChannelFinance(ch);
  const chLabel = ch === 'all' ? '전체 합산' : ch;
  const period = getPL();
  setAILoading('fin-ch-ai-body', 'fin-ch-ai-btn');
  document.getElementById('fin-ch-ai-subtitle').textContent = `분석 중: ${chLabel} 채널 · ${period}`;

  const org = gd('org');
  const chKeys = ['소매', '도매', '디지털', 'B2B', '소상공인'];
  const totCapa = chKeys.reduce((s, k) => s + sum(org[k] || []), 0) || 1;
  const chCapa = ch === 'all' ? totCapa : sum(org[ch] || []);
  const capaShare = (chCapa / totCapa * 100).toFixed(1);

  const summary = `
[채널] ${chLabel}
[분석 기간] ${period}
[CAPA 비중] 전체 대비 ${capaShare}%
[영업이익 누계] ${fmt(sum(d.영업이익), 1)}억원
[최근월 영업이익] ${fmt(last(d.영업이익), 1)}억원
[총매출 기여 누계] ${fmt(sum(d.총매출), 1)}억원
[판관비 누계] ${fmt(sum(d.판관비), 1)}억원
[마케팅비 누계] ${fmt(sum(d.마케팅비), 1)}억원
[최근 6개월 영업이익] ${d.영업이익.slice(-6).map((v, i) => `${d.months[d.months.length - 6 + i]}: ${fmt(v, 1)}억`).join(' / ')}`;

  try {
    const result = await callAI(
      `아래 KT M&S ${chLabel} 채널 재무 데이터를 분석해주세요:\n${summary}\n\n다음 항목을 포함해 2~4문단으로 분석하세요:\n1. ${chLabel} 채널의 수익성 평가\n2. 비용 효율성 및 개선 포인트\n3. 전체 채널 대비 포지셔닝\n4. 향후 전망 및 액션 포인트`,
      `당신은 KT M&S의 ${chLabel} 채널 전문 재무 분석가입니다. 채널 특성을 반영한 인사이트를 제공합니다.`
    );
    setAIResult('fin-ch-ai-body', 'fin-ch-ai-btn', result);
  } catch (e) {
    setAIError('fin-ch-ai-body', 'fin-ch-ai-btn', e.message);
  }
}

export function renderFinance() {
  const d = gd('finance');

  const RF = RAW.finance;

  // 기간 선택(S.pi)을 반영한 YoY 계산 — 항상 선택 기간 vs 전년동기
  function piYoy(arr) {
    const { s, e } = S.pi;
    const cur = (arr || []).slice(s, e + 1).reduce((a, b) => a + (b || 0), 0);
    const prevS = s - 12, prevE = e - 12;
    if (prevS < 0) return { cur, prev: null, pct: null };
    const prev = (arr || []).slice(prevS, prevE + 1).reduce((a, b) => a + (b || 0), 0);
    return { cur, prev, pct: prev ? (cur - prev) / Math.abs(prev) * 100 : 0 };
  }

  const yoyTot  = piYoy(RF.총매출);
  const yoyTong = piYoy(RF.통신매출);
  const yoyOp   = piYoy(RF.영업이익);
  const yoyMkt  = piYoy(RF.마케팅비);
  const yoyOpex = piYoy(RF.판관비);

  function yoyBadge(yoyObj) { if (!yoyObj || yoyObj.pct == null) return null; return yoyObj.pct; }

  const lastM = d.months[d.months.length - 1];
  const lastMonthPart = lastM.replace(/^'?\d+\./, '');
  const curYearStr = lastM.match(/^'?(\d+)\./)?.[1];
  const prevYearStr = curYearStr ? String(parseInt(curYearStr) - 1) : '';
  const compLabel = `전년동기대비 (${prevYearStr}년 1~${lastMonthPart} vs ${curYearStr}년 1~${lastMonthPart})`;

  const 서비스Raw = RF.서비스매출 || RF.수수료매출;
  const yoySvc = piYoy(서비스Raw);

  document.getElementById('fin-kpi').innerHTML = `
    <div style="grid-column:1/-1;font-size:10px;color:var(--text3);background:rgba(91,110,245,.06);border:1px solid rgba(91,110,245,.15);border-radius:8px;padding:6px 12px;display:flex;align-items:center;gap:6px">
      <span style="font-size:12px">📊</span> <b style="color:var(--primary)">비교기준:</b> ${compLabel}
      <span style="margin-left:6px;color:var(--text3)">· 각 카드 클릭 시 상세 분석</span>
    </div>` + [
    kpi('총매출 (누계)', fmt(yoyTot.cur, 1), '억원', yoyBadge(yoyTot), 'gold', yoyTot.prev != null ? `전년동기 ${fmt(yoyTot.prev, 1)}억` : '', 'fin:총매출'),
    kpi('서비스매출 (누계)', fmt(yoySvc.cur, 1), '억원', yoyBadge(yoySvc), 'teal', yoySvc.prev != null ? `전년동기 ${fmt(yoySvc.prev, 1)}억` : '', 'fin:서비스매출'),
    kpi('영업이익 (누계)', fmt(yoyOp.cur, 1), '억원', yoyBadge(yoyOp), yoyOp.cur >= 0 ? 'green' : 'red', yoyOp.prev != null ? `전년동기 ${fmt(yoyOp.prev, 1)}억` : '', 'fin:영업이익'),
    kpi('판관비 (누계)', fmt(yoyOpex.cur, 1), '억원', yoyBadge(yoyOpex), 'purple', `인건비 ${fmt(sum(d.인건비), 1)}억`, 'fin:판관비'),
    kpi('마케팅비 (누계)', fmt(yoyMkt.cur, 1), '억원', yoyBadge(yoyMkt), 'orange', yoyMkt.prev != null ? `전년동기 ${fmt(yoyMkt.prev, 1)}억` : '', 'fin:마케팅비'),
    kpi('통신매출 (누계)', fmt(yoyTong.cur, 1), '억원', yoyBadge(yoyTong), 'blue', yoyTong.prev != null ? `전년동기 ${fmt(yoyTong.prev, 1)}억` : '', 'fin:통신매출'),
  ].join('');

  const pointCfg = { pointRadius: 4, pointHoverRadius: 8, pointHitRadius: 24, pointBorderWidth: 2, pointBorderColor: '#fff' };

  const onMonthClick = (evt, elements, chart) => {
    if (!elements.length) return;
    const idx = elements[0].index;
    S.pi = { s: idx, e: idx };
    buildPB('pb-finance', 'renderFinance');
    renderFinance();
    showToast(`📅 ${d.months[idx]} 기준으로 필터 변경`);
  };

  mkC('ch-rev', {
    type: 'line', data: {
      labels: d.months, datasets: [
        { label: '총매출', ...pointCfg, data: d.총매출, borderColor: C.primary, backgroundColor: C.primaryA, borderWidth: 2.5, tension: .4, fill: true, yAxisID: 'y' },
        { label: '통신매출', ...pointCfg, data: d.통신매출, borderColor: C.teal, backgroundColor: 'transparent', borderWidth: 2, tension: .4, borderDash: [5, 3], yAxisID: 'y' },
        { label: '영업이익', ...pointCfg, pointRadius: 4, data: d.영업이익, borderColor: C.green, backgroundColor: 'transparent', borderWidth: 2, tension: .4, yAxisID: 'y2' },
      ]
    },
    options: baseOpts({
      onClick: onMonthClick,
      onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; },
      scales: {
        x: { grid: { color: 'rgba(228,231,240,.6)' }, ticks: { maxRotation: 45, color: '#8b93b8', font: { size: 10 } }, border: { display: false } },
        y: { grid: { color: 'rgba(228,231,240,.6)' }, ticks: { color: '#8b93b8', font: { size: 10 } }, title: { display: true, text: '매출 (억원)', color: '#8b93b8', font: { size: 10 } }, border: { display: false } },
        y2: { position: 'right', grid: { display: false }, ticks: { color: '#10b981', font: { size: 10 } }, title: { display: true, text: '이익 (억원)', color: '#10b981', font: { size: 10 } }, border: { display: false } }
      }
    })
  });

  mkC('ch-profit', {
    type: 'bar', data: {
      labels: d.months, datasets: [{
        label: '영업이익', data: d.영업이익,
        backgroundColor: d.영업이익.map(v => v >= 0 ? 'rgba(16,185,129,0.75)' : 'rgba(239,68,68,0.75)'),
        borderColor: d.영업이익.map(v => v >= 0 ? C.green : C.red),
        borderWidth: 0, borderRadius: 4, borderSkipped: false,
      }]
    },
    options: baseOpts({
      onClick: onMonthClick,
      onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#fff', titleColor: '#1a1f36', bodyColor: '#4a5380', borderColor: '#e4e7f0', borderWidth: 1, cornerRadius: 10 } },
    })
  });

  mkC('ch-cost', {
    type: 'bar', data: {
      labels: d.months, datasets: [
        { label: '인건비', data: d.인건비, backgroundColor: 'rgba(91,110,245,0.72)', borderWidth: 0, borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }, stack: 's' },
        { label: '마케팅비', data: d.마케팅비, backgroundColor: 'rgba(249,115,22,0.72)', borderWidth: 0, stack: 's' },
        { label: '기타 판관비', data: d.판관비.map((v, i) => Math.max(0, v - (d.인건비[i] || 0) - (d.마케팅비[i] || 0))), backgroundColor: 'rgba(139,92,246,0.65)', borderWidth: 0, borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }, stack: 's' },
      ]
    },
    options: baseOpts({
      scales: {
        x: { stacked: true, grid: { color: 'rgba(228,231,240,.6)' }, ticks: { maxRotation: 45, color: '#8b93b8', font: { size: 10 } }, border: { display: false } },
        y: { stacked: true, grid: { color: 'rgba(228,231,240,.6)' }, ticks: { color: '#8b93b8', font: { size: 10 } }, border: { display: false } }
      }
    })
  });

  selectFinCh('all', document.querySelector('#fin-ch-tabs .ch-tab'));
  if (document.getElementById('fin-ai-body')) {
    document.getElementById('fin-ai-body').innerHTML = `<div style="font-size:12px;color:var(--text3);text-align:center;padding:10px 0">위 버튼을 클릭하면 선택 기간의 재무 데이터를 AI가 분석합니다</div>`;
    document.getElementById('fin-ai-subtitle').textContent = `분석 기간: ${getPL()}`;
    document.getElementById('fin-ai-btn').disabled = false;
    document.getElementById('fin-ai-btn').textContent = '✦ 분석 실행';
  }

  addSparklines('fin-kpi', {
    'fin:총매출': RF.총매출,
    'fin:통신매출': RF.통신매출,
    'fin:영업이익': RF.영업이익,
    'fin:판관비': RF.판관비,
    'fin:마케팅비': RF.마케팅비,
  });
}
