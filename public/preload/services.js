const fs = require('node:fs')
const path = require('node:path')

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 代码文件写入到下载目录
  writeCodeFile (text, fileName) {
    const safeName = String(fileName || 'colors.txt').replace(/[\\/:*?"<>|]/g, '-')
    const filePath = path.join(window.utools.getPath('downloads'), safeName)
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 文本写入到指定路径
  writeTextToPath (text, filePath) {
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 下载目录下的默认保存路径
  getDefaultSavePath (fileName) {
    const safeName = String(fileName || 'document.txt').replace(/[\\/:*?"<>|]/g, '-')
    return path.join(window.utools.getPath('downloads'), safeName)
  }
}
