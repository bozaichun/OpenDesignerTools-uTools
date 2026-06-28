/**
 * 使用 uTools ubrowser 打开网页；非 uTools 环境降级为外部打开
 * @see https://www.u-tools.cn/docs/developer/utools-api/ubrowser.html
 */
export function openInUBrowser(url, options = {}) {
  if (!url) return false;

  const {
    width = 1200,
    height = 800,
    center = true
  } = options;

  if (window.utools?.ubrowser) {
    window.utools.ubrowser
      .goto(url)
      .run({ width, height, center });
    return true;
  }

  if (window.utools?.shellOpenExternal) {
    window.utools.shellOpenExternal(url);
    return true;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
