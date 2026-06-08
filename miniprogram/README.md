# 差旅通 · 微信小程序

「差旅通」出差规划工具的微信小程序版本。纯前端实现，数据保存在微信本地存储（`wx.setStorageSync`），无需后端，离线可用。

## 功能（底部 5 个 Tab）

| Tab | 功能 |
|-----|------|
| 仪表盘 | 当前行程概览、出发倒计时、预算进度、即将进行的日程、行程快速切换 |
| 行程 | 创建 / 编辑 / 删除 / 切换出差行程（主题、目的地、起止日期、预算、备注） |
| 日程 | 按天编排航班、住宿、会议等，时间轴展示 |
| 费用 | 分类记账、预算对比与超支预警、分类占比 |
| 行李 | 可勾选清单、常用物品一键添加、完成进度 |

## 运行方式

1. 下载安装 **微信开发者工具**（https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html）。
2. 打开工具 → 「导入项目」，目录选择本仓库根目录（含 `project.config.json`）。
3. AppID：
   - 有自己的小程序 AppID 时填入即可；
   - 仅本地预览/调试，可选择「测试号」或使用占位 `touristappid`（部分需要真实 AppID 的能力会受限，但本项目用不到云能力）。
4. 工具会自动以 `miniprogram/` 为小程序根目录编译，模拟器即可预览。真机预览点「预览」扫码即可。

## 目录结构

```
project.config.json        微信开发者工具项目配置（miniprogramRoot 指向 miniprogram/）
miniprogram/
  app.js / app.json / app.wxss   小程序入口、全局配置（含 tabBar）、全局样式
  sitemap.json
  utils/
    util.js        日期/金额/ID 等工具（iOS 安全日期解析）
    constants.js   日程类型、费用类别、常用行李预设
    store.js       数据层 + 微信本地存储持久化
  pages/
    dashboard/ trips/ itinerary/ expenses/ checklist/   五个页面（js/wxml/wxss/json）
```

## 说明

- 首次打开自动生成一条示例行程，便于快速上手；可在「仪表盘 → 清空全部数据」重置。
- 所有数据仅存于本机微信，不会上传；卸载小程序或清除存储后会丢失。
