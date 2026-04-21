// render/wireless.js — 무선 가입자 페이지 렌더
import { RAW } from '../data/raw.js';
import { S, C, COLORS, COLORS_A, COLORS_BAR } from '../utils/state.js';
import { gd, sum, last, prev, fmt, pct } from '../utils/calc.js';
import { mkC, baseOpts, bar, addSparklines } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function openWlMonthModal(idx) {
  const d = gd('wireless'), od = gd('org');
  const month = d.months[idx];
  const prevIdx = idx > 0 ? idx - 1 : 0;

  function diffBadge(cur, prv) {
    if (!prv) return '';
    const p = ((cur - prv) / Math.abs(prv) * 100).toFixed(1);
    const up = cur >= prv;
    return `<span style="font-size:10px;font-weight:700;color:${up ? 'var(--green)' : 'var(--red)'};">${up ? '▲' : '▼'}${Math.abs(p)}%</span>`;
  }
  function row(label, val, unit, cur, prv) {
    return `<tr>
      <td style="padding:9px 12px;font-size:12px;color:var(--text2);border-bottom:1px solid var(--border)">${label}</td>
      <td style="padding:9px 12px;font-size:13px;font-weight:700;font-family:var(--mono);text-align:right;border-bottom:1px solid var(--border)">${fmt(val)}<span style="font-size:10px;color:var(--text3);margin-left:3px">${unit}</span></td>
      <td style="padding:9px 12px;text-align:center;border-bottom:1px solid var(--border)">${diffBadge(cur, prv)}</td>
    </tr>`;
  }

  const chLabels = ['소매', '도매', '디지털', 'B2B', '소상공인'];
  const chRows = chLabels.map(ch => {
    const v = od[ch]?.[idx] ?? 0;
    const pv = od[ch]?.[prevIdx] ?? 0;
    return row(ch + ' CAPA', v, '건', v, pv);
  }).join('');

  const html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div>
        <div style="font-size:18px;font-weight:800;color:var(--text)">${month} 무선 가입자 현황</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">전월 대비 증감 포함 · 단위: 건</div>
      </div>
      <button onclick="document.getElementById('wl-month-modal').classList.remove('open')"
        style="background:var(--bg3);border:none;color:var(--text3);font-size:18px;cursor:pointer;border-radius:8px;width:32px;height:32px">✕</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      ${[
        ['유지 가입자', d.유지?.[idx], d.유지?.[prevIdx], '건', 'var(--blue)'],
        ['CAPA (신규+기변)', d.CAPA?.[idx], d.CAPA?.[prevIdx], '건', 'var(--gold)'],
        ['해지', d.해지?.[idx], d.해지?.[prevIdx], '건', 'var(--red)'],
        ['순증', d.순증?.[idx], d.순증?.[prevIdx], '건', d.순증?.[idx] >= 0 ? 'var(--green)' : 'var(--red)'],
      ].map(([label, cur, prv, unit, color]) => `
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px 16px">
          <div style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:.5px;margin-bottom:6px;text-transform:uppercase">${label}</div>
          <div style="font-size:22px;font-weight:800;font-family:var(--mono);color:${color}">${fmt(cur ?? 0)}<span style="font-size:11px;color:var(--text3);margin-left:4px">${unit}</span></div>
          <div style="font-size:10px;margin-top:4px">${diffBadge(cur ?? 0, prv ?? 0)} <span style="color:var(--text3)">전월 ${fmt(prv ?? 0)}건</span></div>
        </div>
      `).join('')}
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:8px">채널별 CAPA</div>
    <div style="background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:var(--bg3)">
            <th style="padding:8px 12px;font-size:10px;color:var(--text3);text-align:left;font-weight:700;letter-spacing:.5px">채널</th>
            <th style="padding:8px 12px;font-size:10px;color:var(--text3);text-align:right;font-weight:700">CAPA (건)</th>
            <th style="padding:8px 12px;font-size:10px;color:var(--text3);text-align:center;font-weight:700">전월비</th>
          </tr>
        </thead>
        <tbody>${chRows}</tbody>
      </table>
    </div>`;

  document.getElementById('wl-month-modal-body').innerHTML = html;
  document.getElementById('wl-month-modal').classList.add('open');
}

export function renderWireless() {
  const d = gd('wireless'), od = gd('org');
  document.getElementById('wl-kpi').innerHTML = [
    kpi('유지 가입자', fmt(last(d.유지)), '건', pct(last(d.유지), d.유지[0]), 'blue', '일반후불 전체', 'wl:유지'),
    kpi('CAPA (최근월)', fmt(last(d.CAPA)), '건', pct(last(d.CAPA), prev(d.CAPA)), 'gold', '신규+기변', 'wl:CAPA'),
    kpi('해지 (최근월)', fmt(last(d.해지)), '건', pct(last(d.해지), prev(d.해지)), 'red', '직권해지 포함', 'wl:해지'),
    kpi('순증 (최근월)', fmt(last(d.순증)), '건', null, last(d.순증) >= 0 ? 'green' : 'red', '유지 전월차', 'wl:순증'),
    kpi('기간 CAPA 합계', fmt(sum(d.CAPA)), '건', null, 'teal', `월평균 ${fmt(Math.round(sum(d.CAPA) / d.months.length))}건`),
    kpi('기간 해지 합계', fmt(sum(d.해지)), '건', null, 'orange', `월평균 ${fmt(Math.round(sum(d.해지) / d.months.length))}건`),
  ].join('');

  const onWlMonthClick = (evt, elements) => {
    if (!elements.length) return;
    const idx = elements[0].index;
    openWlMonthModal(idx);
  };

  const pointCfg = { pointRadius: 4, pointHoverRadius: 8, pointHitRadius: 24, pointBorderWidth: 2, pointBorderColor: '#fff' };

  mkC('ch-wl-main', {
    type: 'line', data: {
      labels: d.months, datasets: [
        { label: '유지', ...pointCfg, data: d.유지, borderColor: C.blue, backgroundColor: C.blueA, borderWidth: 2, tension: .3, fill: true, yAxisID: 'y' },
        { label: 'CAPA', ...pointCfg, data: d.CAPA, borderColor: C.gold, backgroundColor: 'transparent', borderWidth: 2, tension: .3, yAxisID: 'y2' },
        { label: '해지', ...pointCfg, data: d.해지, borderColor: C.red, backgroundColor: 'transparent', borderWidth: 1.5, tension: .3, yAxisID: 'y2' },
      ]
    },
    options: baseOpts({
      onClick: onWlMonthClick,
      onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; },
      scales: {
        x: { grid: { color: 'rgba(228,231,240,.6)' }, ticks: { maxRotation: 45, color: '#8b93b8', font: { size: 10 } }, border: { display: false } },
        y: { grid: { color: 'rgba(228,231,240,.6)' }, ticks: { color: '#8b93b8', font: { size: 10 } }, title: { display: true, text: '유지(건)', color: '#8b93b8', font: { size: 10 } }, border: { display: false } },
        y2: { position: 'right', grid: { display: false }, ticks: { color: '#8b93b8', font: { size: 10 } }, title: { display: true, text: 'CAPA/해지(건)', color: '#8b93b8', font: { size: 10 } }, border: { display: false } }
      }
    })
  });

  mkC('ch-wl-net', {
    type: 'bar', data: {
      labels: d.months, datasets: [{
        label: '순증', data: d.순증,
        backgroundColor: d.순증.map(v => v >= 0 ? 'rgba(16,185,129,0.75)' : 'rgba(239,68,68,0.75)'),
        borderColor: d.순증.map(v => v >= 0 ? C.green : C.red),
        borderWidth: 0, borderRadius: 4, borderSkipped: false,
      }]
    },
    options: baseOpts({
      onClick: onWlMonthClick,
      onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; },
      plugins: { legend: { display: false } }
    })
  });

  bar('ch-wl-ch', od.months, [
    { label: '소매', data: od.소매 },
    { label: '도매', data: od.도매, color: C.teal, bg: 'rgba(6,182,212,0.72)' },
    { label: '디지털', data: od.디지털, color: C.blue, bg: 'rgba(59,130,246,0.72)' },
    { label: 'B2B', data: od.B2B, color: C.purple, bg: 'rgba(139,92,246,0.72)' },
  ], true);

  addSparklines('wl-kpi', { 'wl:유지': RAW.wireless.유지, 'wl:CAPA': RAW.wireless.CAPA, 'wl:해지': RAW.wireless.해지, 'wl:순증': RAW.wireless.순증 });
}
