/**
 * Expressive Code 自定义插件集合
 * 
 * 包含以下插件：
 * - pluginFocus: 代码聚焦高亮/淡化
 * - pluginFootnotes: 代码脚注
 * - pluginAutoFold: 长代码自动折叠（开发中）
 * - pluginCallout: 代码气泡注释（开发中）
 */

export { pluginFocus, type PluginFocusOptions } from './plugin-focus.ts'
export { pluginFootnotes, type PluginFootnotesOptions } from './plugin-footnotes.ts'

// TODO: 后续插件
// export { pluginAutoFold } from './plugin-auto-fold'
// export { pluginCallout } from './plugin-callout'
