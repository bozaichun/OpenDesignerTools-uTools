import { parseColor } from './colorUtils';

export const FAVORITE_DOC_PREFIX = 'color-favorites/';
const FALLBACK_KEY = 'color-favorites-fallback';

export function normalizeFavoriteHex(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return null;
  return (
    '#' +
    [rgb.r, rgb.g, rgb.b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function getFavoriteDocId(hex) {
  const normalized = normalizeFavoriteHex(hex);
  if (!normalized) return null;
  return FAVORITE_DOC_PREFIX + normalized.slice(1).toLowerCase();
}

function hasUtoolsDb() {
  return typeof window !== 'undefined' && window.utools && window.utools.db;
}

function readFallbackFavorites() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeFallbackFavorites(list) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(list));
  } catch (e) {}
}

function docToFavorite(doc) {
  return {
    _id: doc._id,
    _rev: doc._rev,
    hex: doc.hex,
    name: doc.name || doc.hex,
    favoritedAt: doc.favoritedAt || 0
  };
}

export function notifyFavoritesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('color-favorites-changed'));
  }
}

export function getAllFavorites() {
  if (hasUtoolsDb()) {
    const docs = window.utools.db.allDocs(FAVORITE_DOC_PREFIX);
    return docs
      .filter((doc) => doc.hex)
      .map(docToFavorite)
      .sort((a, b) => (b.favoritedAt || 0) - (a.favoritedAt || 0));
  }
  return readFallbackFavorites().sort(
    (a, b) => (b.favoritedAt || 0) - (a.favoritedAt || 0)
  );
}

export function isFavorite(hex) {
  const docId = getFavoriteDocId(hex);
  if (!docId) return false;

  if (hasUtoolsDb()) {
    return !!window.utools.db.get(docId);
  }

  const normalized = normalizeFavoriteHex(hex);
  return readFallbackFavorites().some((item) => item.hex === normalized);
}

export function addFavorite({ hex, name }) {
  const normalized = normalizeFavoriteHex(hex);
  if (!normalized) return { ok: false, message: '颜色格式无效' };

  const docId = getFavoriteDocId(normalized);
  const payload = {
    hex: normalized,
    name: (name || normalized).trim() || normalized,
    favoritedAt: Date.now()
  };

  if (hasUtoolsDb()) {
    const existing = window.utools.db.get(docId);
    const doc = existing
      ? { ...existing, ...payload }
      : { _id: docId, ...payload };
    const result = window.utools.db.put(doc);
    if (result.ok) {
      notifyFavoritesChanged();
      return { ok: true };
    }
    return { ok: false, message: result.message || '收藏失败' };
  }

  const list = readFallbackFavorites().filter((item) => item.hex !== normalized);
  list.unshift({ ...payload, _id: docId });
  writeFallbackFavorites(list);
  notifyFavoritesChanged();
  return { ok: true };
}

export function removeFavorite(hex) {
  const docId = getFavoriteDocId(hex);
  if (!docId) return { ok: false, message: '颜色格式无效' };

  if (hasUtoolsDb()) {
    const doc = window.utools.db.get(docId);
    if (!doc) return { ok: true };
    const result = window.utools.db.remove(doc);
    if (result.ok) {
      notifyFavoritesChanged();
      return { ok: true };
    }
    return { ok: false, message: result.message || '取消收藏失败' };
  }

  const normalized = normalizeFavoriteHex(hex);
  writeFallbackFavorites(
    readFallbackFavorites().filter((item) => item.hex !== normalized)
  );
  notifyFavoritesChanged();
  return { ok: true };
}

export function toggleFavorite({ hex, name }) {
  if (isFavorite(hex)) {
    return removeFavorite(hex);
  }
  return addFavorite({ hex, name });
}
