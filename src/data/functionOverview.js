// 功能概览页：与侧边栏导航对齐的快捷入口配置
import { NAV_MENU_ITEMS } from './navMenu.js';

const FEATURE_DESC_MAP = {
  BasicKnowledge: '色彩模型、色轮、对比度等基础知识与图表',
  ColorConversion: 'HEX、RGB、HSL、CMYK、HSV 等格式双向转换',
  ImageColorSampling: '从图片提取主色与细节色，查看完整色值分析',
  PresetColors: '按色系浏览常用颜色，支持搜索、复制与收藏',
  AccessibilityCheck: 'WCAG 对比度、色弱模拟、政企合规与文字叠色',
  IntelligentColorMatching: 'AI 问答与语义配色、单色延展等专业配色能力',
  PaletteManager: '个人 / 项目 / 品牌分组管理，查重合并与代码导出',
  PrintTools: '专色、网点、纸张等专业印刷色值计算',
  ColorTools: '亮度饱和度调节、混色模拟、渐变生成等调色工具',
  MyCollection: '集中管理收藏色值，快速添加到色板或查看全格式'
};

export const QUICK_START_STEPS = [
  {
    step: 1,
    title: '转换色值',
    desc: 'HEX / RGB / HSL / CMYK 等格式实时互转',
    routeId: 'ColorConversion',
    icon: 'icon-Areality-ColorConversion'
  },
  {
    step: 2,
    title: '图片取色',
    desc: '上传图片提取主色与细节色，生成色值报告',
    routeId: 'ImageColorSampling',
    icon: 'icon-Areality-Picture'
  },
  {
    step: 3,
    title: '智能配色',
    desc: 'AI 问答与语义配色，一键生成可落地方案',
    routeName: 'BozaiChat',
    icon: 'icon-Areality-ColorMatching'
  }
];

/** 侧边栏全部功能（不含功能概览自身） */
export const MAIN_FEATURES = NAV_MENU_ITEMS
  .filter((item) => item.id !== 'FunctionOverview')
  .map((item) => ({
    routeId: item.id,
    label: item.label,
    icon: item.icon,
    desc: FEATURE_DESC_MAP[item.id] || ''
  }));

export const ICM_MODE_FEATURES = [
  {
    routeName: 'BozaiChat',
    label: 'AI 问答',
    desc: '向波仔提问配色问题，多轮对话即时解答',
    icon: 'icon-Areality-AIMode',
    badge: '推荐'
  },
  {
    routeName: 'IcmSemantic',
    label: '语义 AI 配色',
    desc: '按情绪调性与行业场景生成完整配色规范',
    icon: 'icon-Areality-ColorMatching'
  },
  {
    routeName: 'IcmMonochrome',
    label: '单色延展',
    desc: '输入主色生成色阶、邻近色与互补色',
    icon: 'icon-Areality-ColorMixing'
  },
  {
    routeName: 'IcmScenario',
    label: '场景定向',
    desc: '适配海报、APP、PPT 等场景的深浅色方案',
    icon: 'icon-Areality-Picture'
  },
  {
    routeName: 'IcmUnique',
    label: '去同质化',
    desc: '规避行业俗配，输出差异化商业配色',
    icon: 'icon-Areality-ColorContrast'
  }
];

export const USAGE_TIPS = [
  '在 uTools 中搜索「颜色转换」「取色」等关键词可快速唤起对应功能',
  '预置颜色、取色结果与色板色值均支持收藏，数据保存在本地',
  '色板管理支持分组导出代码，方便接入设计规范与开发流程'
];
