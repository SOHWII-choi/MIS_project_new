// utils/ai.js — Claude AI API 연동
import { AI_MODEL } from './state.js';
import { showToast } from './toast.js';

export function getApiKey() { try { return localStorage.getItem('kts_api_key') || ''; } catch (e) { return ''; } }
export function saveApiKeyLocal(k) { try { localStorage.setItem('kts_api_key', k); } catch (e) { } }
export function clearApiKey() { try { localStorage.removeItem('kts_api_key'); } catch (e) { } }

export function updateApiKeyBtn() {
  const btn = document.getElementById('apikey-btn');
  if (!btn) return;
  const k = getApiKey();
  if (k) {
    btn.classList.add('set');
    btn.innerHTML = '✓ API 연결됨';
    btn.title = 'AI API 키 설정됨 · 클릭하여 변경';
  } else {
    btn.classList.remove('set');
    btn.innerHTML = '🔑 API 키';
    btn.title = 'AI 분석을 위한 API 키 설정';
  }
}

export function openApiKey() {
  const k = getApiKey();
  document.getElementById('apikey-input').value = k ? 'sk-ant-••••••••••••••' : '';
  document.getElementById('apikey-input').type = 'password';
  document.getElementById('apikey-eye-btn').textContent = '👁';
  document.getElementById('apikey-status').textContent = k ? '✓ 저장된 키가 있습니다. 변경하려면 새 키를 입력하세요.' : '';
  document.getElementById('apikey-status').className = 'apikey-status ' + (k ? 'ok' : '');
  document.getElementById('apikey-modal').classList.add('open');
  setTimeout(() => document.getElementById('apikey-input').focus(), 80);
}

export function closeApiKey() {
  document.getElementById('apikey-modal').classList.remove('open');
}

export function toggleApiKeyVisible() {
  const inp = document.getElementById('apikey-input');
  const btn = document.getElementById('apikey-eye-btn');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

export function onApiKeyInput() {
  document.getElementById('apikey-status').textContent = '';
  document.getElementById('apikey-status').className = 'apikey-status';
}

export async function saveApiKey() {
  const raw = document.getElementById('apikey-input').value.trim();
  const statusEl = document.getElementById('apikey-status');
  const saveBtn = document.getElementById('apikey-save-btn');

  const key = (raw.startsWith('sk-ant-••') || raw === '') ? getApiKey() : raw;

  if (!key || !key.startsWith('sk-ant-')) {
    statusEl.textContent = '⚠ 올바른 키 형식이 아닙니다 (sk-ant-... 로 시작해야 합니다)';
    statusEl.className = 'apikey-status err';
    return;
  }

  statusEl.textContent = '⏳ 연결 확인 중...';
  statusEl.className = 'apikey-status testing';
  saveBtn.disabled = true;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: AI_MODEL, max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }]
      })
    });
    if (resp.status === 401) {
      statusEl.textContent = '❌ API 키가 유효하지 않습니다. 다시 확인해주세요.';
      statusEl.className = 'apikey-status err';
      saveBtn.disabled = false;
      return;
    }
    saveApiKeyLocal(key);
    statusEl.textContent = '✅ API 키 연결 성공! AI 분석 기능이 활성화되었습니다.';
    statusEl.className = 'apikey-status ok';
    updateApiKeyBtn();
    setTimeout(closeApiKey, 1400);
    showToast('✅ API 키 저장 완료 · AI 분석 사용 가능');
  } catch (e) {
    statusEl.textContent = '⚠ 네트워크 오류. 인터넷 연결을 확인하세요.';
    statusEl.className = 'apikey-status err';
  }
  saveBtn.disabled = false;
}

export async function callAI(prompt, systemPrompt) {
  const key = getApiKey();
  if (!key) {
    openApiKey();
    throw new Error('API 키를 먼저 설정해주세요 (우측 상단 🔑 버튼)');
  }
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1000,
      system: systemPrompt || '당신은 KT M&S의 경영성과 분석 전문가입니다. 데이터를 근거로 간결하고 통찰력 있는 분석을 제공합니다. 한국어로 답변하세요.',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `API 오류 (${resp.status})`);
  return data.content?.[0]?.text || '';
}

export function setAILoading(bodyId, btnId) {
  document.getElementById(bodyId).innerHTML = `
    <div class="ai-skeleton">
      <div class="ai-skel-line" style="width:90%"></div>
      <div class="ai-skel-line" style="width:75%"></div>
      <div class="ai-skel-line" style="width:85%"></div>
      <div class="ai-skel-line short"></div>
    </div>`;
  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = true; btn.textContent = '⏳ 분석 중...'; }
}

export function setAIResult(bodyId, btnId, text) {
  document.getElementById(bodyId).textContent = text;
  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = false; btn.textContent = '↺ 재분석'; }
}

export function setAIError(bodyId, btnId, msg) {
  document.getElementById(bodyId).innerHTML = `<span style="color:var(--red);font-size:12px">⚠ ${msg}</span>`;
  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = false; btn.textContent = '✦ 다시 시도'; }
}
