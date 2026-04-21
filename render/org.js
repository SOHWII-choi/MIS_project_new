// render/org.js — 조직별 실적 페이지 렌더
import { RAW } from '../data/raw.js';
import { S, C, COLORS, COLORS_A } from '../utils/state.js';
import { gd, sum, fmt } from '../utils/calc.js';
import { bar, line, makeDonut, addSparklines } from '../utils/chart.js';
import { kpi } from '../utils/kpi.js';

export function renderOrg() {
  const d = gd('org'), chs = ['소매', '도매', '디지털', 'B2B', '소상공인'];
  const tots = chs.map(c => sum(d[c] || [])), grand = sum(tots);
  const orgRanked = chs.map((c, i) => ({ c, i, v: tots[i] })).sort((a, b) => b.v - a.v);
  const orgRankMap = {}; orgRanked.forEach((x, r) => orgRankMap[x.c] = r + 1);

  document.getElementById('org-kpi').innerHTML = chs.map((c, i) => {
    const rank = orgRankMap[c];
    const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    return kpi(`${rankBadge}${c} CAPA`, fmt(tots[i]), '건', null, ['gold', 'teal', 'blue', 'purple', 'orange'][i], `비중 ${grand ? ((tots[i] / grand * 100).toFixed(1)) : 0}%`, `org:${c}`);
  }).join('');

  addSparklines('org-kpi', { 'org:소매': RAW.org.소매, 'org:도매': RAW.org.도매, 'org:디지털': RAW.org.디지털, 'org:B2B': RAW.org.B2B, 'org:소상공인': RAW.org.소상공인 });
  bar('ch-org-bar', d.months, chs.map((c, i) => ({ label: c, data: d[c] || [], color: COLORS[i], bg: COLORS_A[i] })), true);

  const orgColors = ['rgba(245,158,11,0.8)', 'rgba(6,182,212,0.8)', 'rgba(59,130,246,0.8)', 'rgba(139,92,246,0.8)', 'rgba(249,115,22,0.8)'];
  makeDonut('ch-org-pie', chs, tots, orgColors, fmt(grand), 'CAPA 합계');
  line('ch-org-trend', d.months, [{ label: '소매', data: d.소매 }, { label: '도매', data: d.도매, color: C.teal }, { label: '디지털', data: d.디지털, color: C.blue }]);
}
