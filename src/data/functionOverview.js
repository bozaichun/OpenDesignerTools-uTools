export const QUICK_START_STEPS = [
  {
    step: 1,
    title: '转换色值',
    desc: '输入 HEX / RGB 等格式，实时互转并复制结果',
    routeId: 'ColorConversion',
    icon: 'icon-Areality-ColorConversion'
  },
  {
    step: 2,
    title: '图片取色',
    desc: '上传图片，点击取色并查看完整色值分析',
    routeId: 'ImageColorSampling',
    icon: 'icon-Areality-Picture'
  },
  {
    step: 3,
    title: '收藏与管理',
    desc: '收藏常用颜色，一键添加到色板分组',
    routeId: 'MyCollection',
    icon: 'icon-Copyright'
  }
];

export const FEATURE_GROUPS = [
  {
    title: '学习与查阅',
    items: [
      {
        routeId: 'BasicKnowledge',
        icon: 'icon-Areality-Overview',
        label: '基础知识',
        desc: '色彩模型、色轮、对比度等科普图表，帮助理解颜色原理'
      },
      {
        routeId: 'PresetColors',
        icon: 'icon-Areality-Color',
        label: '预置颜色',
        desc: '按色系浏览常用颜色，支持搜索、复制与收藏'
      }
    ]
  },
  {
    title: '取色与转换',
    items: [
      {
        routeId: 'ColorConversion',
        icon: 'icon-Areality-ColorConversion',
        label: '颜色转换',
        desc: 'HEX、RGB、HSL、CMYK、HSV 等格式双向实时转换'
      },
      {
        routeId: 'ImageColorSampling',
        icon: 'icon-Areality-Picture',
        label: '图片取色',
        desc: '从图片中提取主色与细节色，生成完整色值报告'
      }
    ]
  },
  {
    title: '配色与管理',
    items: [
      {
        routeId: 'IntelligentColorMatching',
        icon: 'icon-Areality-ColorMatching',
        label: '智能配色',
        desc: '基于主色自动生成协调配色方案'
      },
      {
        routeId: 'AccessibilityCheck',
        icon: 'icon-Areality-ColorContrast',
        label: '色彩对比',
        desc: '检测前景/背景对比度，评估可读性与 WCAG 等级'
      },
      {
        routeId: 'PaletteManager',
        icon: 'icon-Areality-Palette',
        label: '色板管理',
        desc: '创建分组、管理品牌色，支持导入导出与代码生成'
      },
      {
        routeId: 'MyCollection',
        icon: 'icon-Copyright',
        label: '我的收藏',
        desc: '集中管理收藏色值，快速添加到色板或查看全格式'
      }
    ]
  },
  {
    title: '专业工具',
    items: [
      {
        routeId: 'PrintTools',
        icon: 'icon-Areality-PrintingTool',
        label: '印刷工具',
        desc: '专色、网点、纸张等专业印刷相关色值计算'
      },
      {
        routeId: 'ColorTools',
        icon: 'icon-Areality-ColorMixing',
        label: '调色工具',
        desc: '亮度/饱和度调节、混色模拟、渐变生成等实用功能'
      }
    ]
  }
];

export const USAGE_TIPS = [
  '在 uTools 中搜索「颜色转换」「取色」等关键词可快速唤起对应功能',
  '预置颜色与取色结果均支持 ★ 收藏，数据保存在本地并可云端同步',
  '色板管理支持 JSON 导入导出，方便团队共享品牌色'
];
