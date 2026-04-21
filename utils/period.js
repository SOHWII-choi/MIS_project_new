// utils/period.js — 기간 선택 바
import { S } from './state.js';
import { RAW } from '../data/raw.js';
import { getPL } from './calc.js';

export function buildPB(cid, fn) {
  const el = document.getElementById(cid); if (!el) return;
  const mons = RAW.finance.months;
  el.innerHTML = `<div class="period-bar">
    <label>빠른선택:</label>
    ${['23', '24', '25'].map(y => `<button class="pbtn ${getPL().startsWith(y) ? 'act' : ''}" onclick="selY('${y}','${cid}','${fn}')">${y}년</button>`).join('')}
    <button class="pbtn" onclick="selY('all','${cid}','${fn}')">전체</button>
    <span class="psep">|</span><label>시작:</label>
    <select class="period-select" id="${cid}-s" onchange="updP('${cid}','${fn}')">
      ${mons.map((m, i) => `<option value="${i}"${i === S.pi.s ? ' selected' : ''}>${m}</option>`).join('')}
    </select>
    <label>종료:</label>
    <select class="period-select" id="${cid}-e" onchange="updP('${cid}','${fn}')">
      ${mons.map((m, i) => `<option value="${i}"${i === S.pi.e ? ' selected' : ''}>${m}</option>`).join('')}
    </select>
    <span style="font-size:10px;color:var(--text3);margin-left:6px">📅 ${getPL()}</span>
  </div>`;
}

export function selY(y, cid, fn) {
  const m = RAW.finance.months;
  if (y === 'all') S.pi = { s: 0, e: m.length - 1 };
  else {
    const s = m.findIndex(x => x.startsWith(y + '.'));
    const e = m.reduce((a, x, i) => x.startsWith(y + '.') ? i : a, -1);
    if (s >= 0) S.pi = { s, e: e >= 0 ? e : m.length - 1 };
  }
  buildPB(cid, fn);
  window[fn]();
}

export function updP(cid, fn) {
  const s = parseInt(document.getElementById(cid + '-s').value);
  const e = parseInt(document.getElementById(cid + '-e').value);
  S.pi = { s: Math.min(s, e), e: Math.max(s, e) };
  buildPB(cid, fn);
  document.getElementById('topbar-period').textContent = getPL();
  window[fn]();
}
