// utils/chart.js — 차트 생성 헬퍼
import { S, C, COLORS, COLORS_A, COLORS_BAR } from './state.js';

export function mkC(id, cfg) {
  if (S.charts[id]) { try { S.charts[id].destroy(); } catch (e) { } delete S.charts[id]; }
  const el = document.getElementById(id);
  if (!el) return;

  cfg.options = cfg.options || {};
  cfg.options.animation = false;
  cfg.options.animations = false;
  cfg.options.transitions = {};
  cfg.options.responsive = false;
  cfg.options.maintainAspectRatio = false;
  if (cfg.options.scales) {
    Object.values(cfg.options.scales).forEach(s => { if (s) s.animation = false; });
  }

  const parent = el.parentElement;
  if (parent) {
    const isDonut = parent.classList.contains('cw-donut') || parent.classList.contains('donut-wrap');
    if (isDonut) {
      const dpr = window.devicePixelRatio || 1;
      el.width = 240 * dpr; el.height = 240 * dpr;
      el.style.width = '240px'; el.style.height = '240px';
      cfg.options.responsive = false;
      cfg.options.maintainAspectRatio = false;
    } else {
      const w = parent.clientWidth || 400;
      const h = el.dataset.h ? parseInt(el.dataset.h) : (parent.classList.contains('cw-tall') ? 300 : 240);
      el.width = w; el.height = h;
      el.style.width = w + 'px'; el.style.height = h + 'px';
    }
  }

  S.charts[id] = new Chart(el, cfg);
  return S.charts[id];
}

export function baseOpts(extra = {}) {
  const gridColor = 'rgba(228,231,240,0.8)';
  const tickColor = '#8b93b8';
  return {
    animation: false,
    animations: false,
    responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 16, color: tickColor, font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8 } },
      tooltip: { backgroundColor: '#fff', titleColor: '#1a1f36', bodyColor: '#4a5380', borderColor: '#e4e7f0', borderWidth: 1, padding: 10, boxShadow: '0 4px 20px rgba(0,0,0,.1)', cornerRadius: 10, displayColors: true }
    },
    scales: {
      x: { grid: { color: gridColor, drawTicks: false }, ticks: { maxRotation: 45, color: tickColor, font: { size: 10 } }, border: { display: false } },
      y: { grid: { color: gridColor, drawTicks: false }, ticks: { color: tickColor, font: { size: 10 } }, border: { display: false } }
    },
    ...extra
  };
}

export function makeDonut(canvasId, labels, data, colors, centerLabel = '', centerSub = '') {
  const el = document.getElementById(canvasId);
  if (!el) return;

  if (S.charts[canvasId]) { S.charts[canvasId].destroy(); delete S.charts[canvasId]; }

  el.width = 240; el.height = 240;
  el.style.width = '240px'; el.style.height = '240px';

  const centerPlugin = {
    id: 'centerText_' + canvasId,
    afterDraw(chart) {
      if (!centerLabel) return;
      const { ctx, chartArea: { top, bottom, left, right } } = chart;
      const cx = (left + right) / 2, cy = (top + bottom) / 2;
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 15px var(--font, sans-serif)';
      ctx.fillStyle = '#1a1f36';
      ctx.fillText(centerLabel, cx, centerSub ? cy - 9 : cy);
      if (centerSub) {
        ctx.font = '11px var(--font, sans-serif)';
        ctx.fillStyle = '#8b93b8';
        ctx.fillText(centerSub, cx, cy + 10);
      }
      ctx.restore();
    }
  };

  S.charts[canvasId] = new Chart(el, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#fff', borderWidth: 2, hoverOffset: 4 }] },
    options: {
      animation: false, animations: false,
      responsive: false, maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 8, padding: 10, color: '#4a5380', font: { size: 10 }, usePointStyle: true } },
        tooltip: {
          backgroundColor: '#fff', titleColor: '#1a1f36', bodyColor: '#4a5380', borderColor: '#e4e7f0', borderWidth: 1, cornerRadius: 10,
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? (ctx.raw / total * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${typeof ctx.raw === 'number' && ctx.raw > 100 ? Number(ctx.raw).toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : ctx.raw} (${pct}%)`;
            }
          }
        }
      }
    },
    plugins: [centerPlugin]
  });
}

export function addSparklines(gridId, dataMap) {
  requestAnimationFrame(() => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    Object.entries(dataMap).forEach(([key, arr]) => {
      const card = grid.querySelector(`[data-kpi-key="${key}"]`);
      if (!card || !arr || arr.length < 3) return;
      const wrap = document.createElement('div');
      wrap.className = 'sparkline-wrap';
      const cvs = document.createElement('canvas');
      cvs.height = 28; cvs.style.height = '28px';
      wrap.appendChild(cvs); card.appendChild(wrap);
      const valid = arr.filter(v => v != null);
      const minV = Math.min(...valid), maxV = Math.max(...valid);
      const last3 = arr.slice(-12).map(v => v ?? 0);
      const rising = last3[last3.length - 1] > last3[0];
      new Chart(cvs, {
        type: 'line',
        data: { labels: last3.map((_, i) => i), datasets: [{ data: last3, borderColor: rising ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: .4 }] },
        options: { animation: false, animations: false, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false, min: minV * 0.95, max: maxV * 1.05 } } }
      });
    });
  });
}

export function line(id, labels, datasets, extra = {}) {
  mkC(id, {
    type: 'line', data: {
      labels, datasets: datasets.map((d, i) => ({
        pointRadius: 3, pointHoverRadius: 5, tension: .4, borderWidth: 2.5,
        ...d,
        borderColor: d.color || COLORS[i],
        backgroundColor: d.fill ? (d.fillColor || COLORS_A[i]) : 'transparent',
        pointBackgroundColor: d.color || COLORS[i],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }))
    }, options: baseOpts(extra)
  });
}

export function bar(id, labels, datasets, stacked = false, extra = {}) {
  const sc = stacked ? {
    x: { stacked: true, grid: { color: 'rgba(228,231,240,.8)' }, ticks: { maxRotation: 45, color: '#8b93b8', font: { size: 10 } }, border: { display: false } },
    y: { stacked: true, grid: { color: 'rgba(228,231,240,.8)' }, ticks: { color: '#8b93b8', font: { size: 10 } }, border: { display: false } }
  } : undefined;
  mkC(id, {
    type: 'bar', data: {
      labels, datasets: datasets.map((d, i) => ({
        borderWidth: 0, borderRadius: 4, borderSkipped: false,
        ...d,
        backgroundColor: d.bg || COLORS_BAR[i % COLORS_BAR.length],
        borderColor: 'transparent',
        hoverBackgroundColor: COLORS[i % COLORS.length],
      }))
    }, options: baseOpts(sc ? { scales: sc } : { ...extra })
  });
}
