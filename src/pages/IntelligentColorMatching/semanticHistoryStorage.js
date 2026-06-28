// AI 配色：设计规范历史持久化（uTools DB 优先，localStorage 降级）
import { formatSessionTime } from './chatHistoryStorage.js';

const SESSION_PREFIX = 'semantic-spec/';
const FALLBACK_KEY = 'semantic-spec-fallback';
const MAX_FALLBACK_ITEMS = 50;

export { formatSessionTime };

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

/** 去除 Vue 响应式代理，得到可持久化的纯对象 */
function clonePlainSpec(spec) {
  if (!spec) return null;
  try {
    return JSON.parse(JSON.stringify(spec));
  } catch {
    return null;
  }
}

function parseSpecFromDoc(doc) {
  if (doc?.specJson) {
    try {
      return JSON.parse(doc.specJson);
    } catch {
      return null;
    }
  }
  return clonePlainSpec(doc?.spec);
}

function docToSession(doc) {
  const id = String(doc._id || '').replace(SESSION_PREFIX, '');
  const spec = parseSpecFromDoc(doc);

  return {
    id,
    _id: doc._id,
    _rev: doc._rev,
    preview: doc.preview || spec?.name || '',
    createdAt: doc.createdAt || 0,
    moodKey: doc.moodKey || '',
    moodIsCustom: !!doc.moodIsCustom,
    customMoodText: doc.customMoodText || '',
    industryKey: doc.industryKey || '',
    industryIsCustom: !!doc.industryIsCustom,
    customIndustryText: doc.customIndustryText || '',
    keywords: doc.keywords || '',
    spec
  };
}

function createSessionRecord({
  moodKey,
  moodIsCustom,
  customMoodText,
  industryKey,
  industryIsCustom,
  customIndustryText,
  keywords,
  spec
}) {
  const plainSpec = clonePlainSpec(spec);
  const name = String(plainSpec?.name || '').trim();
  if (!name) return null;

  return {
    id: String(Date.now()),
    preview: name,
    createdAt: Date.now(),
    moodKey: moodKey || '',
    moodIsCustom: !!moodIsCustom,
    customMoodText: customMoodText || '',
    industryKey: industryKey || '',
    industryIsCustom: !!industryIsCustom,
    customIndustryText: customIndustryText || '',
    keywords: keywords || '',
    spec: plainSpec
  };
}

function saveToFallback(session) {
  const list = readFallbackSessions().filter((item) => item.id !== session.id);
  list.unshift(session);
  writeFallbackSessions(list.slice(0, MAX_FALLBACK_ITEMS));
}

function removeFromFallback(sessionId) {
  const list = readFallbackSessions().filter((item) => item.id !== String(sessionId));
  writeFallbackSessions(list);
}

export function notifySemanticHistoryChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('semantic-history-changed'));
  }
}

export function getAllSemanticHistorySessions() {
  const merged = new Map();

  readFallbackSessions().forEach((session) => {
    if (session?.spec?.name || session?.preview) {
      merged.set(String(session.id), session);
    }
  });

  if (hasUtoolsDb()) {
    window.utools.db
      .allDocs(SESSION_PREFIX)
      .forEach((doc) => {
        const session = docToSession(doc);
        if (session?.spec?.name) {
          merged.set(String(session.id), session);
        }
      });
  }

  return Array.from(merged.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/** 保存 AI 配色设计规范历史 */
export function saveSemanticHistorySession(params) {
  const session = createSessionRecord(params);
  if (!session) return null;

  // 始终写入 localStorage，确保复杂 spec 与 DB 写入失败时仍可读取
  saveToFallback(session);

  if (hasUtoolsDb()) {
    const doc = {
      _id: `${SESSION_PREFIX}${session.id}`,
      preview: session.preview,
      createdAt: session.createdAt,
      moodKey: session.moodKey,
      moodIsCustom: session.moodIsCustom,
      customMoodText: session.customMoodText,
      industryKey: session.industryKey,
      industryIsCustom: session.industryIsCustom,
      customIndustryText: session.customIndustryText,
      keywords: session.keywords,
      specJson: JSON.stringify(session.spec)
    };
    const result = window.utools.db.put(doc);
    if (result.ok) {
      session._id = doc._id;
      session._rev = result.rev;
    }
  }

  notifySemanticHistoryChanged();
  return session;
}

export function removeAllSemanticHistorySessions() {
  writeFallbackSessions([]);

  if (hasUtoolsDb()) {
    const docs = window.utools.db.allDocs(SESSION_PREFIX);
    docs.forEach((doc) => {
      window.utools.db.remove({ _id: doc._id, _rev: doc._rev });
    });
  }

  notifySemanticHistoryChanged();
  return true;
}

export function removeSemanticHistorySession(session) {
  if (!session?.id) return false;

  const sessionId = String(session.id);
  removeFromFallback(sessionId);

  if (hasUtoolsDb()) {
    let docId = session._id;
    let docRev = session._rev;

    if (!docId || !docRev) {
      const fetched = window.utools.db.get(`${SESSION_PREFIX}${sessionId}`);
      if (fetched) {
        docId = fetched._id;
        docRev = fetched._rev;
      }
    }

    if (docId && docRev) {
      window.utools.db.remove({ _id: docId, _rev: docRev });
    }
  }

  notifySemanticHistoryChanged();
  return true;
}
