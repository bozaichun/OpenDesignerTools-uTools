import { parseColor } from './colorUtils';

export const CODE_EXPORT_TABS = [
  { key: 'css', label: 'CSS', title: 'CSS Variables', ext: 'css' },
  { key: 'scss', label: 'SCSS', title: 'SCSS / Sass', ext: 'scss' },
  { key: 'less', label: 'LESS', title: 'LESS', ext: 'less' },
  { key: 'tailwind', label: 'Tailwind', title: 'Tailwind CSS (tailwind.config.js)', ext: 'js' },
  { key: 'flutter', label: 'Flutter', title: 'Flutter / Dart', ext: 'dart' },
  { key: 'wechat', label: '小程序', title: '微信小程序 (WXSS / app.json)', ext: 'wxss' },
  { key: 'android', label: 'Android', title: 'Android (colors.xml)', ext: 'xml' },
  { key: 'ios', label: 'iOS', title: 'iOS / Swift (UIColor)', ext: 'swift' },
  { key: 'json', label: 'JSON', title: 'JSON / Design Token', ext: 'json' }
];

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function toCamelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function hexToRgbaTuple(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return { r: 0, g: 0, b: 0, a: 1 };
  return rgb;
}

function invertForDark(rgb) {
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  if (brightness > 200) {
    return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
  }
  const factor = 1 + (1 - brightness / 255) * 0.3;
  const r = Math.min(255, Math.round(rgb.r * factor));
  const g = Math.min(255, Math.round(rgb.g * factor));
  const b = Math.min(255, Math.round(rgb.b * factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

function processColors(inputColors, useKebabCase) {
  return inputColors.map((c) => {
    const rawName = (c.name || 'color').trim() || 'color';
    const normalizedName = useKebabCase ? toKebabCase(rawName) : rawName;
    return { ...c, normalizedName, rawName };
  });
}

function generateCSS(colors, includeDarkMode) {
  let css = ':root {\n';
  colors.forEach((c) => {
    const rgb = hexToRgbaTuple(c.color);
    css += `  --color-${c.normalizedName}: ${c.color.toUpperCase()};\n`;
    css += `  --color-${c.normalizedName}-rgb: ${rgb.r} ${rgb.g} ${rgb.b};\n`;
  });
  css += '};\n\n';
  if (includeDarkMode) {
    css += '[data-theme="dark"] {\n';
    colors.forEach((c) => {
      const rgb = hexToRgbaTuple(c.color);
      const inverted = invertForDark(rgb);
      css += `  --color-${c.normalizedName}: ${inverted};\n`;
    });
    css += '};\n';
  }
  return css;
}

function generateSCSS(colors, useKebabCase) {
  let scss = '// Color Variables\n';
  colors.forEach((c) => {
    const name = useKebabCase ? c.normalizedName : toCamelCase(c.rawName);
    scss += `$color-${name}: ${c.color.toUpperCase()};\n`;
  });
  scss += '\n// Color Map\n$colors: (\n';
  colors.forEach((c, idx) => {
    const name = useKebabCase ? c.normalizedName : toCamelCase(c.rawName);
    scss += `  '${name}': ${c.color.toUpperCase()}${idx < colors.length - 1 ? ',' : ''}\n`;
  });
  scss += ');\n';
  return scss;
}

function generateLESS(colors, useKebabCase) {
  let less = '// Color Variables\n';
  colors.forEach((c) => {
    const name = useKebabCase ? c.normalizedName : toCamelCase(c.rawName);
    less += `@color-${name}: ${c.color.toUpperCase()};\n`;
  });
  return less;
}

function generateTailwind(colors, useKebabCase) {
  let tw = "/** @type {import('tailwindcss').Config} */\n";
  tw += 'module.exports = {\n';
  tw += '  theme: {\n';
  tw += '    extend: {\n';
  tw += '      colors: {\n';
  colors.forEach((c) => {
    const name = useKebabCase ? c.normalizedName : toCamelCase(c.rawName);
    tw += `        '${name}': '${c.color.toUpperCase()}',\n`;
  });
  tw += '      },\n';
  tw += '    },\n';
  tw += '  },\n';
  tw += '};\n';
  return tw;
}

function generateFlutter(colors) {
  let flutter = "import 'package:flutter/material.dart';\n\n";
  flutter += 'class AppColors {\n';
  flutter += '  AppColors._();\n\n';
  colors.forEach((c) => {
    const name = toPascalCase(c.rawName);
    const rgb = hexToRgbaTuple(c.color);
    flutter += `  static const Color ${name} = Color(0xFF${rgb.r.toString(16).padStart(2, '0').toUpperCase()}${rgb.g.toString(16).padStart(2, '0').toUpperCase()}${rgb.b.toString(16).padStart(2, '0').toUpperCase()});\n`;
  });
  flutter += '}\n';
  return flutter;
}

function generateWechat(colors) {
  let wx = '/* app.wxss - Global Color Variables */\n';
  colors.forEach((c) => {
    wx += `--color-${c.normalizedName}: ${c.color.toUpperCase()};\n`;
  });
  wx += '\n/* Usage: color: var(--color-primary); */\n';
  return wx;
}

function generateAndroid(colors) {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<resources>\n';
  colors.forEach((c) => {
    const name = toSnakeCase(c.rawName);
    xml += `    <color name="${name}">${c.color.toUpperCase()}</color>\n`;
  });
  xml += '</resources>\n';
  return xml;
}

function generateiOS(colors) {
  let swift = 'import UIKit\n\n';
  swift += 'extension UIColor {\n';
  swift += '    static let appColors = AppColors()\n';
  swift += '}\n\n';
  swift += 'struct AppColors {\n';
  colors.forEach((c) => {
    const name = toCamelCase(c.rawName);
    const rgb = hexToRgbaTuple(c.color);
    swift += `    let ${name} = UIColor(red: ${(rgb.r / 255).toFixed(4)}, green: ${(rgb.g / 255).toFixed(4)}, blue: ${(rgb.b / 255).toFixed(4)}, alpha: 1.0)\n`;
  });
  swift += '}\n';
  return swift;
}

function generateJSON(colors) {
  const tokenObj = {
    tokens: {
      colors: {}
    }
  };
  colors.forEach((c) => {
    tokenObj.tokens.colors[c.normalizedName] = {
      value: c.color.toUpperCase(),
      type: 'color'
    };
  });
  return JSON.stringify(tokenObj, null, 2) + '\n';
}

export function generateExportCode(inputColors, options = {}) {
  const {
    includeDarkMode = true,
    useKebabCase = true
  } = options;

  const colors = processColors(inputColors, useKebabCase);

  return {
    css: generateCSS(colors, includeDarkMode),
    scss: generateSCSS(colors, useKebabCase),
    less: generateLESS(colors, useKebabCase),
    tailwind: generateTailwind(colors, useKebabCase),
    flutter: generateFlutter(colors),
    wechat: generateWechat(colors),
    android: generateAndroid(colors),
    ios: generateiOS(colors),
    json: generateJSON(colors)
  };
}

export function getTabByKey(key) {
  return CODE_EXPORT_TABS.find((tab) => tab.key === key) || CODE_EXPORT_TABS[0];
}

export function sanitizeFileName(name) {
  return (name || 'colors')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 50) || 'colors';
}
