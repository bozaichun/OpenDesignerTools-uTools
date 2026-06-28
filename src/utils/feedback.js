import { FEEDBACK_FORM_URL } from '../config/feedback.js';
import { showToast } from './colorUtils';

/** 使用 uTools ubrowser 打开钉钉表单；非 uTools 环境降级为新窗口打开 */
export function openFeedbackForm() {
  const url = FEEDBACK_FORM_URL;
  if (!url) {
    showToast(null, '反馈入口暂未配置', 'warning');
    return;
  }

  if (window.utools?.ubrowser) {
    window.utools.ubrowser
      .goto(url)
      .run({ width: 960, height: 720, center: true });
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
