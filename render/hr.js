// render/hr.js — 인력 현황 페이지 렌더
import { S, C, COLORS, COLORS_A } from '../utils/state.js';
import { gd, last, prev, fmt, pct, sum } from '../utils/calc.js';
import { bar, line, makeDonut } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderHR() {
  const d = gd('hr');

  const lastTotal = last(d.전사계) || 1;
  const monthlyQuit = last(d.퇴직계) || 0;
  const quitRate = (monthlyQuit / lastTotal * 100);
  const annualQuitEst = (sum(d.퇴직계) / d.전사계.reduce((s, v, i) => s + (v || 0), 0) * 12 * 100) || 0;

  document.getElementById('hr-kpi').innerHTML = [
    kpi('전사계 (최근월)', fmt(last(d.전사계)), '명', pct(last(d.전사계), d.전사계[0]), 'gold', '기간 시작 대비', 'hr:전사계'),
    kpi('영업직', fmt(last(d.영업직)), '명', pct(last(d.영업직), d.영업직[0]), 'blue', '', 'hr:영업직'),
    kpi('SC직', fmt(last(d.SC직)), '명', pct(last(d.SC직), d.SC직[0]), 'teal', '', 'hr:SC직'),
    kpi('일반직', fmt(last(d.일반직)), '명', null, 'purple', ''),
    kpi('소매채널', fmt(last(d.소매채널)), '명', pct(last(d.소매채널), d.소매채널[0]), 'green', ''),
    kpi('퇴직률 (연환산)', fmt(annualQuitEst, 1), '%', null, 'red', `월 퇴직 평균 ${fmt(sum(d.퇴직계) / d.months.length, 1)}명`),
  ].join('');

  line('ch-hr-main', d.months, [
    { label: '전사계', data: d.전사계, fill: true },
    { label: '영업직', data: d.영업직, color: C.blue },
    { label: 'SC직', data: d.SC직, color: C.teal },
    { label: '일반직', data: d.일반직, color: C.purple }
  ]);

  bar('ch-hr-ch', d.months, [{
    label: '월별 퇴직',
    data: d.퇴직계,
    color: C.red,
    bg: 'rgba(239,68,68,0.65)'
  }]);

  const yearMap = {};
  d.months.forEach((m, i) => {
    const y = m.match(/['\s]?(\d{2})\./)?.[1];
    if (y) yearMap[y] = i;
  });

  const years = Object.keys(yearMap).sort();
  const latestYear = years[years.length - 1];
  const latestIdx = yearMap[latestYear];

  const jobTypes = [
    { label: '영업직', key: '영업직', color: 'rgba(91,110,245,0.72)' },
    { label: 'SC직',   key: 'SC직',   color: 'rgba(6,182,212,0.72)' },
    { label: '일반직', key: '일반직', color: 'rgba(139,92,246,0.72)' },
  ];
  const vals = jobTypes.map(j => d[j.key]?.[latestIdx] || 0);
  const hrTotal = vals.reduce((s, v) => s + v, 0);
  makeDonut('ch-hr-donut', jobTypes.map(j => j.label), vals, jobTypes.map(j => j.color), fmt(hrTotal) + '명', latestYear + '년');

  const hqs = ['강북', '강남', '강서', '동부', '서부'];
  bar('ch-hr-hq', d.months, hqs.map((h, i) => ({ label: h + ' 본부', data: d[h + '본부'] || [], color: COLORS[i], bg: COLORS_A[i] })), true);
}
