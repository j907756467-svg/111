// build-standalone.mjs — 将 css + 5 个 JS 模块内联进单个 standalone.html
// 用法：node selection-board/build-standalone.mjs
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(here, p), 'utf8');

// 按依赖顺序拼接：defaultData → charts → store → slides → main
const ORDER = ['js/defaultData.js', 'js/charts.js', 'js/store.js', 'js/slides.js', 'js/main.js'];

// 去掉 import 行与 export 关键字，使其在单一作用域内可直接互相引用
function strip(src) {
  return src
    .split('\n')
    .filter((l) => !/^\s*import\s.*from\s.*;?\s*$/.test(l))      // 删除 import 行
    .filter((l) => !/^\s*export\s*\{[^}]*\}\s*;?\s*$/.test(l))   // 删除 `export { ... };`
    .map((l) => l.replace(/^(\s*)export\s+(const|let|var|function|class|async\s+function)\b/, '$1$2'))
    .join('\n');
}

const js = ORDER.map((f) => `\n/* ===== ${f} ===== */\n${strip(read(f))}`).join('\n');
const css = read('css/board.css');

const html = read('index.html')
  // 用函数式替换，避免替换串中的 $&/$'/$` 等被 String.replace 特殊解释
  .replace('<link rel="stylesheet" href="css/board.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="js/main.js"></script>', () => `<script type="module">\n${js}\n</script>`)
  // 单文件版可直接双击打开（file://），补一句说明
  .replace('<title>选品立项 PPT 看板 · Amico</title>', () => '<title>选品立项 PPT 看板（单文件版）· Amico</title>');

writeFileSync(join(here, 'standalone.html'), html);
console.log(`✓ standalone.html 已生成（${(html.length / 1024).toFixed(1)} KB，含 ${ORDER.length} 个内联模块）`);
