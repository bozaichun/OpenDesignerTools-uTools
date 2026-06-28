// 智能配色问答：历史会话持久化（uTools DB 优先，localStorage 降级）
const SESSION_PREFIX = 'chat-session/';
const FALLBACK_KEY = 'chat-session-fallback';

function hasUtoolsDb() {
  return typeof window !== 'undefined' && window.utools && window.utools.db;
}

function readFallbackSessions() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeFallbackSessions(list) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(list));
  } catch {}
}

function docToSession(doc) {
  const id = doc._id.replace(SESSION_PREFIX, '');
  return {
    id,
    _id: doc._id,
    _rev: doc._rev,
    question: doc.question || '',
    reply: doc.reply || '',
    turns: Array.isArray(doc.turns) ? doc.turns : [],
    preview: doc.preview || doc.question || '',
    createdAt: doc.createdAt || 0
  };
}

export function notifyChatHistoryChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('chat-history-changed'));
  }
}

export function getAllChatSessions() {
  if (hasUtoolsDb()) {
    return window.utools.db
      .allDocs(SESSION_PREFIX)
      .filter((doc) => doc.question || doc.reply)
      .map(docToSession)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  return readFallbackSessions().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function saveChatSession({ question, reply, turns }) {
  const q = (question || '').trim();
  const normalizedTurns = Array.isArray(turns) && turns.length
    ? turns.map((turn) => ({
      id: turn.id,
      user: (turn.user || '').trim(),
      assistant: (turn.assistant || '').trim()
    }))
    : [{ user: q, assistant: (reply || '').trim() }];
  const lastReply = normalizedTurns[normalizedTurns.length - 1]?.assistant || (reply || '').trim();
  if (!q && !lastReply) return null;

  const id = String(Date.now());
  const doc = {
    _id: `${SESSION_PREFIX}${id}`,
    question: q || normalizedTurns[0]?.user || '',
    reply: lastReply,
    turns: normalizedTurns,
    preview: (q || normalizedTurns[0]?.user || '').slice(0, 48) || lastReply.slice(0, 48),
    createdAt: Date.now()
  };

  if (hasUtoolsDb()) {
    const result = window.utools.db.put(doc);
    if (result.ok) {
      notifyChatHistoryChanged();
      return docToSession({ ...doc, _rev: result.rev });
    }
    return null;
  }

  const list = readFallbackSessions();
  list.unshift(docToSession(doc));
  writeFallbackSessions(list.slice(0, 50));
  notifyChatHistoryChanged();
  return docToSession(doc);
}

export function removeAllChatSessions() {
  if (hasUtoolsDb()) {
    const docs = window.utools.db.allDocs(SESSION_PREFIX);
    let changed = false;
    docs.forEach((doc) => {
      if (!doc.question && !doc.reply) return;
      const result = window.utools.db.remove({ _id: doc._id, _rev: doc._rev });
      if (result.ok) changed = true;
    });
    if (changed) notifyChatHistoryChanged();
    return true;
  }
  writeFallbackSessions([]);
  notifyChatHistoryChanged();
  return true;
}

export function removeChatSession(session) {
  if (!session?.id) return false;

  const sessionId = String(session.id);

  if (hasUtoolsDb()) {
    let docId = session._id;
    let docRev = session._rev;

    if (!docId || !docRev) {
      const fetched = window.utools.db.get(`${SESSION_PREFIX}${sessionId}`);
      if (!fetched) return false;
      docId = fetched._id;
      docRev = fetched._rev;
    }

    // uTools DB 经 IPC 同步，必须传入可结构化克隆的纯对象
    const result = window.utools.db.remove({ _id: docId, _rev: docRev });
    if (result.ok) notifyChatHistoryChanged();
    return !!result.ok;
  }

  const list = readFallbackSessions().filter((s) => s.id !== sessionId);
  writeFallbackSessions(list);
  notifyChatHistoryChanged();
  return true;
}

export function formatSessionTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
