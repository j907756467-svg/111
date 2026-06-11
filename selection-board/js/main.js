// main.js — 控制器：视图切换、键盘导航、字段编辑、决策门、数据存档抽屉、PDF 导出
import { store } from './store.js';
import { buildSlides, CHAPTERS } from './slides.js';

const DESIGN_W = 1280, DESIGN_H = 720;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let view = 'board';   // 'board' | 'deck'
let idx = 0;          // 当前幻灯片索引（演示模式），0 = 封面
let slides = [];

const stage = $('#stage');
const side = $('#side');

/* ───────── 渲染入口 ───────── */
function render() {
  slides = buildSlides(store.state);
  idx = Math.max(0, Math.min(idx, slides.length - 1));
  $('#tbSub').textContent = `${store.state.meta.category} · ${store.state.meta.brand}`;
  $$('.seg-btn').forEach((b) => b.classList.toggle('is-on', b.dataset.view === view));
  renderSide();
  view === 'board' ? renderBoard() : renderDeck();
}

/* 把幻灯片 HTML 包进固定 1280×720 画布 */
function canvas(html) {
  return `<div class="slide-frame"><div class="slide-canvas">${html}</div></div>`;
}

/* 缩放画布以适配容器宽度 */
function fitFrames(root = document) {
  $$('.slide-frame', root).forEach((frame) => {
    const w = frame.clientWidth;
    const s = w / DESIGN_W;
    const cv = frame.firstElementChild;
    cv.style.transform = `scale(${s})`;
    frame.style.height = `${DESIGN_H * s}px`;
  });
}

/* ── 看板视图：全部幻灯片缩略图，按章分组 ── */
function renderBoard() {
  const groups = new Map();
  slides.forEach((sl, i) => {
    const key = sl.cover ? 0 : sl.ch;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ sl, i });
  });
  let html = '';
  for (const [ch, items] of groups) {
    const c = CHAPTERS.find((x) => x.n === ch);
    const label = ch === 0 ? '封面 · 工作流总览' : `${c.icon} 第 ${ch} 章 · ${c.name}`;
    html += `<div class="board-group"><div class="board-group-title">${label} <span>${items.length} 页</span></div>
      <div class="board-grid">${items.map(({ sl, i }) => `
        <button class="thumb" data-goto="${i}" aria-label="第 ${i + 1} 页">
          ${canvas(sl.body)}
          <span class="thumb-no">${i + 1}</span>
        </button>`).join('')}</div></div>`;
  }
  stage.className = 'stage stage-board';
  stage.innerHTML = html;
  fitFrames(stage);
}

/* ── 演示视图：单页大图 + 控制 ── */
function renderDeck() {
  const sl = slides[idx];
  stage.className = 'stage stage-deck';
  stage.innerHTML = `
    <div class="deck-wrap">
      <div class="deck-stage">${canvas(sl.body)}</div>
      <div class="deck-bar">
        <button class="nav-btn" data-nav="-1" ${idx === 0 ? 'disabled' : ''}>‹ 上一页</button>
        <span class="deck-count">${idx + 1} / ${slides.length}</span>
        <button class="nav-btn" data-nav="1" ${idx === slides.length - 1 ? 'disabled' : ''}>下一页 ›</button>
      </div>
    </div>`;
  fitFrames(stage);
}

/* ── 侧栏：章节大纲 ── */
function renderSide() {
  let html = '<div class="side-head">章节大纲</div>';
  let lastCh = null;
  slides.forEach((sl, i) => {
    const ch = sl.cover ? 0 : sl.ch;
    if (ch !== lastCh) {
      const c = CHAPTERS.find((x) => x.n === ch);
      html += `<div class="side-ch">${ch === 0 ? '◆ 封面 / 总览' : `${c.icon} ${ch}. ${c.name}`}</div>`;
      lastCh = ch;
    }
    const title = sl.cover ? '封面' : (sl.body.match(/action-title">(.*?)<\/h2>/)?.[1] || `第 ${i + 1} 页`).replace(/<[^>]+>/g, '');
    html += `<button class="side-item ${i === idx && view === 'deck' ? 'is-cur' : ''}" data-goto="${i}">
      <span class="side-no">${i + 1}</span><span class="side-t">${title}</span></button>`;
  });
  side.innerHTML = html;
}

/* ───────── 导航 ───────── */
function goto(i, toDeck = true) {
  idx = Math.max(0, Math.min(i, slides.length - 1));
  if (toDeck) view = 'deck';
  render();
}
function nav(d) { goto(idx + d); }

/* ───────── 字段编辑（contenteditable） ───────── */
function startEdit(el) {
  if (el.isContentEditable) return;
  el.contentEditable = 'true';
  el.classList.add('editing');
  const r = document.createRange();
  r.selectNodeContents(el);
  const sel = getSelection();
  sel.removeAllRanges(); sel.addRange(r);
  el.focus();
  const commit = () => {
    el.contentEditable = 'false';
    el.classList.remove('editing');
    const path = el.dataset.path;
    const val = el.textContent.trim();
    el.removeEventListener('blur', commit);
    el.removeEventListener('keydown', onKey);
    if (store.get(path) !== val) { store.set(path, val); toast('已更新并自动存档'); }
    else render();
  };
  const onKey = (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); el.blur(); }
    if (ev.key === 'Escape') { el.textContent = store.get(el.dataset.path); el.blur(); }
  };
  el.addEventListener('blur', commit);
  el.addEventListener('keydown', onKey);
}

/* ───────── 决策门切换 ───────── */
function toggleGate(key) {
  const g = store.state.meta.gates[key];
  g.status = g.status === 'confirmed' ? 'wait' : 'confirmed';
  if (g.status === 'confirmed') g.time = new Date().toISOString().slice(0, 10);
  store.persist(); render();
  toast(g.status === 'confirmed' ? '决策门已确认 ✔' : '决策门改为等待确认');
}

/* ───────── 数据存档抽屉 ───────── */
function openDrawer() { $('#drawer').hidden = false; $('#mask').hidden = false; renderArchives(); }
function closeDrawer() { $('#drawer').hidden = true; $('#mask').hidden = true; }

function renderArchives() {
  const list = store.listArchives();
  $('#arCount').textContent = list.length;
  $('#arList').innerHTML = list.length ? list.map((a) => `
    <div class="ar-item" data-id="${a.id}">
      <div class="ar-main">
        <div class="ar-name">${escapeHtml(a.name)}</div>
        <div class="ar-meta">${new Date(a.time).toLocaleString('zh-CN')}${a.note ? ' · ' + escapeHtml(a.note) : ''}</div>
      </div>
      <div class="ar-acts">
        <button class="mini" data-ar="restore" title="恢复">恢复</button>
        <button class="mini" data-ar="rename" title="重命名">✎</button>
        <button class="mini danger" data-ar="delete" title="删除">🗑</button>
      </div>
    </div>`).join('') : '<p class="dw-empty">暂无存档。修改数据后点上方「保存快照」即可归档。</p>';
}

/* ───────── 文件下载 / 导入 ───────── */
function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const slug = () => (store.state.meta.brand || 'report').replace(/\s+/g, '-') + '-立项-' + new Date().toISOString().slice(0, 10);

/* ───────── PDF 导出（浏览器打印） ───────── */
function exportPDF() {
  const root = $('#printRoot');
  root.innerHTML = slides.map((sl) => `<div class="print-page"><div class="slide-canvas">${sl.body}</div></div>`).join('');
  document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); root.innerHTML = ''; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 60);
}

/* ───────── Toast ───────── */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('show'); setTimeout(() => (t.hidden = true), 250); }, 1900);
}
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ───────── 事件委托 ───────── */
document.addEventListener('click', (ev) => {
  const t = ev.target;
  const goEl = t.closest('[data-goto]');
  if (goEl) { goto(+goEl.dataset.goto); return; }

  const viewBtn = t.closest('[data-view]');
  if (viewBtn) { view = viewBtn.dataset.view; render(); return; }

  const navBtn = t.closest('[data-nav]');
  if (navBtn) { nav(+navBtn.dataset.nav); return; }

  const editEl = t.closest('.editable');
  if (editEl) { startEdit(editEl); return; }

  const gatePill = t.closest('.gate .gate-pill');
  if (gatePill) { toggleGate(gatePill.closest('[data-gate]').dataset.gate); return; }

  const arItem = t.closest('[data-ar]');
  if (arItem) { handleArchiveAction(arItem); return; }

  const act = t.closest('[data-act]')?.dataset.act;
  if (act) handleAct(act);
});

function handleArchiveAction(btn) {
  const id = btn.closest('.ar-item').dataset.id;
  const kind = btn.dataset.ar;
  if (kind === 'restore') { store.restoreArchive(id); closeDrawer(); toast('已恢复该存档'); }
  else if (kind === 'delete') { if (confirm('确认删除该存档？')) { store.deleteArchive(id); renderArchives(); } }
  else if (kind === 'rename') {
    const cur = store.listArchives().find((a) => a.id === id);
    const name = prompt('重命名存档', cur?.name || '');
    if (name) { store.renameArchive(id, name.trim()); renderArchives(); }
  }
}

function handleAct(act) {
  switch (act) {
    case 'archive': openDrawer(); break;
    case 'close-drawer': closeDrawer(); break;
    case 'print': exportPDF(); break;
    case 'save-snap': {
      const name = $('#snapName').value.trim();
      const note = $('#snapNote').value.trim();
      store.saveArchive(name, note);
      $('#snapName').value = ''; $('#snapNote').value = '';
      renderArchives(); toast('快照已保存 ✔');
      break;
    }
    case 'export-current': download(slug() + '.json', store.exportCurrent()); toast('已导出当前报告'); break;
    case 'export-bundle': download(slug() + '-整包.json', store.exportAll()); toast('已导出整包（含存档）'); break;
    case 'import': $('#fileInput').click(); break;
    case 'reset':
      if (confirm('恢复为默认示例数据？当前未存档的修改将丢失（已保存的快照不受影响）。')) { store.resetToDefault(); toast('已恢复默认数据'); }
      break;
  }
}

$('#fileInput').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const res = store.importJSON(reader.result);
    toast(res.msg);
    if (res.ok) closeDrawer();
  };
  reader.readAsText(file);
  ev.target.value = '';
});

$('#mask').addEventListener('click', closeDrawer);

/* 键盘导航 */
document.addEventListener('keydown', (ev) => {
  if (document.activeElement?.isContentEditable) return;
  if (!$('#drawer').hidden) { if (ev.key === 'Escape') closeDrawer(); return; }
  if (view === 'deck') {
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); nav(1); }
    if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); nav(-1); }
    if (ev.key === 'Escape') { view = 'board'; render(); }
  } else if (ev.key === 'Enter' || ev.key === 'ArrowRight') {
    view = 'deck'; render();
  }
});

window.addEventListener('resize', () => fitFrames());
store.subscribe(() => { render(); if (!$('#drawer').hidden) renderArchives(); });

render();
