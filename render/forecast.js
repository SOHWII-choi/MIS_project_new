// render/forecast.js — 전망 모달 시스템
import { RAW } from '../data/raw.js';
import { S, C } from '../utils/state.js';
import { callAI, setAILoading, setAIResult, setAIError } from '../utils/ai.js';
import { mkC, baseOpts } from '../utils/chart.js';

let _ftab = 'short';
let _forecastCache = {}; // tab → generated text cache

export function openForecast() {
  document.getElementById('forecast-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderFtab(_ftab);
}

export function closeForecast() {
  document.getElementById('forecast-modal').classList.remove('open');
  document.body.style.overflow = '';
}

export function switchFtab(tab, btn) {
  _ftab = tab;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFtab(tab);
}

// 탭별 렌더
export function renderFtab(tab) {
  const body = document.getElementById('forecast-body');
  if (tab === 'short') renderFtabShort(body);
  else if (tab === 'mid') renderFtabMid(body);
  else if (tab === 'risk') renderFtabRisk(body);
  else if (tab === 'scenario') renderFtabScenario(body);
}

// ── 공통 데이터 요약 생성 ──
export function buildForecastContext() {
  const fin = RAW.finance, wl = RAW.wireless, wd = RAW.wired;
  const last3fin = fin.months.slice(-3).map((m, i) => ({
    m, 총매출: fin.총매출[fin.총매출.length - 3 + i],
    영업이익: fin.영업이익[fin.영업이익.length - 3 + i],
    마케팅비: fin.마케팅비[fin.마케팅비.length - 3 + i]
  }));
  return `
[최근 3개월 재무]
${last3fin.map(r => `  ${r.m}: 총매출 ${r.총매출}억, 영업이익 ${r.영업이익}억, 마케팅비 ${r.마케팅비}억`).join('\n')}

[영업이익 6개월 추이] ${fin.영업이익.slice(-6).map((v, i) => `${fin.months[fin.months.length - 6 + i]}:${v}억`).join(', ')}
[총매출 6개월 추이] ${fin.총매출.slice(-6).map((v, i) => `${fin.months[fin.총매출.length - 6 + i]}:${v}억`).join(', ')}
[무선 CAPA 최근 6개월] ${wl.CAPA.slice(-6).map((v, i) => `${wl.months[wl.CAPA.length - 6 + i]}:${v}명`).join(', ')}
[무선 순증 최근 6개월] ${wl.순증.slice(-6).map(v => `${v}`).join(', ')}
[유선 유지 최근월] ${wd.유지_전체[wd.유지_전체.length - 1]}명 (전월 ${wd.유지_전체[wd.유지_전체.length - 2]}명)
[판관비 최근 3개월] ${fin.판관비.slice(-3).map(v => v + '억').join(', ')}
[마케팅비 최근 3개월] ${fin.마케팅비.slice(-3).map(v => v + '억').join(', ')}`;
}

// ── 단기 전망 탭 ──
export function renderFtabShort(body) {
  const fin = RAW.finance;
  const last3avg = arr => arr.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const trend = arr => { const l = arr.slice(-6); const f = l.slice(0, 3).reduce((a, b) => a + b, 0) / 3; const s = l.slice(3).reduce((a, b) => a + b, 0) / 3; return s - f; };
  const nextRev = (last3avg(fin.총매출) + trend(fin.총매출)).toFixed(1);
  const nextProfit = (last3avg(fin.영업이익) + trend(fin.영업이익) * 0.5).toFixed(1);
  const nextCost = (last3avg(fin.판관비) + trend(fin.판관비) * 0.3).toFixed(1);
  const revTrend = trend(fin.총매출);
  const profTrend = trend(fin.영업이익);

  body.innerHTML = `
    <div class="forecast-section">
      <div class="forecast-section-title">📊 핵심 지표 예측 (다음 1개월)</div>
      <div class="forecast-kpi-row">
        <div class="fkpi">
          <div class="fkpi-label">예상 총매출</div>
          <div class="fkpi-value" style="color:var(--gold)">${nextRev}억</div>
          <div class="fkpi-trend ${revTrend >= 0 ? 'up' : 'dn'}">${revTrend >= 0 ? '▲' : '▼'} ${Math.abs(revTrend).toFixed(1)}억 추세</div>
        </div>
        <div class="fkpi">
          <div class="fkpi-label">예상 영업이익</div>
          <div class="fkpi-value" style="color:${Number(nextProfit) >= 0 ? 'var(--green)' : 'var(--red)'}">${nextProfit}억</div>
          <div class="fkpi-trend ${profTrend >= 0 ? 'up' : 'dn'}">${profTrend >= 0 ? '▲' : '▼'} ${Math.abs(profTrend).toFixed(1)}억 추세</div>
        </div>
        <div class="fkpi">
          <div class="fkpi-label">예상 판관비</div>
          <div class="fkpi-value" style="color:var(--purple)">${nextCost}억</div>
          <div class="fkpi-trend neutral">3개월 평균 기반</div>
        </div>
      </div>
    </div>
    <div class="forecast-section">
      <div class="forecast-section-title">📈 향후 3개월 추세</div>
      <div class="forecast-chart-wrap">
        <canvas id="fc-short-chart"></canvas>
      </div>
    </div>
    <div class="forecast-section">
      <div class="forecast-section-title">✦ AI 단기 전망 분석</div>
      <div class="forecast-insight" id="fc-short-ai">
        <div style="font-size:11px;color:var(--text3);text-align:center;padding:8px">
          아래 버튼으로 AI 분석을 실행하세요
        </div>
      </div>
      <button class="forecast-run-btn" id="fc-short-btn" onclick="runForecastAI('short')">
        ✦ AI 단기 전망 분석 실행
      </button>
    </div>`;

  // 예측 차트 (최근 6개월 + 예측 3개월)
  const fin2 = RAW.finance;
  const recentMonths = fin2.months.slice(-6);
  const recentRev = fin2.총매출.slice(-6);
  const recentProfit = fin2.영업이익.slice(-6);
  const predMonths = ['예측+1', '예측+2', '예측+3'];
  const t = trend(fin2.총매출), tp = trend(fin2.영업이익);
  const lastRev = fin2.총매출[fin2.총매출.length - 1];
  const lastProf = fin2.영업이익[fin2.영업이익.length - 1];
  const predRev = [lastRev + t * 0.6, lastRev + t * 1.1, lastRev + t * 1.5];
  const predProf = [lastProf + tp * 0.5, lastProf + tp * 0.9, lastProf + tp * 1.2];
  const allMonths = [...recentMonths, ...predMonths];
  const allRev = [...recentRev, ...predRev];
  const allProfit = [...recentProfit, ...predProf];
  setTimeout(() => {
    mkC('fc-short-chart', {
      type: 'line', data: {
        labels: allMonths, datasets: [
          { label: '총매출', data: allRev, borderColor: C.gold, backgroundColor: 'transparent', borderWidth: 2, pointRadius: allMonths.map((_, i) => i >= 6 ? 5 : 2), pointStyle: allMonths.map((_, i) => i >= 6 ? 'triangle' : 'circle'), tension: .3, segment: { borderDash: ctx => ctx.p0DataIndex >= 5 ? [5, 5] : undefined } },
          { label: '영업이익', data: allProfit, borderColor: C.green, backgroundColor: 'transparent', borderWidth: 2, pointRadius: allMonths.map((_, i) => i >= 6 ? 5 : 2), tension: .3, yAxisID: 'y2', segment: { borderDash: ctx => ctx.p0DataIndex >= 5 ? [5, 5] : undefined } },
        ]
      },
      options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,0.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 10 } }, afterFit: function (axis) { axis.paddingRight = 10; } }, y: { grid: { color: 'rgba(42,53,85,.5)' }, ticks: { color: '#5c6e9a' } }, y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' } } } })
    });
  }, 80);

  if (_forecastCache['short']) {
    document.getElementById('fc-short-ai').textContent = _forecastCache['short'];
  }
}

// ── 중기 전망 탭 ──
export function renderFtabMid(body) {
  body.innerHTML = `
    <div class="forecast-section">
      <div class="forecast-section-title">📊 중기 예측 (향후 6개월 누적)</div>
      <div class="forecast-chart-wrap">
        <canvas id="fc-mid-chart"></canvas>
      </div>
    </div>
    <div class="forecast-section">
      <div class="forecast-section-title">✦ AI 중기 전망 분석</div>
      <div class="forecast-insight" id="fc-mid-ai">
        <div style="font-size:11px;color:var(--text3);text-align:center;padding:8px">아래 버튼으로 AI 분석을 실행하세요</div>
      </div>
      <button class="forecast-run-btn" id="fc-mid-btn" onclick="runForecastAI('mid')">
        ✦ AI 중기 전망 분석 실행
      </button>
    </div>`;

  const fin = RAW.finance;
  const trend6 = arr => { const l = arr.slice(-6); const f = l.slice(0, 3).reduce((a, b) => a + b, 0) / 3; const s = l.slice(3).reduce((a, b) => a + b, 0) / 3; return (s - f) / 3; };
  const pred = (arr, n) => { const last = arr[arr.length - 1]; const t = trend6(arr); return Array.from({ length: n }, (_, i) => parseFloat((last + t * (i + 1)).toFixed(1))); };
  const recentMonths = fin.months.slice(-6);
  const predMonths = ['예측M+1', 'M+2', 'M+3', 'M+4', 'M+5', 'M+6'];
  const allMon = [...recentMonths, ...predMonths];
  setTimeout(() => {
    mkC('fc-mid-chart', {
      type: 'line', data: {
        labels: allMon, datasets: [
          { label: '총매출', data: [...fin.총매출.slice(-6), ...pred(fin.총매출, 6)], borderColor: C.gold, backgroundColor: C.goldA, borderWidth: 2, fill: false, tension: .35, pointRadius: allMon.map((_, i) => i >= 6 ? 4 : 2), segment: { borderDash: ctx => ctx.p0DataIndex >= 5 ? [5, 5] : undefined } },
          { label: '영업이익', data: [...fin.영업이익.slice(-6), ...pred(fin.영업이익, 6)], borderColor: C.green, backgroundColor: 'transparent', borderWidth: 2, tension: .35, pointRadius: allMon.map((_, i) => i >= 6 ? 4 : 2), yAxisID: 'y2', segment: { borderDash: ctx => ctx.p0DataIndex >= 5 ? [5, 5] : undefined } },
          { label: '판관비', data: [...fin.판관비.slice(-6), ...pred(fin.판관비, 6)], borderColor: C.purple, backgroundColor: 'transparent', borderWidth: 1.5, tension: .35, pointRadius: 0, segment: { borderDash: ctx => ctx.p0DataIndex >= 5 ? [4, 4] : undefined } },
        ]
      },
      options: baseOpts({ scales: { x: { grid: { color: 'rgba(42,53,85,.5)' }, ticks: { maxRotation: 45, color: '#5c6e9a', font: { size: 9 } } }, y: { grid: { color: 'rgba(42,53,85,.5)' }, ticks: { color: '#5c6e9a' } }, y2: { position: 'right', grid: { display: false }, ticks: { color: '#5c6e9a' } } } })
    });
  }, 80);

  if (_forecastCache['mid']) {
    document.getElementById('fc-mid-ai').textContent = _forecastCache['mid'];
  }
}

// ── 리스크 탭 ──
export function renderFtabRisk(body) {
  const risks = [
    { level: 'high', icon: '🔴', title: '영업이익 적자 지속', desc: '최근 3개월 중 2개월 영업이익 적자 기록. 고정비 증가 추세와 마케팅비 급등 시 수익성 위협 가중.' },
    { level: 'high', icon: '🔴', title: '무선 순증 마이너스 추세', desc: '지속적인 유지가입자 감소 (-24,490명/최근월). 해지율 증가 시 매출 기반 축소 가속화 우려.' },
    { level: 'mid', icon: '🟡', title: '유선 가입자 이탈 가속', desc: '유선 유지가입자 248,042명으로 지속 하락 중. 인터넷 경쟁 심화 시 유선매출 추가 하락 가능성.' },
    { level: 'mid', icon: '🟡', title: '마케팅비 변동성', desc: '마케팅비가 최근 6개월 15~88억 구간 급변동. 경쟁사 판촉 확대 시 추가 지출 압박 불가피.' },
    { level: 'low', icon: '🟢', title: '디지털 채널 성장 기회', desc: 'KT닷컴 CAPA가 최고 30,235명 기록 후 조정 중. 디지털 전환 가속화 시 비용 효율 개선 여지.' },
    { level: 'low', icon: '🟢', title: 'GiGAeyes 성장 모멘텀', desc: 'GiGAeyes 최근 2,459대 기록으로 전략상품 확장 중. B2B·소상공인 채널 성장 견인 가능.' },
  ];
  body.innerHTML = `
    <div class="forecast-section">
      <div class="forecast-section-title">⚠ 리스크 레이더</div>
      ${risks.map(r => `
        <div class="risk-item risk-${r.level}">
          <span class="risk-badge">${r.level === 'high' ? 'HIGH' : r.level === 'mid' ? 'MID' : 'LOW'}</span>
          <div><b style="font-size:12px">${r.icon} ${r.title}</b><br>${r.desc}</div>
        </div>`).join('')}
    </div>
    <div class="forecast-section">
      <div class="forecast-section-title">✦ AI 리스크 심층 분석</div>
      <div class="forecast-insight" id="fc-risk-ai">
        <div style="font-size:11px;color:var(--text3);text-align:center;padding:8px">아래 버튼으로 AI 분석을 실행하세요</div>
      </div>
      <button class="forecast-run-btn" id="fc-risk-btn" onclick="runForecastAI('risk')">
        ✦ AI 리스크 분석 실행
      </button>
    </div>`;
  if (_forecastCache['risk']) {
    document.getElementById('fc-risk-ai').textContent = _forecastCache['risk'];
  }
}

// ── 시나리오 탭 ──
export function renderFtabScenario(body) {
  const fin = RAW.finance;
  const avg3rev = fin.총매출.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const avg3prof = fin.영업이익.slice(-3).reduce((a, b) => a + b, 0) / 3;
  body.innerHTML = `
    <div class="forecast-section">
      <div class="forecast-section-title">🎯 3개월 시나리오 분석</div>
      <div class="scenario-card" style="border-color:rgba(52,211,138,.3);background:rgba(52,211,138,.04)">
        <div class="scenario-label" style="color:var(--green)">🟢 낙관 시나리오 (25% 확률)</div>
        <div class="forecast-kpi-row" style="margin-bottom:8px">
          <div class="fkpi"><div class="fkpi-label">총매출</div><div class="fkpi-value" style="color:var(--green);font-size:14px">${(avg3rev * 1.15).toFixed(0)}억</div></div>
          <div class="fkpi"><div class="fkpi-label">영업이익</div><div class="fkpi-value" style="color:var(--green);font-size:14px">${(Math.max(avg3prof, 0) * 1.3 + 20).toFixed(0)}억</div></div>
          <div class="fkpi"><div class="fkpi-label">이익률</div><div class="fkpi-value" style="color:var(--green);font-size:14px">${((Math.max(avg3prof, 0) * 1.3 + 20) / (avg3rev * 1.15) * 100).toFixed(1)}%</div></div>
        </div>
        <div class="scenario-desc">마케팅 투자 효율화로 CAPA 반등, 디지털 채널 성장 가속. 무선 순증 플러스 전환 시 매출 상승 견인.</div>
      </div>
      <div class="scenario-card" style="border-color:rgba(245,200,66,.3);background:rgba(245,200,66,.04)">
        <div class="scenario-label" style="color:var(--gold)">🟡 기준 시나리오 (50% 확률)</div>
        <div class="forecast-kpi-row" style="margin-bottom:8px">
          <div class="fkpi"><div class="fkpi-label">총매출</div><div class="fkpi-value" style="color:var(--gold);font-size:14px">${(avg3rev * 1.0).toFixed(0)}억</div></div>
          <div class="fkpi"><div class="fkpi-label">영업이익</div><div class="fkpi-value" style="color:var(--gold);font-size:14px">${(avg3prof * 1.0 + 5).toFixed(0)}억</div></div>
          <div class="fkpi"><div class="fkpi-label">이익률</div><div class="fkpi-value" style="color:var(--gold);font-size:14px">${((avg3prof * 1.0 + 5) / (avg3rev * 1.0) * 100).toFixed(1)}%</div></div>
        </div>
        <div class="scenario-desc">현 추세 유지. 비용 구조 개선 소폭 진행. 무선 순증 마이너스 지속되나 감소폭 완화.</div>
      </div>
      <div class="scenario-card" style="border-color:rgba(255,94,106,.3);background:rgba(255,94,106,.04)">
        <div class="scenario-label" style="color:var(--red)">🔴 비관 시나리오 (25% 확률)</div>
        <div class="forecast-kpi-row" style="margin-bottom:8px">
          <div class="fkpi"><div class="fkpi-label">총매출</div><div class="fkpi-value" style="color:var(--red);font-size:14px">${(avg3rev * 0.88).toFixed(0)}억</div></div>
          <div class="fkpi"><div class="fkpi-label">영업이익</div><div class="fkpi-value" style="color:var(--red);font-size:14px">${(avg3prof - 25).toFixed(0)}억</div></div>
          <div class="fkpi"><div class="fkpi-label">이익률</div><div class="fkpi-value" style="color:var(--red);font-size:14px">${((avg3prof - 25) / (avg3rev * 0.88) * 100).toFixed(1)}%</div></div>
        </div>
        <div class="scenario-desc">경쟁 심화로 마케팅비 급증, 무선 해지 증가. 유선 가입자 이탈 가속 및 판관비 상승 압박 가중.</div>
      </div>
    </div>
    <div class="forecast-section">
      <div class="forecast-section-title">✦ AI 시나리오 심층 분석</div>
      <div class="forecast-insight" id="fc-scenario-ai">
        <div style="font-size:11px;color:var(--text3);text-align:center;padding:8px">아래 버튼으로 AI 분석을 실행하세요</div>
      </div>
      <button class="forecast-run-btn" id="fc-scenario-btn" onclick="runForecastAI('scenario')">
        ✦ AI 시나리오 분석 실행
      </button>
    </div>`;
  if (_forecastCache['scenario']) {
    document.getElementById('fc-scenario-ai').textContent = _forecastCache['scenario'];
  }
}

// ── AI 전망 분석 실행 ──
export async function runForecastAI(tab) {
  const bodyId = `fc-${tab}-ai`, btnId = `fc-${tab}-btn`;
  setAILoading(bodyId, btnId);
  const ctx = buildForecastContext();
  const prompts = {
    short: `아래 KT M&S 데이터를 기반으로 향후 1~3개월 단기 전망을 분석하세요:\n${ctx}\n\n포함 항목:\n1. 다음 달 총매출/영업이익 예측 및 근거\n2. 주목해야 할 변수 2~3가지\n3. 권고 액션 1~2가지\n(3문단 이내로 간결하게)`,
    mid: `아래 KT M&S 데이터를 기반으로 향후 6개월 중기 전망을 분석하세요:\n${ctx}\n\n포함 항목:\n1. 6개월 매출/이익 방향성 전망\n2. 채널별 성장/위축 예상\n3. 비용 구조 개선 포인트\n(3~4문단)`,
    risk: `아래 KT M&S 데이터를 기반으로 리스크 요인을 심층 분석하세요:\n${ctx}\n\n포함 항목:\n1. 가장 시급한 리스크 2가지와 대응 방안\n2. 선제적 관리가 필요한 선행 지표\n3. 기회 요인 1~2가지\n(3문단)`,
    scenario: `아래 KT M&S 데이터를 기반으로 시나리오별 전략적 시사점을 분석하세요:\n${ctx}\n\n포함 항목:\n1. 낙관/기준/비관 시나리오 각각의 핵심 가정\n2. 기준 시나리오 달성을 위한 최우선 과제\n3. 비관 시나리오 발생 시 즉각 조치 사항\n(3~4문단)`,
  };
  const sysPrompts = {
    short: '당신은 KT M&S의 단기 재무 전략 분석가입니다. 데이터 기반 예측과 실행 가능한 인사이트를 제공합니다.',
    mid: '당신은 KT M&S의 중기 경영전략 분석가입니다. 채널별 성과와 비용 구조를 종합적으로 분석합니다.',
    risk: '당신은 KT M&S의 리스크 관리 전문가입니다. 선제적 위험 식별과 대응 방안을 제시합니다.',
    scenario: '당신은 KT M&S의 경영 시나리오 플래닝 전문가입니다. 복수 시나리오의 전략적 의미를 도출합니다.',
  };
  try {
    const result = await callAI(prompts[tab], sysPrompts[tab]);
    _forecastCache[tab] = result;
    setAIResult(bodyId, btnId, result);
  } catch (e) {
    setAIError(bodyId, btnId, e.message);
  }
}
