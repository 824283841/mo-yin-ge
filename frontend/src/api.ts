import { USE_MOCK } from './config';

// Simple API helper: if USE_MOCK is true, route requests to an in-browser mock implementation
export async function apiFetch(path: string, options: RequestInit = {}) {
  if (USE_MOCK) return mockFetch(path, options);

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }
  if (!res.ok) {
    const message = json && json.message ? json.message : (json && json.error) ? json.error : res.statusText;
    throw new Error(message || 'API error');
  }
  return json;
}

// --- Mock implementation ---

type User = { id: number; username: string; password: string; quota: number };

function loadUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem('moyin_mock_users') || 'null') || [];
  } catch { return []; }
}
function saveUsers(users: User[]) { localStorage.setItem('moyin_mock_users', JSON.stringify(users)); }

function loadTokens(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('moyin_mock_tokens') || 'null') || {}; } catch { return {}; }
}
function saveTokens(t: Record<string, number>) { localStorage.setItem('moyin_mock_tokens', JSON.stringify(t)); }

function loadCodes(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('moyin_mock_codes') || 'null') || { TEST1000: 1000 }; } catch { return { TEST1000: 1000 }; }
}
function saveCodes(c: Record<string, number>) { localStorage.setItem('moyin_mock_codes', JSON.stringify(c)); }

function nextUserId(users: User[]) { return users.reduce((m,u)=>Math.max(m,u.id),0) + 1; }

async function mockFetch(path: string, options: RequestInit = {}) {
  // simple router
  const bodyText = (options.body as string) || null;
  let body: any = null;
  try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = null; }

  // auth/register
  if (path === '/auth/register' && options.method === 'POST') {
    const { username, password } = body || {};
    if (!username || !password) throw new Error('missing username or password');
    const users = loadUsers();
    if (users.find(u=>u.username===username)) throw new Error('username exists');
    const id = nextUserId(users);
    const user: User = { id, username, password, quota: 5000 };
    users.push(user);
    saveUsers(users);
    return { id: user.id, username: user.username, quota: user.quota };
  }

  // auth/login
  if (path === '/auth/login' && options.method === 'POST') {
    const { username, password } = body || {};
    const users = loadUsers();
    const user = users.find(u=>u.username===username && u.password===password);
    if (!user) throw new Error('invalid credentials');
    const token = 'tok' + user.id + '_' + Math.random().toString(36).slice(2,8);
    const tokens = loadTokens();
    tokens[token] = user.id;
    saveTokens(tokens);
    return { access_token: token };
  }

  // auth via Authorization header
  function getAuthUserId(optionsInner: RequestInit) {
    const auth = (optionsInner.headers as Record<string,string> || {})['Authorization'] || '';
    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const tokens = loadTokens();
      return tokens[parts[1]] || null;
    }
    return null;
  }

  // user/me
  if (path === '/user/me' && (!options.method || options.method === 'GET')) {
    const uid = getAuthUserId(options);
    if (!uid) throw new Error('unauthenticated');
    const users = loadUsers();
    const u = users.find(x=>x.id===uid);
    if (!u) throw new Error('user not found');
    return { id: u.id, username: u.username, quota: u.quota };
  }

  // redeem
  if (path === '/redeem' && options.method === 'POST') {
    const uid = getAuthUserId(options);
    if (!uid) throw new Error('unauthenticated');
    const { code } = body || {};
    if (!code) throw new Error('missing code');
    const codes = loadCodes();
    if (!codes[code]) throw new Error('invalid code');
    const amount = codes[code];
    const users = loadUsers();
    const u = users.find(x=>x.id===uid);
    if (!u) throw new Error('user not found');
    u.quota = Number(u.quota) + Number(amount);
    saveUsers(users);
    delete codes[code];
    saveCodes(codes);
    return { amount };
  }

  // generate
  if (path === '/generate' && options.method === 'POST') {
    const uid = getAuthUserId(options);
    if (!uid) throw new Error('unauthenticated');
    const { style, input } = body || {};
    const users = loadUsers();
    const u = users.find(x=>x.id===uid);
    if (!u) throw new Error('user not found');
    // simulate generate
    const text = `【${style} 续写（模拟）】\n${input}\n（这是本地演示版）`;
    const usedChars = text.length;
    if (u.quota < usedChars) throw new Error('quota insufficient');
    u.quota = u.quota - usedChars;
    saveUsers(users);
    return { text, usedChars };
  }

  // fallback
  throw new Error(`No mock route for ${path}`);
}
