# 项目脚本说明 (Scripts Reference)

本目录包含项目维护和构建过程中使用的助手脚本。

## 核心脚本

### 1. `subset-fonts.js`
- **用途**: 字体子集化工具。
- **功能**: 扫描生成的 `dist` 目录中的 HTML 文件，提取所有使用的字符，并为指定的字体文件（如 Noto Serif CJK）生成最小化的 woff2 子集，以显著减少字体加载体积。
- **运行方式**: `npm run subset-fonts` 或 `bun run subset-fonts`。
- **自动执行**: 已集成在 `npm run build:fonts` 中。

## 已移除的脚本 (归档参考)

以下脚本在完成图标优化和导入重构后已移除：
- `extract-icons.mjs`: 用于从 `icons.ts` 提取 SVG 到独立文件。现在的流程是直接在 `src/icons/` 中管理 SVG。
- `fix-barrel-imports.mjs`: 用于将桶导出（barrel imports）替换为直接组件导入。
- `fix-imports-custom-path.mjs`: 用于重构导入路径以使用项目别名。

---

> [!tip]
> 添加新脚本时，请务必同步更新此文档。
