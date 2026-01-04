/**
 * Expressive Code Plugin: Focus
 * 
 * 聚焦高亮指定的代码行，其他行淡化显示。
 * 
 * 使用方式：
 * 1. Meta 参数: ```js focus=3-5,8
 * 2. 行内注释: // [!focus] 或 // [!focus:3] (聚焦当前行往下3行)
 */

import { definePlugin, AttachedPluginData } from '@expressive-code/core'

// 插件配置选项
export interface PluginFocusOptions {
        /** 淡化行的透明度，默认 0.4 */
        dimOpacity?: number
        /** 是否启用模糊效果，默认 true */
        enableBlur?: boolean
        /** 聚焦行的边框颜色 */
        borderColor?: string
        /** 聚焦行的背景颜色 */
        backgroundColor?: string
}

// 存储每个代码块的聚焦行数据
interface FocusData {
        focusedLines: Set<number>
}

const focusData = new AttachedPluginData<FocusData>(() => ({ focusedLines: new Set() }))

/**
 * 解析范围字符串，如 "1-3,5,7-9" -> [[1,3], [5,5], [7,9]]
 */
function parseRangeString(rangeStr: string): Array<[number, number]> {
        const ranges: Array<[number, number]> = []
        const parts = rangeStr.split(',')

        for (const part of parts) {
                const trimmed = part.trim()
                if (!trimmed) continue

                if (trimmed.includes('-')) {
                        const [start, end] = trimmed.split('-').map(s => parseInt(s.trim(), 10))
                        if (!isNaN(start) && !isNaN(end)) {
                                ranges.push([start, end])
                        }
                } else {
                        const num = parseInt(trimmed, 10)
                        if (!isNaN(num)) {
                                ranges.push([num, num])
                        }
                }
        }

        return ranges
}

export function pluginFocus(options: PluginFocusOptions = {}) {
        const {
                dimOpacity = 0.4,
                enableBlur = true,
                borderColor,
                backgroundColor,
        } = options

        return definePlugin({
                name: 'Focus',

                // CSS 样式
                baseStyles: `
      /* 聚焦模式的基础样式 */
      .ec-focus-mode {
        --ec-focus-dim-opacity: ${dimOpacity};
        --ec-focus-blur: ${enableBlur ? '0.5px' : '0'};
        ${borderColor ? `--ec-focus-border-color: ${borderColor};` : ''}
        ${backgroundColor ? `--ec-focus-bg-color: ${backgroundColor};` : ''}
      }
      
      /* 有聚焦行时，其他行淡化 */
      .ec-focus-mode .ec-line:not([data-focus="true"]) {
        opacity: var(--ec-focus-dim-opacity);
        filter: blur(var(--ec-focus-blur));
        transition: opacity 0.25s ease, filter 0.25s ease;
      }
      
      /* 聚焦行的样式 */
      .ec-focus-mode .ec-line[data-focus="true"] {
        position: relative;
        background: var(--ec-focus-bg-color, rgba(59, 130, 246, 0.08));
        transition: opacity 0.25s ease, filter 0.25s ease;
      }
      
      /* 聚焦行的左边框指示器 */
      .ec-focus-mode .ec-line[data-focus="true"]::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--ec-focus-border-color, #3b82f6);
        border-radius: 0 2px 2px 0;
      }
      
      /* 鼠标悬浮时恢复全部显示 */
      .ec-focus-mode:hover .ec-line:not([data-focus="true"]) {
        opacity: 1;
        filter: none;
      }
      
      /* 深色模式适配 */
      :root.dark .ec-focus-mode {
        --ec-focus-bg-color: ${backgroundColor || 'rgba(59, 130, 246, 0.12)'};
      }
    `,

                hooks: {
                        // 1. 解析 meta 和注释中的 focus 标记
                        preprocessMetadata: ({ codeBlock }) => {
                                const data = focusData.getOrCreateFor(codeBlock)

                                // 解析 meta 中的 focus=1-3,5,7-9 参数
                                // getRange 返回的是字符串，需要自己解析
                                const focusRangeStr = codeBlock.metaOptions.getRange('focus')
                                if (focusRangeStr) {
                                        const ranges = parseRangeString(focusRangeStr)
                                        for (const [start, end] of ranges) {
                                                for (let i = start; i <= end; i++) {
                                                        data.focusedLines.add(i - 1) // 转换为 0-indexed
                                                }
                                        }
                                }

                                // 也支持多个 focus 参数返回数组
                                const allFocusRanges = codeBlock.metaOptions.getRanges('focus')
                                for (const rangeStr of allFocusRanges) {
                                        const ranges = parseRangeString(rangeStr)
                                        for (const [start, end] of ranges) {
                                                for (let i = start; i <= end; i++) {
                                                        data.focusedLines.add(i - 1)
                                                }
                                        }
                                }

                                // 解析行内 // [!focus] 或 // [!focus:N] 注释
                                const lines = codeBlock.getLines()
                                lines.forEach((line, index) => {
                                        const text = line.text

                                        // 匹配 // [!focus] 或 // [!focus:3]
                                        const focusMatch = text.match(/\/\/\s*\[!focus(?::(\d+))?\]/)
                                        if (focusMatch) {
                                                const count = focusMatch[1] ? parseInt(focusMatch[1], 10) : 1
                                                // 从当前行开始，聚焦 count 行
                                                for (let i = 0; i < count && index + i < lines.length; i++) {
                                                        data.focusedLines.add(index + i)
                                                }
                                        }

                                        // 也支持 # [!focus] 格式（Python/Ruby 等）
                                        const hashFocusMatch = text.match(/#\s*\[!focus(?::(\d+))?\]/)
                                        if (hashFocusMatch) {
                                                const count = hashFocusMatch[1] ? parseInt(hashFocusMatch[1], 10) : 1
                                                for (let i = 0; i < count && index + i < lines.length; i++) {
                                                        data.focusedLines.add(index + i)
                                                }
                                        }
                                })
                        },

                        // 2. 从代码中移除 [!focus] 注释（可选，保持代码整洁）
                        preprocessCode: ({ codeBlock }) => {
                                codeBlock.getLines().forEach(line => {
                                        const text = line.text
                                        // 移除 // [!focus] 或 // [!focus:N] 注释
                                        const slashMatch = text.match(/\s*\/\/\s*\[!focus(?::\d+)?\]\s*$/)
                                        if (slashMatch) {
                                                const matchStart = text.indexOf(slashMatch[0])
                                                // editText(columnStart, columnEnd, newText) - 替换指定范围
                                                line.editText(matchStart, text.length, '')
                                        }

                                        // 移除 # [!focus] 注释
                                        const hashMatch = text.match(/\s*#\s*\[!focus(?::\d+)?\]\s*$/)
                                        if (hashMatch) {
                                                const matchStart = text.indexOf(hashMatch[0])
                                                line.editText(matchStart, text.length, '')
                                        }
                                })
                        },

                        // 3. 给聚焦行添加 data-focus 属性
                        postprocessRenderedLine: ({ lineIndex, renderData, codeBlock }) => {
                                const data = focusData.getOrCreateFor(codeBlock)

                                if (data.focusedLines.has(lineIndex)) {
                                        renderData.lineAst.properties['data-focus'] = 'true'
                                }
                        },

                        // 4. 给代码块添加聚焦模式 class
                        postprocessRenderedBlock: ({ codeBlock, renderData }) => {
                                const data = focusData.getOrCreateFor(codeBlock)

                                // 只有存在聚焦行时才添加聚焦模式
                                if (data.focusedLines.size > 0) {
                                        const existingClass = renderData.blockAst.properties.className
                                        const classNames: string[] = Array.isArray(existingClass)
                                                ? existingClass.filter((c): c is string => typeof c === 'string')
                                                : (typeof existingClass === 'string' ? [existingClass] : [])

                                        renderData.blockAst.properties.className = [...classNames, 'ec-focus-mode']
                                }
                        }
                }
        })
}

export default pluginFocus

