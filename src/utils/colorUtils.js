// 颜色值转换工具库
// 支持: HEX / RGB / RGBA / HSL / HSLA / CMYK / LAB / HSV / HSB 双向互转

// ============================================================
// 基础校验与清洗
// ============================================================

// 去除空格、多余符号，统一小写
export function cleanColorInput(input) {
  if (!input || typeof input !== 'string') return ''
  return input.trim().replace(/\s+/g, '').toLowerCase()
}

// 检查 RGB 单值是否在 0-255 范围
export function isValidRGBValue(v) {
  const n = Number(v)
  return !isNaN(n) && n >= 0 && n <= 255
}

// 检查 Alpha 是否在 0-1 范围
export function isValidAlpha(v) {
  const n = Number(v)
  return !isNaN(n) && n >= 0 && n <= 1
}

// ============================================================
// 格式自动识别
// ============================================================

export function detectColorFormat(input) {
  const raw = cleanColorInput(input)
  if (!raw) return null

  if (/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(raw)) return 'HEX'
  if (/^rgba?\(/.test(raw)) return raw.startsWith('rgba') ? 'RGBA' : 'RGB'
  if (/^hsla?\(/.test(raw)) return raw.startsWith('hsla') ? 'HSLA' : 'HSL'
  if (/^cmyk\(/.test(raw)) return 'CMYK'
  if (/^lab\(/.test(raw)) return 'LAB'
  if (/^hsv\(/.test(raw)) return 'HSV'
  if (/^hsb\(/.test(raw)) return 'HSB'

  return null
}

// ============================================================
// 解析输入字符串 -> { r, g, b, a }
// ============================================================

export function parseColor(input) {
  const raw = cleanColorInput(input)
  if (!raw) return null

  const fmt = detectColorFormat(raw)
  if (!fmt) return null

  try {
    switch (fmt) {
      case 'HEX':
        return parseHEX(raw)
      case 'RGB':
      case 'RGBA':
        return parseRGB(raw)
      case 'HSL':
      case 'HSLA':
        return parseHSL(raw)
      case 'CMYK':
        return parseCMYK(raw)
      case 'LAB':
        return parseLAB(raw)
      case 'HSV':
      case 'HSB':
        return parseHSV(raw)
      default:
        return null
    }
  } catch (e) {
    return null
  }
}

function parseHEX(hex) {
  let h = hex.replace('#', '')
  // 3位 -> 6位
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('')
  }
  // 4位 -> 8位(含alpha)
  if (h.length === 4) {
    h = h.split('').map(c => c + c).join('')
  }
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  let a = 1
  if (h.length === 8) {
    a = Math.round((parseInt(h.substring(6, 8), 16) / 255) * 100) / 100
  }
  if (!isValidRGBValue(r) || !isValidRGBValue(g) || !isValidRGBValue(b)) return null
  return { r, g, b, a }
}

function parseRGB(raw) {
  const m = raw.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(',').map(s => s.trim())
  if (parts.length < 3 || parts.length > 4) return null
  let [r, g, b, a] = parts
  // 支持百分比
  r = r.endsWith('%') ? Math.round(parseFloat(r) * 2.55) : parseInt(r)
  g = g.endsWith('%') ? Math.round(parseFloat(g) * 2.55) : parseInt(g)
  b = b.endsWith('%') ? Math.round(parseFloat(b) * 2.55) : parseInt(b)
  if (a === undefined) a = 1
  else a = a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a)
  if (!isValidRGBValue(r) || !isValidRGBValue(g) || !isValidRGBValue(b)) return null
  if (!isValidAlpha(a)) return null
  return { r, g, b, a }
}

function parseHSL(raw) {
  const m = raw.match(/hsla?\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(',').map(s => s.trim())
  if (parts.length < 3 || parts.length > 4) return null
  let [h, s, l, a] = parts
  h = parseFloat(h.replace('deg', ''))
  s = parseFloat(s) / 100
  l = parseFloat(l) / 100
  if (a === undefined) a = 1
  else a = a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a)
  if (isNaN(h) || isNaN(s) || isNaN(l)) return null
  if (h < 0 || h > 360 || s < 0 || s > 1 || l < 0 || l > 1) return null
  if (!isValidAlpha(a)) return null
  return hslToRgb({ h, s, l, a })
}

function parseCMYK(raw) {
  const match = raw.match(/cmyk\(([^)]+)\)/)
  if (!match) return null
  const parts = match[1].split(',').map(s => s.trim())
  if (parts.length !== 4) return null
  let [c, m, y, k] = parts
  c = parseFloat(c) / 100
  m = parseFloat(m) / 100
  y = parseFloat(y) / 100
  k = parseFloat(k) / 100
  if ([c, m, y, k].some(v => isNaN(v) || v < 0 || v > 1)) return null
  return cmykToRgb({ c, m, y, k, a: 1 })
}

function parseLAB(raw) {
  const m = raw.match(/lab\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(',').map(s => s.trim())
  if (parts.length !== 3) return null
  let [l, aStar, bStar] = parts
  l = parseFloat(l)
  aStar = parseFloat(aStar)
  bStar = parseFloat(bStar)
  if (isNaN(l) || isNaN(aStar) || isNaN(bStar)) return null
  if (l < 0 || l > 100) return null
  return labToRgb({ l, a: aStar, b: bStar, alpha: 1 })
}

function parseHSV(raw) {
  const m = raw.match(/hs[vb]\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(',').map(s => s.trim())
  if (parts.length !== 3) return null
  let [h, s, v] = parts
  h = parseFloat(h.replace('deg', ''))
  s = parseFloat(s) / 100
  v = parseFloat(v) / 100
  if (isNaN(h) || isNaN(s) || isNaN(v)) return null
  if (h < 0 || h > 360 || s < 0 || s > 1 || v < 0 || v > 1) return null
  return hsvToRgb({ h, s, v, a: 1 })
}

// ============================================================
// RGB <-> HSL
// ============================================================

export function rgbToHsl({ r, g, b, a = 1 }) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a
  }
}

export function hslToRgb({ h, s, l, a = 1 }) {
  h /= 360
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v, a }
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    a
  }
}

// ============================================================
// RGB <-> HSV (与 HSB 等价)
// ============================================================

export function rgbToHsv({ r, g, b, a = 1 }) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a
  }
}

export function hsvToRgb({ h, s, v, a = 1 }) {
  h /= 360
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  let r, g, b
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q; break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a
  }
}

// ============================================================
// RGB <-> CMYK
// ============================================================

export function rgbToCmyk({ r, g, b, a = 1 }) {
  r /= 255; g /= 255; b /= 255
  const k = 1 - Math.max(r, g, b)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100, a }
  const c = (1 - r - k) / (1 - k)
  const m = (1 - g - k) / (1 - k)
  const y = (1 - b - k) / (1 - k)
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
    a
  }
}

export function cmykToRgb({ c, m, y, k, a = 1 }) {
  const r = 255 * (1 - c) * (1 - k)
  const g = 255 * (1 - m) * (1 - k)
  const b = 255 * (1 - y) * (1 - k)
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a }
}

// ============================================================
// RGB <-> LAB (经 XYZ 中转)
// ============================================================

function rgbToXyz({ r, g, b }) {
  r /= 255; g /= 255; b /= 255
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92
  r *= 100; g *= 100; b *= 100
  return {
    x: r * 0.4124 + g * 0.3576 + b * 0.1805,
    y: r * 0.2126 + g * 0.7152 + b * 0.0722,
    z: r * 0.0193 + g * 0.1192 + b * 0.9505
  }
}

function xyzToLab({ x, y, z }) {
  // D65 参考白点
  const refX = 95.047, refY = 100.000, refZ = 108.883
  x /= refX; y /= refY; z /= refZ
  const f = (t) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116)
  const fx = f(x), fy = f(y), fz = f(z)
  return {
    l: Math.round(116 * fy - 16),
    a: Math.round(500 * (fx - fy)),
    b: Math.round(200 * (fy - fz))
  }
}

export function rgbToLab({ r, g, b, a = 1 }) {
  const xyz = rgbToXyz({ r, g, b })
  const lab = xyzToLab(xyz)
  return { ...lab, alpha: a }
}

function labToXyz({ l, a, b }) {
  const fy = (l + 16) / 116
  const fx = a / 500 + fy
  const fz = fy - b / 200
  const refX = 95.047, refY = 100.000, refZ = 108.883
  const invF = (t) => {
    const t3 = t * t * t
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787
  }
  return {
    x: refX * invF(fx),
    y: refY * invF(fy),
    z: refZ * invF(fz)
  }
}

function xyzToRgb({ x, y, z }) {
  x /= 100; y /= 100; z /= 100
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415
  let b = x * 0.0557 + y * -0.2040 + z * 1.0570
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(
    (v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v) * 255
  )))
  return { r: clamp(r), g: clamp(g), b: clamp(b) }
}

export function labToRgb({ l, a, b, alpha = 1 }) {
  const xyz = labToXyz({ l, a, b })
  const rgb = xyzToRgb(xyz)
  return { ...rgb, a: alpha }
}

// ============================================================
// RGB -> HEX
// ============================================================

export function rgbToHex({ r, g, b }, withAlpha = false, alpha = 1) {
  const toHex = (n) => {
    const h = n.toString(16)
    return h.length === 1 ? '0' + h : h
  }
  let hex = '#' + toHex(r) + toHex(g) + toHex(b)
  if (withAlpha && alpha < 1) {
    hex += toHex(Math.round(alpha * 255))
  }
  return hex.toUpperCase()
}

// ============================================================
// 格式化输出
// ============================================================

export function formatHEX(rgba, includeAlpha = false) {
  return rgbToHex(rgba, includeAlpha, rgba.a)
}

export function formatRGB(rgba) {
  return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
}

export function formatRGBA(rgba) {
  const a = Math.round(rgba.a * 100) / 100
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${a})`
}

export function formatHSL(rgba) {
  const hsl = rgbToHsl(rgba)
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
}

export function formatHSLA(rgba) {
  const hsl = rgbToHsl(rgba)
  const a = Math.round(rgba.a * 100) / 100
  return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`
}

export function formatCMYK(rgba) {
  const cmyk = rgbToCmyk(rgba)
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
}

export function formatLAB(rgba) {
  const lab = rgbToLab(rgba)
  return `lab(${lab.l}, ${lab.a}, ${lab.b})`
}

export function formatHSV(rgba) {
  const hsv = rgbToHsv(rgba)
  return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
}

export function formatHSB(rgba) {
  const hsv = rgbToHsv(rgba)
  return `hsb(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
}

// ============================================================
// 一次性获取全部格式
// ============================================================

export function getAllFormats(inputOrRgba) {
  let rgba
  if (typeof inputOrRgba === 'string') {
    rgba = parseColor(inputOrRgba)
  } else if (inputOrRgba && 'r' in inputOrRgba) {
    rgba = inputOrRgba
  }
  if (!rgba) return null

  const hasAlpha = rgba.a < 1
  return {
    hex: formatHEX(rgba, false),
    hex8: formatHEX(rgba, true, rgba.a),
    rgb: formatRGB(rgba),
    rgba: formatRGBA(rgba),
    hsl: formatHSL(rgba),
    hsla: formatHSLA(rgba),
    cmyk: formatCMYK(rgba),
    lab: formatLAB(rgba),
    hsv: formatHSV(rgba),
    hsb: formatHSB(rgba),
    _rgba: rgba,
    _hasAlpha: hasAlpha
  }
}

// ============================================================
// 辅助：判断颜色亮度（用于确定文字颜色）
// ============================================================

export function getContrastColor(rgba) {
  // 根据相对亮度计算
  const brightness = (rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

// ============================================================
// 复制到剪贴板（优先 uTools API，兜底 navigator API）
// ============================================================

export async function copyToClipboard(text) {
  try {
    if (window.utools && typeof window.utools.copyText === 'function') {
      window.utools.copyText(text)
      return true
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  } catch (e) {
    console.error('复制失败', e)
    return false
  }
}

// ============================================================
// Toast 提示
// ============================================================

export function showToast(vm, message, type = 'success') {
  if (window.__colorToast__) {
    window.__colorToast__(message, type)
    return
  }
  // Fallback: 在控制台输出
  console.log('[Toast]', message)
}

// ============================================================
// 便捷函数：支持独立参数 r,g,b(,a) 调用
// ============================================================

export function hexFromRGB(r, g, b) {
  return rgbToHex({ r, g, b }, false, 1)
}

export function rgbString(r, g, b, a = 1) {
  return a < 1
    ? `rgba(${r}, ${g}, ${b}, ${(Math.round(a * 100) / 100)})`
    : `rgb(${r}, ${g}, ${b})`
}

export function hslString(r, g, b, a = 1) {
  const hsl = rgbToHsl({ r, g, b, a })
  return a < 1
    ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${(Math.round(a * 100) / 100)})`
    : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
}

export function cmykString(r, g, b) {
  const cmyk = rgbToCmyk({ r, g, b, a: 1 })
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
}

export function hsvString(r, g, b) {
  const hsv = rgbToHsv({ r, g, b, a: 1 })
  return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
}

export function labString(r, g, b) {
  const lab = rgbToLab({ r, g, b, a: 1 })
  return `lab(${lab.l}, ${lab.a}, ${lab.b})`
}
