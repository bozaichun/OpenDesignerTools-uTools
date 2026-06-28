/**
 * 更新应用版本号：递增 patch 版本 + 写入构建时间戳
 * 格式：v{semver}-{YYYYMMDDHHmmss}
 * 用法：npm run version:update 或在 build / git commit 前自动执行
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const lockPath = path.join(rootDir, 'package-lock.json');
const versionFilePath = path.join(rootDir, 'src', 'config', 'appVersion.js');

function incrementPatchVersion(version) {
  const parts = String(version || '0.0.0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.slice(0, 3).join('.');
}

function updatePackageLockVersion(newVersion) {
  if (!fs.existsSync(lockPath)) return;
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  lock.version = newVersion;
  if (lock.packages?.['']) {
    lock.packages[''].version = newVersion;
  }
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const currentVersion = pkg.version || '0.0.1';
const nextVersion = incrementPatchVersion(currentVersion);

pkg.version = nextVersion;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
updatePackageLockVersion(nextVersion);

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
export const APP_VERSION = 'v${nextVersion}';
export const APP_BUILD = '${build}';
export const APP_VERSION_LABEL = \`\${APP_VERSION}-\${APP_BUILD}\`;
`;

fs.writeFileSync(versionFilePath, content, 'utf8');
console.log(`Version updated: v${currentVersion} -> v${nextVersion}-${build}`);
