// utils/nav.js — 사이드바 네비게이션
import { S, MENUS } from './state.js';
import { getPL } from './calc.js';

export function buildSidebar(role) {
  const menus = MENUS[role];
  const sb = document.getElementById('sidebar');
  const bn = document.getElementById('bottom-nav');
  let html = '', sec = '';
  menus.forEach(m => {
    if (m.sec !== sec) { html += `<div class="sidebar-label">${m.sec}</div>`; sec = m.sec; }
    html += `<div class="nav-item" id="nav-${m.id}" onclick="nav('${m.id}')"><span class="ni">${m.icon}</span>${m.label}</div>`;
  });
  sb.innerHTML = html;
  const top5 = menus.slice(0, Math.min(5, menus.length));
  bn.innerHTML = top5.map(m => `<button class="bnav-item" id="bnav-${m.id}" onclick="nav('${m.id}')"><span class="bni">${m.icon}</span>${m.label.slice(0, 4)}</button>`).join('');
}

export function nav(id) {
  document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.bnav-item').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
  const ne = document.getElementById('nav-' + id);
  const bne = document.getElementById('bnav-' + id);
  const pe = document.getElementById('page-' + id);
  if (ne) ne.classList.add('active');
  if (bne) bne.classList.add('active');
  if (pe) pe.classList.add('active');
  S.page = id;
  if (window.RENDER_MAP && window.RENDER_MAP[id]) window.RENDER_MAP[id]();
  document.getElementById('topbar-period').textContent = getPL();
  if (isMobile()) closeSidebar();
}

export function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  const open = sb.classList.toggle('open');
  ov.classList.toggle('open', open);
}

export function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

export function showForecastBtn(role) {
  const btn = document.getElementById('forecast-btn');
  const kbtn = document.getElementById('apikey-btn');
  if (btn) btn.style.display = role === 'executive' ? '' : 'none';
  if (kbtn) {
    const user = S.user;
    const isAdmin = role === 'admin' && user && user.id === 'admin';
    kbtn.style.display = isAdmin ? '' : 'none';
    if (isAdmin) window.updateApiKeyBtn && window.updateApiKeyBtn();
  }
}

export function isMobile() { return window.innerWidth <= 640; }
