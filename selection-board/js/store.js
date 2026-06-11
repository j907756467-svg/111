// store.js — 状态管理 + 数据存档系统
// 当前工作数据自动保存到 localStorage；可保存为命名快照、恢复、删除、导出/导入 JSON。

import { buildDefaultData, SCHEMA_VERSION } from './defaultData.js';

const KEY_CURRENT = 'amico-lxb:current:v1';
const KEY_ARCHIVES = 'amico-lxb:archives:v1';

const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = () => 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    console.warn('存储失败', e);
    return false;
  }
}

class Store {
  constructor() {
    const stored = readJSON(KEY_CURRENT, null);
    this.state = stored || buildDefaultData();
    this.archives = readJSON(KEY_ARCHIVES, []);
    this._subs = new Set();
    if (!stored) this.persist(); // 首次加载即落盘默认数据，保证当前数据始终可导出/恢复
  }

  /* ── 订阅 / 渲染 ── */
  subscribe(fn) { this._subs.add(fn); return () => this._subs.delete(fn); }
  emit() { this._subs.forEach((fn) => fn(this.state)); }

  /* ── 当前数据自动保存 ── */
  persist() { writeJSON(KEY_CURRENT, this.state); }

  /** 按点路径更新字段，如 set('meta.brand', 'Amico') */
  set(path, value) {
    const keys = path.split('.');
    let o = this.state;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
    this.persist();
    this.emit();
  }

  get(path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), this.state);
  }

  /* ── 存档（快照）管理 ── */
  saveArchive(name, note = '') {
    const snap = {
      id: uid(),
      name: name || `存档 ${this.archives.length + 1}`,
      note,
      time: new Date().toISOString(),
      schema: SCHEMA_VERSION,
      data: clone(this.state),
    };
    this.archives.unshift(snap);
    writeJSON(KEY_ARCHIVES, this.archives);
    return snap;
  }

  listArchives() { return this.archives; }

  restoreArchive(id) {
    const snap = this.archives.find((a) => a.id === id);
    if (!snap) return false;
    this.state = clone(snap.data);
    this.persist();
    this.emit();
    return true;
  }

  deleteArchive(id) {
    this.archives = this.archives.filter((a) => a.id !== id);
    writeJSON(KEY_ARCHIVES, this.archives);
  }

  renameArchive(id, name) {
    const snap = this.archives.find((a) => a.id === id);
    if (snap) { snap.name = name; writeJSON(KEY_ARCHIVES, this.archives); }
  }

  /* ── 重置 ── */
  resetToDefault() {
    this.state = buildDefaultData();
    this.persist();
    this.emit();
  }

  /* ── 导出 / 导入 ── */
  exportCurrent() {
    return JSON.stringify(
      { type: 'amico-lxb-report', schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: this.state },
      null, 2,
    );
  }

  exportAll() {
    return JSON.stringify(
      { type: 'amico-lxb-bundle', schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), current: this.state, archives: this.archives },
      null, 2,
    );
  }

  /** 导入：支持单报告(data) 或 整包(current+archives)。返回 {ok, msg} */
  importJSON(text) {
    let obj;
    try { obj = JSON.parse(text); } catch { return { ok: false, msg: 'JSON 解析失败，文件格式不正确' }; }
    if (obj.type === 'amico-lxb-bundle') {
      if (obj.current) this.state = obj.current;
      if (Array.isArray(obj.archives)) { this.archives = obj.archives; writeJSON(KEY_ARCHIVES, this.archives); }
    } else if (obj.data) {
      this.state = obj.data;
    } else if (obj.meta) {
      this.state = obj; // 裸数据对象
    } else {
      return { ok: false, msg: '无法识别的文件结构（缺少 data / meta 字段）' };
    }
    this.persist();
    this.emit();
    return { ok: true, msg: '导入成功' };
  }
}

export const store = new Store();
export { clone };
