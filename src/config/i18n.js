/* ============================================================
   国际化字典
   ============================================================ */
export const I18N_DICT = {
  'zh-CN': {
    basicKnowledge: '基础知识',
    colorConversion: '颜色转换',
    imageSampling: '图片取色',
    presetColors: '预置颜色',
    analysisResult: '分析结果',
    settings: '设置',
    theme: '系统主题',
    language: '语言',
    themeSystem: '系统',
    themeLight: '浅色',
    themeDark: '深色',
    langZhCN: '简体中文',
    langZhTW: '繁体中文',
    langEn: '英语',
    langJa: '日语',
    langKo: '韩语',
    langRu: '俄语',
    settingsSaved: '设置已自动保存'
  },
  'zh-TW': {
    basicKnowledge: '基礎知識',
    colorConversion: '顏色轉換',
    imageSampling: '圖片取色',
    presetColors: '預設顏色',
    analysisResult: '分析結果',
    settings: '設定',
    theme: '系統主題',
    language: '語言',
    themeSystem: '系統',
    themeLight: '淺色',
    themeDark: '深色',
    langZhCN: '簡體中文',
    langZhTW: '繁體中文',
    langEn: '英語',
    langJa: '日語',
    langKo: '韓語',
    langRu: '俄語',
    settingsSaved: '設定已自動保存'
  },
  en: {
    basicKnowledge: 'Basic Knowledge',
    colorConversion: 'Color Conversion',
    imageSampling: 'Image Sampling',
    presetColors: 'Preset Colors',
    analysisResult: 'Analysis Result',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    langZhCN: 'Simplified Chinese',
    langZhTW: 'Traditional Chinese',
    langEn: 'English',
    langJa: 'Japanese',
    langKo: 'Korean',
    langRu: 'Russian',
    settingsSaved: 'Settings are saved automatically'
  },
  ja: {
    basicKnowledge: '基礎知識',
    colorConversion: '色変換',
    imageSampling: '画像抽出',
    presetColors: 'プリセット',
    analysisResult: '分析結果',
    settings: '設定',
    theme: 'テーマ',
    language: '言語',
    themeSystem: 'システム',
    themeLight: 'ライト',
    themeDark: 'ダーク',
    langZhCN: '簡体字中国語',
    langZhTW: '繁体字中国語',
    langEn: '英語',
    langJa: '日本語',
    langKo: '韓国語',
    langRu: 'ロシア語',
    settingsSaved: '設定は自動的に保存されます'
  },
  ko: {
    basicKnowledge: '기초 지식',
    colorConversion: '색상 변환',
    imageSampling: '이미지 색상',
    presetColors: '프리셋 색상',
    analysisResult: '분석 결과',
    settings: '설정',
    theme: '테마',
    language: '언어',
    themeSystem: '시스템',
    themeLight: '라이트',
    themeDark: '다크',
    langZhCN: '간체 중국어',
    langZhTW: '번체 중국어',
    langEn: '영어',
    langJa: '일본어',
    langKo: '한국어',
    langRu: '러시아어',
    settingsSaved: '설정이 자동으로 저장됩니다'
  },
  ru: {
    basicKnowledge: 'Основы',
    colorConversion: 'Преобразование цвета',
    imageSampling: 'Пипетка с картинки',
    presetColors: 'Предустановленные цвета',
    analysisResult: 'Результат анализа',
    settings: 'Настройки',
    theme: 'Тема',
    language: 'Язык',
    themeSystem: 'Системная',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    langZhCN: 'Упрощённый китайский',
    langZhTW: 'Традиционный китайский',
    langEn: 'Английский',
    langJa: 'Японский',
    langKo: 'Корейский',
    langRu: 'Русский',
    settingsSaved: 'Настройки сохраняются автоматически'
  }
};

export const TAB_BY_ROUTE = {
  '/BasicKnowledge': 'BasicKnowledge',
  '/ColorConversion': 'ColorConversion',
  '/ImageColorSampling': 'ImageColorSampling',
  '/ImageColorSampling/detailPage': 'ImageColorSampling',
  '/PresetColors': 'PresetColors'
};

export function translate(language, key) {
  const dict = I18N_DICT[language] || I18N_DICT['zh-CN'];
  return dict[key] || I18N_DICT['zh-CN'][key] || key;
}
