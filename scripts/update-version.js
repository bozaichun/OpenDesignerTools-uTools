/**
 * 更新应用版本号构建时间戳
 * 格式：v{semver}-{YYYYMMDDHHmmss}
 * 用法：npm run version:update 或在 build 前自动执行
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const versionFilePath = path.join(rootDir, 'src', 'config', 'appVersion.js');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const semver = pkg.version || '0.0.1';
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const build = [
  now.getFullYear(),
  pad(now.getMonth() + 1),
  pad(now.getDate()),
  pad(now.getHours()),
  pad(now.getMinutes()),
  pad(now.getSeconds())
].join('');

const content = `// 自动生成，请勿手动编辑。运行 npm run version:update 或 npm run build 时更新
export const APP_VERSION = 'v${semver}';
export const APP_BUILD = '${build}';
export const APP_VERSION_LABEL = \`\${APP_VERSION}-\${APP_BUILD}\`;
`;

fs.writeFileSync(versionFilePath, content, 'utf8');
console.log(`Version updated: v${semver}-${build}`);
