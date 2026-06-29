/** 多端布局断点（px） */
export const LAYOUT_BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
  large: 1440,
  xlarge: 1920
};

/**
 * 解析栅格列数（移动端 → 数据大屏）
 * @param {object} options
 */
export function resolveGridCols(options = {}) {
  const desktop = pickNum(options.colsDesktop, options.cols, 4);
  const tabletDefault = desktop <= 2 ? desktop : Math.min(2, desktop);
  const mobileDefault = desktop <= 2 ? desktop : 1;
  const xlargeDefault = desktop >= 4 ? Math.min(desktop + 1, 12) : desktop;

  return {
    mobile: pickNum(options.colsMobile, mobileDefault),
    tablet: pickNum(options.colsTablet, tabletDefault),
    desktop,
    large: pickNum(options.colsLarge, desktop),
    xlarge: pickNum(options.colsXlarge, xlargeDefault)
  };
}

/** 色卡条栅格：窄屏自动降列 */
export function resolveColorStripCols(cols) {
  if (cols <= 2) {
    return { mobile: cols, tablet: cols, desktop: cols, large: cols, xlarge: cols };
  }
  return {
    mobile: Math.min(3, cols),
    tablet: Math.min(5, cols),
    desktop: cols,
    large: cols,
    xlarge: Math.min(cols + 1, 12)
  };
}

function pickNum(...values) {
  for (const value of values) {
    if (typeof value === 'number' && value > 0) return value;
  }
  return values[values.length - 1];
}
