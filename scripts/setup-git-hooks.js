/**
 * 安装 git pre-commit hook：提交前自动递增版本号并暂存相关文件
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const gitDir = path.join(rootDir, '.git');
const hooksDir = path.join(gitDir, 'hooks');
const hookPath = path.join(hooksDir, 'pre-commit');

if (!fs.existsSync(gitDir)) {
  process.exit(0);
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const hookScript = `#!/usr/bin/env node
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const updateScript = path.join(root, 'scripts', 'update-version.js');

const updateResult = spawnSync(process.execPath, [updateScript], {
  cwd: root,
  stdio: 'inherit'
});
if (updateResult.status !== 0) process.exit(updateResult.status || 1);

spawnSync('git', [
  'add',
  'package.json',
  'package-lock.json',
  'src/config/appVersion.js'
], { cwd: root, stdio: 'inherit' });
`;

fs.writeFileSync(hookPath, hookScript, 'utf8');

try {
  fs.chmodSync(hookPath, 0o755);
} catch {
  // Windows 环境可能不支持 chmod，忽略
}

console.log('Git pre-commit hook installed.');
