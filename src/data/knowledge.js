// 色彩知识库数据
// 包含：色光三原色原理、标准色环、各格式适用场景、设计规范
// 每个条目都附带 ECharts 图表配置（chart）

export const KNOWLEDGE_DATA = [
  {
    id: 'rgb-principle',
    title: '色光三原色原理',
    summary: 'RGB 是屏幕显示的色彩基础，通过红、绿、蓝三种色光的叠加呈现所有可见颜色。',
    sections: [
      {
        title: '什么是 RGB',
        content: 'RGB (Red / Green / Blue) 是色光加色模式。每种色光取值范围 0-255，共 256 级亮度。三种色光叠加后可产生约 1677 万种颜色 (256³)，是电脑屏幕、手机屏、电视等自发光设备的色彩基础。'
      },
      {
        title: '混色规则',
        content: '加色模式：色光叠加亮度递增。\n· 红 (255,0,0) + 绿 (0,255,0) = 黄 (255,255,0)\n· 绿 (0,255,0) + 蓝 (0,0,255) = 青 (0,255,255)\n· 红 (255,0,0) + 蓝 (0,0,255) = 品红 (255,0,255)\n· 三色全满 = 白色；三色全零 = 黑色'
      },
      {
        title: '适用场景',
        content: '· 网页 / App UI 设计\n· 屏幕显示的图像\n· 数字摄影与视频\n· 任何需要在屏幕上呈现的视觉内容\n\n当设计稿需要印刷时，应转换为 CMYK 模式以检查色彩偏移。'
      }
    ],
    colorDemo: [
      { name: '红 Red', hex: '#FF0000' },
      { name: '绿 Green', hex: '#00FF00' },
      { name: '蓝 Blue', hex: '#0000FF' },
      { name: '黄 Yellow', hex: '#FFFF00' },
      { name: '青 Cyan', hex: '#00FFFF' },
      { name: '品红 Magenta', hex: '#FF00FF' }
    ],
    chart: {
      type: 'rgb-bar',
      title: '六种关键颜色的 RGB 通道值对比',
      data: [
        { name: '红 Red', r: 255, g: 0, b: 0, hex: '#FF0000' },
        { name: '绿 Green', r: 0, g: 255, b: 0, hex: '#00FF00' },
        { name: '蓝 Blue', r: 0, g: 0, b: 255, hex: '#0000FF' },
        { name: '黄 Yellow', r: 255, g: 255, b: 0, hex: '#FFFF00' },
        { name: '青 Cyan', r: 0, g: 255, b: 255, hex: '#00FFFF' },
        { name: '品红 Magenta', r: 255, g: 0, b: 255, hex: '#FF00FF' }
      ]
    }
  },
  {
    id: 'color-wheel',
    title: '标准 12 色相环',
    summary: '基于色轮的配色方案：互补色、邻近色、三角色，是设计配色的经典参考。',
    sections: [
      {
        title: '12 色相示意',
        content: '以红 (0°) 为起点，每 30° 一个色相：\n红 (0°) - 橙红 (30°) - 橙 (60°) - 橙黄 (90°) - 黄 (120°) - 黄绿 (150°) - 绿 (180°) - 青绿 (210°) - 青 (240°) - 青蓝 (270°) - 蓝 (300°) - 蓝紫 (330°)'
      },
      {
        title: '互补色 (Complementary)',
        content: '色相环上相差 180° 的颜色组合。如红 - 青、蓝 - 黄、绿 - 品红。特点：对比强烈、视觉冲击力大，适合需要突出重点的场景，但大面积使用容易产生视觉疲劳。'
      },
      {
        title: '邻近色 (Analogous)',
        content: '色相环上相邻的 3-5 个颜色组合。如红 - 橙红 - 橙。特点：和谐统一、自然柔和，适合做整体背景和渐变过渡。是最容易被视觉接受的配色方案。'
      },
      {
        title: '三角色 (Triadic)',
        content: '在色轮上均匀分布的三个颜色 (相差 120°)。如红 - 黄 - 蓝。特点：色彩丰富、平衡鲜明，比互补色更柔和，比邻近色更活泼，是 Logo 设计和品牌色的常见选择。'
      },
      {
        title: '分裂互补色 (Split Complementary)',
        content: '选择一个基础色，然后使用它的互补色两侧相邻的颜色。如红搭配青绿和青蓝。特点：比纯互补色更柔和，但仍保留较强的对比张力。'
      }
    ],
    colorWheel: [
      { h: 0, label: '红' },
      { h: 30, label: '橙红' },
      { h: 60, label: '橙' },
      { h: 90, label: '橙黄' },
      { h: 120, label: '黄' },
      { h: 150, label: '黄绿' },
      { h: 180, label: '绿' },
      { h: 210, label: '青绿' },
      { h: 240, label: '青' },
      { h: 270, label: '青蓝' },
      { h: 300, label: '蓝' },
      { h: 330, label: '蓝紫' }
    ],
    chart: {
      type: 'color-wheel',
      title: '标准 12 色相环（极坐标）',
      data: [
        { h: 0, label: '红', value: 85 },
        { h: 30, label: '橙红', value: 78 },
        { h: 60, label: '橙', value: 72 },
        { h: 90, label: '橙黄', value: 68 },
        { h: 120, label: '黄', value: 65 },
        { h: 150, label: '黄绿', value: 62 },
        { h: 180, label: '绿', value: 68 },
        { h: 210, label: '青绿', value: 72 },
        { h: 240, label: '青', value: 80 },
        { h: 270, label: '青蓝', value: 82 },
        { h: 300, label: '蓝', value: 85 },
        { h: 330, label: '蓝紫', value: 80 }
      ]
    }
  },
  {
    id: 'format-guide',
    title: '各颜色格式适用场景',
    summary: 'HEX / RGB / HSL / CMYK / LAB / HSV 各有适用场景，选择正确的格式可提高开发与设计效率。',
    sections: [
      {
        title: 'HEX (十六进制)',
        content: '· 格式：#RRGGBB 或 #RRGGBBAA\n· 适用：网页 CSS、Web 开发、简洁的色值标注\n· 特点：书写简洁、易于复制粘贴、是 Web 最常用格式\n· 建议：日常 UI 设计稿输出首选 HEX'
      },
      {
        title: 'RGB / RGBA',
        content: '· 格式：rgb(r,g,b) 或 rgba(r,g,b,a)\n· 适用：需要透明度的场景、CSS 渐变、动态计算颜色\n· 特点：直观、可精确控制透明度\n· 建议：阴影、半透明遮罩、动态颜色计算使用 RGBA'
      },
      {
        title: 'HSL / HSLA',
        content: '· 格式：hsl(h,s%,l%) 或 hsla(h,s%,l%,a)\n· 适用：设计稿中需要描述色彩感觉、做系统性色阶\n· 特点：Hue(色相)、Saturation(饱和度)、Lightness(亮度)，更符合人眼对颜色的感知逻辑\n· 建议：需要基于一个主色生成亮/暗/淡版本时，HSL 最方便'
      },
      {
        title: 'CMYK',
        content: '· 格式：cmyk(c%,m%,y%,k%)\n· 适用：印刷出版、海报、书籍、包装设计\n· 特点：青 (Cyan)、品红 (Magenta)、黄 (Yellow)、黑 (Key) 的减色模式\n· 注意：CMYK 色域小于 RGB，部分屏幕鲜艳色 (如正红) 印刷后会显得暗淡'
      },
      {
        title: 'LAB',
        content: '· 格式：lab(L,a,b)\n· 适用：专业图像处理、跨设备色彩匹配、色彩科学研究\n· 特点：L(亮度 0-100)、a(绿-红轴)、b(蓝-黄轴)，与人眼感知一致，是"设备无关"的颜色模型\n· 建议：需要保证不同屏幕/打印机颜色一致时使用 LAB 作为中间格式'
      },
      {
        title: 'HSV / HSB',
        content: '· 格式：hsv(h,s%,v%)\n· 适用：图形软件中的取色器 (Photoshop 的取色器基于 HSB)\n· 特点：与 HSL 类似，区别在于第三维度是 Value/Brightness (明度) 而非 Lightness\n· 建议：设计师常用，开发者一般用 HSL 代替'
      }
    ],
    chart: {
      type: 'format-radar',
      title: '六种颜色格式在六个维度的表现对比（越高越好）',
      indicator: [
        { name: '书写简洁', max: 100 },
        { name: '可读性', max: 100 },
        { name: '透明度支持', max: 100 },
        { name: '印刷支持', max: 100 },
        { name: '心理感知', max: 100 },
        { name: '开发友好', max: 100 }
      ],
      data: [
        { name: 'HEX', value: [95, 70, 30, 30, 40, 95], color: '#1677FF' },
        { name: 'RGB', value: [75, 80, 90, 40, 50, 90], color: '#EF4444' },
        { name: 'HSL', value: [70, 85, 85, 35, 95, 80], color: '#10B981' },
        { name: 'CMYK', value: [40, 55, 20, 100, 60, 40], color: '#F59E0B' },
        { name: 'LAB', value: [30, 50, 25, 85, 95, 30], color: '#8B5CF6' },
        { name: 'HSV', value: [65, 75, 25, 55, 90, 55], color: '#06B6D4' }
      ]
    }
  },
  {
    id: 'design-tips',
    title: '常用设计规范与避坑',
    summary: '网页安全色、透明度使用标准、印刷色彩注意事项，以及实际开发中的常见问题。',
    sections: [
      {
        title: '网页安全色 (Web Safe Colors)',
        content: '早期显示器只支持 256 色，因此定义了 216 色"安全色"在所有设备上显示一致。现代显示器已无需严格遵守，但安全色仍是一组分布均匀的参考色值。核心规则：RGB 各通道取值仅为 00、33、66、99、CC、FF (十六进制)。'
      },
      {
        title: '透明度使用标准',
        content: '· 透明度语义：alpha=1 完全不透明，alpha=0 完全透明\n· 推荐使用偶数百分位：如 80%、60%、40%、20%、10%，便于维护\n· 遮罩层：推荐使用黑 0.5 (rgba(0,0,0,0.5)) 至黑 0.7\n· 分割线：推荐使用黑 0.08 或白 0.12 营造浮层效果\n· 注意：叠加多层透明度时注意最终效果是否足够清晰可读'
      },
      {
        title: '文字与背景对比度',
        content: 'WCAG 2.1 AA 级标准：\n· 正文文字 (≥16px) 与背景对比度 ≥ 4.5:1\n· 大字号 (≥24px 粗体) 与背景对比度 ≥ 3:1\n· 快速判断：若在黑白屏幕上仍能清晰阅读，对比度通常合格\n· 工具：可使用在线 contrast-ratio 检查色值对比度'
      },
      {
        title: '印刷色彩避坑',
        content: '1. RGB 转 CMYK 时，鲜艳的红/蓝/紫往往会"变暗"，需提前用 CMYK 预览\n2. 纯黑文字：印刷推荐使用 K=100 的单色黑 (0,0,0,100)，而非四色黑 (C=M=Y=K=100)，避免套色不准\n3. 出血位：印刷稿四周预留 3mm 出血\n4. 分辨率：至少 300 DPI (屏幕仅需 72 DPI)\n5. 文件格式：印刷用 TIFF/PDF，不要用 JPG (有损压缩)'
      },
      {
        title: 'UI 主题色推荐',
        content: '好的主题色应具备：\n· 与白底对比度 ≥4.5:1 (可作为文字色)\n· 与黑底对比度 ≥3:1 (深色模式可用)\n· 作为按钮背景上叠加白色文字可读\n· 饱和度适中，避免视觉疲劳\n\n推荐参考：\n· 蓝 #1677FF (Ant Design) / #2563EB (Tailwind)\n· 绿 #10B981 / 青 #06B6D4\n· 紫 #8B5CF6 / 靛 #6366F1'
      },
      {
        title: '色彩心理学简要参考',
        content: '· 红色：热情、危险、警示、促销、中国文化中的喜庆\n· 蓝色：科技、信任、专业 (金融/科技公司偏爱)\n· 绿色：自然、环保、健康、"通过/确认"\n· 黄色：活力、警告、注意、年轻\n· 紫色：高端、神秘、创意\n· 橙色：活泼、优惠、行动号召\n· 黑白灰：经典、中性、可作为背景或文字色'
      }
    ],
    chart: {
      type: 'design-standard',
      title: '推荐 UI 主题色与 WCAG 对比度（与白底对比）',
      data: [
        { name: '#1677FF (Ant Design 蓝)', value: 8.59, color: '#1677FF' },
        { name: '#2563EB (Tailwind 蓝)', value: 8.21, color: '#2563EB' },
        { name: '#10B981 (翠绿)', value: 3.94, color: '#10B981' },
        { name: '#06B6D4 (青色)', value: 3.32, color: '#06B6D4' },
        { name: '#8B5CF6 (紫色)', value: 7.23, color: '#8B5CF6' },
        { name: '#6366F1 (靛蓝)', value: 7.82, color: '#6366F1' },
        { name: '#F59E0B (琥珀)', value: 2.53, color: '#F59E0B' },
        { name: '#EF4444 (正红)', value: 4.82, color: '#EF4444' }
      ],
      thresholds: [
        { name: 'AA 级正文 (4.5:1)', value: 4.5, color: '#10B981' },
        { name: 'AA 级大字号 (3:1)', value: 3, color: '#F59E0B' },
        { name: 'AAA 级正文 (7:1)', value: 7, color: '#EF4444' }
      ]
    }
  },
  {
    id: 'print-cmyk',
    title: '印刷工艺：CMYK 与专色',
    summary: '印刷色彩的核心知识：CMYK 减色原理、专色与四色区别、油墨叠印与网点。',
    sections: [
      {
        title: 'CMYK 减色模式原理',
        content: 'CMYK 是印刷行业的标准色彩模式，基于减色法原理：\n· C (Cyan 青色)：吸收红光，反射蓝绿光\n· M (Magenta 品红)：吸收绿光，反射红蓝\n· Y (Yellow 黄色)：吸收蓝光，反射红绿光\n· K (Key / Black 黑色)：吸收全色光\n理论上 C+M+Y 应产生黑色，但实际油墨不纯，因此加入 K (黑色) 以获得纯黑并减少油墨消耗。'
      },
      {
        title: '专色 (Spot Color) 与四色',
        content: '· 四色印刷 (CMYK)：用四种油墨叠印模拟全色，适合照片等连续色调图像\n· 专色印刷：使用预调油墨 (如潘通 Pantone 色)，一色一版\n· 专色优势：颜色更准确、可印出 CMYK 色域外颜色、适合大面积纯色\n· 适用场景：品牌 Logo、标准色卡、特殊金属色、荧光色\n· 成本对比：专色每增加一色需要额外印版，成本高于四色'
      },
      {
        title: '潘通 Pantone 配色系统',
        content: 'Pantone Matching System (PMS) 是全球通用的专色配色标准：\n· Pantone Solid Coated：铜版纸光面专色 (最常用)\n· Pantone Solid Uncoated：胶版纸哑光专色\n· Pantone CMYK：可转换为四色的近似色\n· 特点：每个色号有唯一配方，印刷厂可按配方精确调配\n· 建议：品牌 VI 应指定一个 Pantone 专色号作为标准主色，再转换为 CMYK/RGB/HEX 用于不同输出场景'
      },
      {
        title: '叠印与套印',
        content: '· 叠印 (Overprint)：两种颜色叠印在一起不镂空，产生第三种颜色\n· 套印：颜色之间精确对齐 (Registration)\n· 常见问题：四色黑文字若未做叠印，印刷套色不准时会出现彩色边\n· 建议：小于 12pt 的文字尽量使用单色黑 (K=100)，避免使用彩色黑\n· 出血位：3mm 四周留白，防止裁切时出现白边'
      },
      {
        title: '网点与网点百分比',
        content: '印刷实际上是由一个个小圆点 (网点) 组成的：\n· 网点百分比 (0-100%)：表示该颜色的油墨覆盖比例\n· 视觉上：网点越大颜色越深，网点越小颜色越浅\n· 常见网点线数 (LPI)：杂志 150-175 lpi、报纸 85-120 lpi、精美印刷 200+ lpi\n· 玫瑰斑 (Moiré)：多色印刷网点角度不一致时产生的干涉条纹\n· 标准网点角度：C 15°、M 75°、Y 0°、K 45°'
      },
      {
        title: 'ICC 色彩管理与色域',
        content: '· ICC Profile：设备的色彩特性描述文件\n· 色域 (Gamut)：设备可显示/印刷的颜色范围\n· 色域大小关系：Lab > RGB > CMYK (屏幕色比印刷色更鲜艳)\n· 色域警告：Photoshop 中超出 CMYK 范围的颜色会显示灰色感叹号\n· 色彩管理流程：拍摄/设计时使用 Adobe RGB，输出印刷时转换为 CMYK\n· 软打样 (Soft Proofing)：在屏幕上模拟印刷效果，提前发现色彩问题'
      }
    ],
    chart: {
      type: 'rgb-bar',
      title: 'CMYK 四色油墨对应的 RGB 近似值',
      data: [
        { name: 'C 青', r: 0, g: 180, b: 220, hex: '#00B4DC' },
        { name: 'M 品红', r: 225, g: 0, b: 152, hex: '#E10098' },
        { name: 'Y 黄', r: 255, g: 232, b: 0, hex: '#FFE800' },
        { name: 'K 黑', r: 25, g: 25, b: 25, hex: '#191919' },
        { name: 'C+M', r: 100, g: 60, b: 170, hex: '#643CAA' },
        { name: 'C+M+Y', r: 45, g: 42, b: 40, hex: '#2D2A28' }
      ]
    }
  },
  {
    id: 'brand-standard',
    title: '品牌色彩规范建立',
    summary: '如何为品牌建立一套完整的色彩系统：主色、辅助色、中性色、语义色的规划方法。',
    sections: [
      {
        title: '主色 (Primary Color)',
        content: '主色是品牌的识别核心，承担视觉识别的核心任务：\n· 数量：通常 1 个主色，部分品牌有 2-3 个\n· 使用比例：占整体视觉的 20-30%\n· 选择标准：\n  - 符合品牌调性 (科技蓝、活力橙、高端黑)\n  - 与白底对比度 ≥ 4.5:1 (可作文字)\n  - 与黑底对比度 ≥ 3:1 (深色模式可用)\n  - 可生成合理的色阶 (深/浅版本)\n· 示例：Ant Design #1677FF、Apple #0071E3、Stripe #635BFF'
      },
      {
        title: '辅助色 (Secondary Color)',
        content: '辅助色用于丰富视觉层次，强调特定元素：\n· 数量：通常 2-4 个\n· 使用比例：占整体视觉的 10-15%\n· 选择原则：\n  - 与主色有明确的色相差异 (互补色或邻近色)\n  - 饱和度低于主色，避免"抢戏"\n  - 各自承担特定语义 (成功/警告/错误等)\n· 应用场景：次要按钮、标签、图标、状态指示、营销活动强调'
      },
      {
        title: '中性色 (Neutral Colors)',
        content: '中性色是界面的"骨架"，承担大部分视觉空间：\n· 色阶规划：通常规划 9-10 阶灰度 (50/100/200...900)\n· 命名建议：gray-50 最浅、gray-900 最深\n· 用途分配：\n  - gray-50/100：卡片背景、页面底色\n  - gray-200/300：分割线、边框\n  - gray-400/500：辅助文字、占位符\n  - gray-700/800：正文文字、标题\n  - gray-900：强强调文字、Logo\n· 技巧：在灰度中轻微混入主色，可以让界面更协调 (如在灰中加一点蓝)'
      },
      {
        title: '语义色 (Semantic Colors)',
        content: '语义色赋予颜色明确的含义，是 UX 的重要部分：\n· 成功色 (Success)：绿色系，代表确认/完成/正确\n· 警告色 (Warning)：橙/黄色系，代表注意/提醒\n· 错误色 (Error/Danger)：红色系，代表错误/危险/删除\n· 信息色 (Info)：蓝/青色系，代表中性信息\n· 链接色 (Link)：通常与主色一致或独立的蓝色\n· 建议：各语义色应保持各自的"色相关联"，不要把红色用作成功，绿色用作错误，这会与用户预期冲突'
      },
      {
        title: '色彩 Token 系统',
        content: '建议建立两级颜色 Token：\n· 基础 Token (Primitive)：如 blue-500 = #1677FF，只描述颜色本身\n· 语义 Token (Semantic)：如 color-primary = blue-500，描述颜色用途\n· 优势：换皮肤/做深色模式时，只需修改语义 Token 的指向\n· 命名规范：color-{用途}-{状态}，如 color-primary-hover\n· 输出格式：\n  - CSS: --color-primary: #1677FF\n  - SCSS: $color-primary: #1677FF\n  - JSON Design Token: { color.primary.value: "#1677FF" }\n  - iOS: static let primary = UIColor(red:0.086, green:0.467, blue:1.0, alpha:1.0)'
      },
      {
        title: '深色模式色彩适配',
        content: '深色模式不是简单地反相，而是需要独立的色阶规划：\n· 背景层级：深背景 / 卡片背景 / 浮层背景 (由深到浅)\n· 文字层级：主要文字 / 次要文字 / 辅助文字 (由亮到暗)\n· 饱和度降低：深色模式中的颜色通常降低饱和度，避免刺眼\n· 主色适配：为深色模式准备一个"较深版本"的主色\n· 对比度检查：文字与深色背景的对比度仍需达到 4.5:1 (AA 级)\n· 可参考：iOS Dark Mode Colors、Material Design Dark Theme\n· 测试建议：在真实的黑暗环境中检查是否过于刺眼'
      }
    ],
    chart: {
      type: 'format-radar',
      title: '品牌色彩系统在各维度的评估建议',
      indicator: [
        { name: '品牌辨识度', max: 100 },
        { name: '对比度合规', max: 100 },
        { name: '色阶完整性', max: 100 },
        { name: '语义清晰度', max: 100 },
        { name: '跨平台一致性', max: 100 },
        { name: '可维护性', max: 100 }
      ],
      data: [
        { name: '主色 Primary', value: [95, 90, 80, 75, 85, 80], color: '#1677FF' },
        { name: '辅助色 Secondary', value: [70, 80, 85, 90, 80, 85], color: '#8B5CF6' },
        { name: '中性色 Neutral', value: [60, 95, 95, 70, 95, 95], color: '#6B7280' },
        { name: '语义色 Semantic', value: [50, 90, 75, 95, 80, 85], color: '#10B981' }
      ]
    }
  },
  {
    id: 'color-pitfalls',
    title: '色彩设计避坑指南',
    summary: '设计师和开发者在色彩选择与应用中的常见错误、问题案例及改进建议。',
    sections: [
      {
        title: '常见错误一：颜色过多',
        content: '问题：界面使用 5 种以上不同色相，视觉杂乱无章\n· 原因：缺乏统一的色彩系统，随机选择颜色\n· 改进建议：\n  - 主色 1 个 + 辅助色 2-3 个 + 语义色 3-4 个\n  - 整体色相关系遵循色轮配色原则\n  - 使用中性色 (灰阶) 承担 70% 以上的视觉空间\n· 参考规则：60-30-10 法则 (主色60%、辅助色30%、强调色10%)'
      },
      {
        title: '常见错误二：饱和度过高',
        content: '问题：大面积使用高饱和度颜色，造成视觉疲劳\n· 表现：亮红、亮蓝、亮绿作为背景色大面积使用\n· 改进建议：\n  - 大面积背景降低饱和度至 30-50%\n  - 高饱和度仅用于小面积强调 (按钮、链接)\n  - 参考 Material Design 色卡的 500 系列作为主色，200-300 系列作为背景\n· 检查方法：将设计稿去饱和为灰度，看是否仍有清晰的层次结构'
      },
      {
        title: '常见错误三：对比度不足',
        content: '问题：浅色文字配浅色背景，文字不可读\n· 典型案例：浅灰文字 #999 配浅灰背景 #F5F5F5\n· 快速检查：将设计稿转为纯灰度，文字是否仍然清晰\n· 标准：正文 ≥ 4.5:1，大字号 ≥ 3:1 (WCAG AA)\n· 改进建议：\n  - 正文文字亮度值控制在 ≤ L*50 (深色背景) 或 ≥ L*60 (浅色背景)\n  - 可使用 Color Contrast Analyzer 工具检查\n  - 禁用状态可使用 3:1 以下，但需明确区分'
      },
      {
        title: '常见错误四：纯黑纯白',
        content: '问题：使用 #000000 纯黑文字或 #FFFFFF 纯白背景\n· 问题原因：纯黑在屏幕上过于生硬，纯白过于刺眼\n· 改进建议：\n  - 推荐正文深灰：#1F2937 / #374151\n  - 推荐页面底色：#FAFAFA / #F9FAFB\n  - 推荐卡片背景：#FFFFFF (略低于页面底色或一致)\n  - 小技巧：在灰中混入主色的蓝/紫，如 #0F172A (深蓝灰) 比 #111827 更有品质感'
      },
      {
        title: '常见错误五：仅依赖颜色传递信息',
        content: '问题：错误状态仅用红色、成功仅用绿色表示\n· 影响：色弱/色盲用户无法区分 (约 8% 男性是红绿色盲)\n· 改进建议：\n  - 颜色 + 图标：错误用红色 + ✕ 图标\n  - 颜色 + 文字：明确写出"错误"、"成功"字样\n  - 颜色 + 形状：不同状态用不同样式\n· 检查方法：去饱和后，各状态是否仍可通过形状/文字/图标区分'
      },
      {
        title: '常见错误六：印刷稿用 RGB',
        content: '问题：设计印刷品时使用 RGB 模式，颜色鲜艳但印刷后偏暗\n· 典型案例：宣传册、名片、海报直接用 RGB 色值\n· 改进建议：\n  - 印刷设计一开始就使用 CMYK 模式\n  - 关键颜色选择 Pantone 专色号\n  - 制作时开启"色域警告"查看哪些颜色会失真\n  - 重要项目务必打样确认 (Digital Proof)\n· 常见"问题色"：亮红 #FF0000、亮蓝 #0000FF、亮紫 #FF00FF，这些在 CMYK 中都会明显变暗'
      },
      {
        title: '常见错误七：渐变无节制',
        content: '问题：过度使用渐变，每个元素都是渐变背景\n· 表现：按钮渐变 + 卡片渐变 + 背景渐变 + 图标渐变\n· 改进建议：\n  - 渐变仅用于强调元素 (CTA 按钮、Hero 背景)\n  - 全局保持 1-2 种渐变风格一致\n  - 渐变节点数 2-3 个即可，过多显得杂乱\n  - 渐变角度保持统一 (常用 135° 或垂直)'
      },
      {
        title: '工具与资源推荐',
        content: '· Coolors / Khroma：AI 配色生成工具\n· Adobe Color：官方色轮与主题工具\n· Color Hunt：四色配色方案参考\n· Colorable：对比度检查工具 (支持批量)\n· Stark / Figma Color Blind：色盲模式预览\n· Huemint：品牌/网站/插画配色推荐\n· Design Systems Handbook：设计系统最佳实践\n· Refactoring UI：《重构UI》中的色彩章节值得细读'
      }
    ],
    chart: {
      type: 'design-standard',
      title: '常见色彩错误严重程度评估（数值越高问题越严重）',
      data: [
        { name: '颜色过多', value: 7, color: '#EF4444' },
        { name: '饱和度过高', value: 6, color: '#F59E0B' },
        { name: '对比度不足', value: 9, color: '#DC2626' },
        { name: '纯黑纯白', value: 4, color: '#F97316' },
        { name: '仅颜色传递信息', value: 8, color: '#B91C1C' },
        { name: '印刷稿用 RGB', value: 7, color: '#EA580C' },
        { name: '渐变无节制', value: 5, color: '#FCD34D' }
      ],
      thresholds: [
        { name: '需立即修复 (>7)', value: 7, color: '#DC2626' },
        { name: '建议优化 (4-7)', value: 4, color: '#F59E0B' },
        { name: '良好参考 (<4)', value: 4, color: '#10B981' }
      ]
    }
  },
  {
    id: 'color-formulas',
    title: '色彩计算常用公式速查',
    summary: '相对亮度、对比度、色阶生成、色温调节等色彩计算的公式和参考代码。',
    sections: [
      {
        title: '相对亮度计算 (Relative Luminance)',
        content: 'WCAG 标准的亮度计算公式，用于对比度判断：\nY = 0.2126 × R + 0.7152 × G + 0.0722 × B\n\n其中 R、G、B 的取值需要先做伽马校正：\n· 若通道值 ≤ 0.03928，则 V = V / 12.92\n· 否则 V = ((V + 0.055) / 1.055) ^ 2.4\n\nJavaScript 代码示例：\nfunction getLuminance(r, g, b) {\n  const [rs, gs, bs] = [r, g, b].map(v => {\n    v /= 255;\n    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);\n  });\n  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;\n}\n\n· 结果范围：0 (纯黑) 到 1 (纯白)\n· 用途：确定文字颜色 (黑/白)、判断对比度'
      },
      {
        title: 'WCAG 对比度计算',
        content: '对比度 = (L1 + 0.05) / (L2 + 0.05)\n\n其中 L1 是较亮颜色的相对亮度，L2 是较暗颜色的相对亮度。\n\n标准阈值：\n· AA 级正文 (≤18pt)：≥ 4.5:1\n· AA 级大字 (≥18pt 粗体 / ≥24pt 普通)：≥ 3:1\n· AAA 级正文：≥ 7:1\n· AAA 级大字：≥ 4.5:1\n\n代码示例：\nfunction contrastRatio(color1, color2) {\n  const l1 = getLuminance(...color1);\n  const l2 = getLuminance(...color2);\n  const bright = Math.max(l1, l2);\n  const dark = Math.min(l1, l2);\n  return (bright + 0.05) / (dark + 0.05);\n}\n\n· 结果范围：1 (同色) 到 21 (黑白)\n· 对比度 8.5:1 以上即为非常好的可读性'
      },
      {
        title: 'RGB 与 HSL 互转',
        content: 'RGB 转 HSL：\n1. 归一化：r = R/255, g = G/255, b = B/255\n2. max = max(r,g,b), min = min(r,g,b), delta = max - min\n3. L = (max + min) / 2\n4. 如果 delta = 0, 则 H = 0, S = 0 (灰色)\n5. 否则 S = L > 0.5 ? delta / (2 - max - min) : delta / (max + min)\n6. H 的计算根据最大值所在通道：\n   max = r: H = ((g-b)/delta + (g < b ? 6 : 0)) × 60\n   max = g: H = ((b-r)/delta + 2) × 60\n   max = b: H = ((r-g)/delta + 4) × 60\n\nHSL 转 RGB：\n1. C = (1 - |2L - 1|) × S\n2. X = C × (1 - |(H/60) mod 2 - 1|)\n3. m = L - C/2\n4. 根据 H 所在区间选择 (R,G,B) 基础值\n5. 最终各通道 = (基础值 + m) × 255'
      },
      {
        title: '同色系色阶生成',
        content: '基于一个主色生成 9 阶色卡的方法：\n\n方法一：调整亮度 (最常用)\n· 50级 (最浅): L + (100 - L) × 0.9\n· 100级: L + (100 - L) × 0.75\n· 200级: L + (100 - L) × 0.55\n· 300级: L + (100 - L) × 0.3\n· 400级: L + (100 - L) × 0.1\n· 500级: 原色 L\n· 600级: L × 0.9\n· 700级: L × 0.75\n· 800级: L × 0.55\n· 900级 (最深): L × 0.35\n\n方法二：HSL 线性插值\n· 在 HSL 空间中，保持 H 不变\n· S 从浅到深递增 (30% → 100% → 40%)\n· L 从浅到深递减 (95% → 55% → 20%)\n\n代码思路：\nfunction generateShades(baseColor, count = 9) {\n  const hsl = rgbToHsl(baseColor);\n  const shades = [];\n  for (let i = 0; i < count; i++) {\n    const t = i / (count - 1);\n    const l = 95 - t * 75;\n    const s = 30 + Math.sin(t * Math.PI) * 70;\n    shades.push(hslToRgb(hsl.h, s, l));\n  }\n  return shades;\n}'
      },
      {
        title: '色温调节 (冷暖色调)',
        content: '将颜色向暖色或冷色调整：\n\n暖色调 (向橙黄)：\n· 增加 R 通道\n· 轻微增加 G 通道\n· 减少 B 通道\n· RGB 调整示例：R +15, G +5, B -20\n\n冷色调 (向青蓝)：\n· 减少 R 通道\n· 增加 B 通道\n· 轻微增加 G 通道\n· RGB 调整示例：R -15, G +5, B +20\n\n更精确的方法 (K氏色温)：\n· 使用 Planckian Locus 公式基于色温值 (如 3000K 暖、6500K 冷、10000K 很冷) 计算 RGB\n· 然后与原色做线性混合\n\n简单代码：\nfunction warmFilter(rgb, intensity = 0.2) {\n  return {\n    r: Math.min(255, rgb.r + 30 * intensity),\n    g: Math.min(255, rgb.g + 10 * intensity),\n    b: Math.max(0, rgb.b - 30 * intensity)\n  };\n}'
      },
      {
        title: '色差 ΔE (CIE76 / CIEDE2000)',
        content: 'ΔE (Delta E) 是衡量两种颜色感知差异的标准：\n\nCIE76 (简单版)：\nΔE = √[(ΔL)² + (Δa)² + (Δb)²]\n\n· ΔE < 1：人眼几乎无法察觉\n· ΔE = 1-3：仅专业训练者可察觉\n· ΔE = 3-6：普通用户可察觉\n· ΔE > 6：明显差异\n\nCIEDE2000 (精确版)：\n对 CIE76 进行了多项修正，考虑了：\n· 亮度感知非线性\n· 蓝色区域敏感度不同\n· 色相差与彩度的交互\n· 公式较为复杂，约 50 行代码\n\n用途：\n· 品牌色一致性检查 (不同屏幕/打印的颜色偏差)\n· 色彩映射质量评估\n· 色板去重 (ΔE < 3 的颜色可认为相同)\n\nJavaScript 可使用 chroma.js 库：chroma.deltaE(c1, c2, \'lab\')'
      },
      {
        title: 'RGB 与 CMYK 简化公式',
        content: 'RGB 转 CMYK (简化版，非专业 ICC 转换)：\n\n1. K = 1 - max(R/255, G/255, B/255)\n2. 若 K = 1, 则 C=M=Y=0 (纯黑)\n3. 否则：\n   C = (1 - R/255 - K) / (1 - K)\n   M = (1 - G/255 - K) / (1 - K)\n   Y = (1 - B/255 - K) / (1 - K)\n\nCMYK 转 RGB (简化版)：\nR = 255 × (1 - C) × (1 - K)\nG = 255 × (1 - M) × (1 - K)\nB = 255 × (1 - Y) × (1 - K)\n\n重要提示：\n以上为简化公式，仅用于快速预览。实际印刷时应使用：\n· 专业软件 (Photoshop/Illustrator) 的色彩管理\n· ICC Profile (色彩特性描述文件)\n· 不同印刷纸张使用不同的 CMYK 配置\n· 不要用 JS 转换后的 CMYK 值直接送印刷厂'
      },
      {
        title: '颜色插值与渐变',
        content: '两色之间插值生成过渡色：\n\n方法一：RGB 线性插值 (最简单)\n对于颜色 A(R1,G1,B1) 和 B(R2,G2,B2)，过渡色 t (0-1)：\nR = R1 + (R2 - R1) × t\nG = G1 + (G2 - G1) × t\nB = B1 + (B2 - B1) × t\n\n方法二：LAB 空间插值 (视觉更自然)\n1. 将两色都转换到 LAB 空间\n2. 在 LAB 空间做线性插值\n3. 再转回 RGB\n优点：避免 RGB 插值出现的"脏色"中间色\n\n方法三：HSL 圆周插值\n在 HSL 空间插值，保持色相过渡平滑\n适用于彩色渐变 (彩虹色、日落色等)\n\nCSS 渐变底层原理：\nlinear-gradient(angle, color-stop1, color-stop2, ...)\n浏览器会在每个 stop 之间做 RGB 插值\n可以通过添加中间节点 (midpoint color-stop) 来调整过渡曲线'
      }
    ],
    chart: {
      type: 'color-wheel',
      title: '常见色彩操作在色轮上的示意（明度调整 + 饱和度变化）',
      data: [
        { h: 0, label: 'H', value: 95 },
        { h: 30, label: 'S', value: 90 },
        { h: 60, label: 'L', value: 85 },
        { h: 90, label: 'ΔE', value: 80 },
        { h: 120, label: '对比', value: 75 },
        { h: 150, label: '色温', value: 70 },
        { h: 180, label: '插值', value: 70 },
        { h: 210, label: '渐变', value: 75 },
        { h: 240, label: '色阶', value: 80 },
        { h: 270, label: '色域', value: 85 },
        { h: 300, label: 'HSL', value: 90 },
        { h: 330, label: 'RGB', value: 95 }
      ]
    }
  }
]
