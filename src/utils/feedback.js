import { FEEDBACK_FORM_URL } from '../config/feedback.js';
import { showToast } from './colorUtils';
import { openInUBrowser } from './ubrowser.js';

/** 使用 uTools ubrowser 打开钉钉表单；非 uTools 环境降级为新窗口打开 */
export function openFeedbackForm() {
  const url = FEEDBACK_FORM_URL;
  if (!url) {
    showToast(null, '反馈入口暂未配置', 'warning');
    return;
  }

  openInUBrowser(url, { width: 960, height: 720 });
}
