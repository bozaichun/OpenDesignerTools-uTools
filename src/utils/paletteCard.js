import { parseColor, formatRGB, showToast } from './colorUtils';

export function getPaletteColumnCount(total) {
  if (total <= 4) return 4;
  if (total <= 6) return 3;
  return 4;
}

export function getContrastTextColor(hex) {
  const h = (hex || '').replace('#', '');
  if (h.length !== 6) return '#111111';
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#111111' : '#ffffff';
}

export function buildPaletteColorItems(colors) {
  return colors.map((item) => {
    const hex = typeof item === 'string' ? item : item.hex;
    const rgbObj = parseColor(hex);
    return {
      hex,
      rgb: rgbObj ? formatRGB(rgbObj) : '',
      text: getContrastTextColor(hex)
    };
  });
}

export function downloadPaletteCard(colors, options = {}) {
  const {
    title = '色卡 Palette',
    subtitle = '',
    filenamePrefix = 'palette'
  } = options;

  if (!colors.length) {
    showToast(null, '没有可下载的色卡数据', 'error');
    return false;
  }

  try {
    const paletteColors = buildPaletteColorItems(colors);
    const cols = getPaletteColumnCount(paletteColors.length);
    const cardW = 240;
    const cardH = 260;
    const swatchH = 180;
    const padding = 32;
    const gap = 20;
    const titleH = 56;

    const rows = Math.ceil(paletteColors.length / cols);
    const canvas = document.createElement('canvas');
    const width = padding * 2 + cardW * cols + gap * (cols - 1);
    const height = padding * 2 + titleH + cardH * rows + gap * (rows - 1);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#111111';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(title, padding, padding);

    if (subtitle) {
      ctx.fillStyle = '#888888';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(subtitle, padding, padding + 34);
    }

    paletteColors.forEach((color, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = padding + col * (cardW + gap);
      const y = padding + titleH + row * (cardH + gap);

      ctx.fillStyle = '#f5f5f7';
      ctx.fillRect(x, y, cardW, cardH);

      ctx.fillStyle = color.hex;
      ctx.fillRect(x, y, cardW, swatchH);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + swatchH, cardW, cardH - swatchH);

      ctx.fillStyle = '#111111';
      ctx.font = 'bold 16px "SF Mono", Consolas, Monaco, monospace';
      ctx.fillText(color.hex, x + 16, y + swatchH + 18);

      ctx.fillStyle = '#555555';
      ctx.font = '12px "SF Mono", Consolas, Monaco, monospace';
      ctx.fillText(color.rgb, x + 16, y + swatchH + 44);
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filenamePrefix + '-' + Date.now() + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(null, '色卡已开始下载', 'success');
    return true;
  } catch (err) {
    console.error('下载色卡失败', err);
    showToast(null, '下载失败，请重试', 'error');
    return false;
  }
}
