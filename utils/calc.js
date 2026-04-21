// utils/calc.js — 계산 헬퍼
import { S } from './state.js';
import { RAW } from '../data/raw.js';

export const sl = (a, s, e) => a.slice(s, e + 1);
export const sum = a => a.reduce((t, v) => t + (v || 0), 0);
export const last = a => { const f = a.filter(x => x != null); return f.length ? f[f.length - 1] : 0; };
export const prev = a => { const f = a.filter(x => x != null); return f.length > 1 ? f[f.length - 2] : f[0] || 0; };
export const fmt = (v, d = 0) => Number(v).toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (a, b) => b ? ((a - b) / Math.abs(b) * 100) : 0;

export function gd(key) {
  const src = RAW[key], { s, e } = S.pi, o = { months: sl(src.months, s, e) };
  for (const k of Object.keys(src))
    if (k !== 'months' && !Array.isArray(src[k]) && typeof src[k] === 'object') {
      o[k] = {};
      for (const r of Object.keys(src[k])) o[k][r] = sl(src[k][r], s, e);
    } else if (k !== 'months') o[k] = sl(src[k], s, e);
  return o;
}

export function getPL() {
  const { s, e } = S.pi;
  return `${RAW.finance.months[s]} ~ ${RAW.finance.months[e]}`;
}

export function getYear(m) { return (m || '').match(/^'?(\d{2})\./)?.[1] || ''; }
export function getMon(m) { return (m || '').replace(/^'?\d+\./, ''); }

export function yoySum(arr, months) {
  if (!arr || !months || !arr.length) return null;
  const lastM = months[months.length - 1];
  const lastY = getYear(lastM);
  const lastMon = getMon(lastM);
  const prevLastIdx = months.reduce((found, m, i) => {
    if (getYear(m) === String(parseInt(lastY) - 1).padStart(2, '0') && getMon(m) === lastMon) return i;
    return found;
  }, -1);
  if (prevLastIdx < 0) return null;
  const curStartIdx = months.findIndex(m => getYear(m) === lastY);
  const prevStartIdx = months.findIndex(m => getYear(m) === String(parseInt(lastY) - 1).padStart(2, '0'));
  if (curStartIdx < 0 || prevStartIdx < 0) return null;
  const curLen = months.length - curStartIdx;
  const curSum = arr.slice(curStartIdx).reduce((s, v) => s + (v || 0), 0);
  const prevSum = arr.slice(prevStartIdx, prevStartIdx + curLen).reduce((s, v) => s + (v || 0), 0);
  return { cur: curSum, prev: prevSum, pct: prevSum ? (curSum - prevSum) / Math.abs(prevSum) * 100 : 0 };
}
