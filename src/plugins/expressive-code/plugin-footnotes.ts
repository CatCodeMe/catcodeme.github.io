/**
 * Expressive Code Plugin: Footnotes
 * 
 * 为代码行添加注释说明，类似学术论文脚注。
 * 
 * ## 使用语法
 * 
 * ### 手动编号（推荐）
 * ```js
 * import express from 'express' // [!note:1] Express Web 框架
 * const app = express() // [!note:2] 创建实例
 * ```
 * 
 * ### 自动编号
 * ```js
 * import a from 'a' // [!note] 自动分配编号 1
 * import b from 'b' // [!note] 自动分配编号 2
 * ```
 * 
 * Python/Ruby 使用 `# [!note:N]` 或 `# [!note]`。
 * 
 * ## 编号规则
 * - 手动编号：你指定什么就显示什么
 * - 自动编号：按出现顺序从 1 递增
 * - 脚注区域按编号排序，相同编号去重
 */

import { definePlugin, AttachedPluginData } from '@expressive-code/core'
import { h } from 'hastscript'

// Emoji 数字序列
const EMOJI_NUMBERS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

function getEmojiNumber(num: number): string {
        if (num >= 1 && num <= 10) {
                return EMOJI_NUMBERS[num - 1]
        }
        if (num <= 99) {
                const tens = Math.floor(num / 10)
                const ones = num % 10
                if (ones === 0) {
                        return EMOJI_NUMBERS[tens - 1] + '0️⃣'
                }
                return EMOJI_NUMBERS[tens - 1] + EMOJI_NUMBERS[ones - 1]
        }
        return String(num)
}

// 插件配置选项
export interface PluginFootnotesOptions {
        /** 是否使用 Emoji 数字，默认 true */
        useEmoji?: boolean
        /** 脚注区域的标题（可选） */
        footnotesTitle?: string
}

// 存储每个代码块的脚注数据
interface FootnoteData {
        notes: Array<{
                lineIndex: number
                noteNumber: number
                text: string
        }>
}

const footnoteData = new AttachedPluginData<FootnoteData>(() => ({ notes: [] }))

export function pluginFootnotes(options: PluginFootnotesOptions = {}) {
        const {
                useEmoji = true,
                footnotesTitle = '',
        } = options

        return definePlugin({
                name: 'Footnotes',

                baseStyles: `
      /* ========== 脚注标记 - 代码行内 ========== */
      .ec-footnote-marker {
        display: inline;
        margin-left: 0.75em;
        font-size: 0.85em;
        cursor: help;
        user-select: none;
        vertical-align: baseline;
        opacity: 0.85;
        transition: opacity 0.15s ease, transform 0.15s ease;
      }
      
      .ec-footnote-marker:hover {
        opacity: 1;
        transform: scale(1.15);
      }
      
      /* ========== 脚注区域 - 悬浮卡片式 ========== */
      .ec-footnotes-area {
        margin: 0.625rem 0.5rem 0.5rem 0.5rem;
        padding: 0.625rem 0.875rem;
        background: rgba(128, 128, 128, 0.06);
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.8rem;
        line-height: 1.6;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        transition: background 0.2s ease, box-shadow 0.2s ease;
      }
      
      :root.dark .ec-footnotes-area {
        background: rgba(255, 255, 255, 0.04);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }
      
      .ec-footnotes-area:hover {
        background: rgba(128, 128, 128, 0.08);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
      
      :root.dark .ec-footnotes-area:hover {
        background: rgba(255, 255, 255, 0.06);
      }
      
      .ec-footnotes-title {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--sl-color-text);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.375rem;
        opacity: 0.5;
      }
      
      .ec-footnotes-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .ec-footnote-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        color: var(--sl-color-text);
        opacity: 0.85;
      }
      
      .ec-footnote-item-number {
        flex-shrink: 0;
        font-size: 1em;
        line-height: 1.6;
      }
      
      .ec-footnote-item-text {
        flex: 1;
      }
    `,

                hooks: {
                        // 1. 解析注释中的 [!note] 标记
                        preprocessMetadata: ({ codeBlock }) => {
                                const data = footnoteData.getOrCreateFor(codeBlock)
                                let autoNumber = 1

                                const lines = codeBlock.getLines()
                                lines.forEach((line, index) => {
                                        const text = line.text

                                        // // [!note:N] 内容 (手动编号)
                                        let match = text.match(/\/\/\s*\[!note:(\d+)\]\s*(.+)$/)
                                        if (match) {
                                                data.notes.push({
                                                        lineIndex: index,
                                                        noteNumber: parseInt(match[1], 10),
                                                        text: match[2].trim()
                                                })
                                                return
                                        }

                                        // // [!note] 内容 (自动编号)
                                        match = text.match(/\/\/\s*\[!note\]\s*(.+)$/)
                                        if (match) {
                                                data.notes.push({
                                                        lineIndex: index,
                                                        noteNumber: autoNumber++,
                                                        text: match[1].trim()
                                                })
                                                return
                                        }

                                        // # [!note:N] 内容 (Python 手动编号)
                                        match = text.match(/#\s*\[!note:(\d+)\]\s*(.+)$/)
                                        if (match) {
                                                data.notes.push({
                                                        lineIndex: index,
                                                        noteNumber: parseInt(match[1], 10),
                                                        text: match[2].trim()
                                                })
                                                return
                                        }

                                        // # [!note] 内容 (Python 自动编号)
                                        match = text.match(/#\s*\[!note\]\s*(.+)$/)
                                        if (match) {
                                                data.notes.push({
                                                        lineIndex: index,
                                                        noteNumber: autoNumber++,
                                                        text: match[1].trim()
                                                })
                                        }
                                })
                        },

                        // 2. 从代码中移除 [!note] 注释
                        preprocessCode: ({ codeBlock }) => {
                                codeBlock.getLines().forEach(line => {
                                        const text = line.text

                                        const patterns = [
                                                /\s*\/\/\s*\[!note:\d+\]\s*.+$/,
                                                /\s*\/\/\s*\[!note\]\s*.+$/,
                                                /\s*#\s*\[!note:\d+\]\s*.+$/,
                                                /\s*#\s*\[!note\]\s*.+$/
                                        ]

                                        for (const pattern of patterns) {
                                                const match = text.match(pattern)
                                                if (match) {
                                                        const matchStart = text.indexOf(match[0])
                                                        line.editText(matchStart, text.length, '')
                                                        return
                                                }
                                        }
                                })
                        },

                        // 3. 给有脚注的行添加 Emoji 标记
                        postprocessRenderedLine: ({ lineIndex, renderData, codeBlock }) => {
                                const data = footnoteData.getOrCreateFor(codeBlock)

                                const note = data.notes.find(n => n.lineIndex === lineIndex)

                                if (note) {
                                        const displayNumber = useEmoji
                                                ? getEmojiNumber(note.noteNumber)
                                                : String(note.noteNumber)

                                        const markerElement = h('span.ec-footnote-marker', {
                                                'data-footnote': note.noteNumber,
                                                'title': note.text,
                                                'aria-label': 'Note ' + note.noteNumber + ': ' + note.text,
                                        }, displayNumber)

                                        // 找到 .code 容器并将标记添加到其内部
                                        const lineChildren = renderData.lineAst.children as Array<{
                                                type?: string
                                                properties?: { className?: string | string[] }
                                                children?: unknown[]
                                        }>

                                        const codeContainer = lineChildren.find(child => {
                                                if (child.type === 'element' && child.properties) {
                                                        const className = child.properties.className
                                                        if (Array.isArray(className)) {
                                                                return className.includes('code')
                                                        }
                                                        return className === 'code'
                                                }
                                                return false
                                        })

                                        if (codeContainer && codeContainer.children) {
                                                codeContainer.children.push(markerElement)
                                        } else {
                                                renderData.lineAst.children.push(markerElement)
                                        }
                                }
                        },

                        // 4. 在代码块后添加脚注列表
                        postprocessRenderedBlock: ({ codeBlock, renderData }) => {
                                const data = footnoteData.getOrCreateFor(codeBlock)

                                if (data.notes.length === 0) return

                                // 按编号排序并去重
                                const uniqueNotes = new Map<number, string>()
                                data.notes.forEach(note => {
                                        if (!uniqueNotes.has(note.noteNumber)) {
                                                uniqueNotes.set(note.noteNumber, note.text)
                                        }
                                })

                                const sortedNotes = Array.from(uniqueNotes.entries()).sort((a, b) => a[0] - b[0])

                                const listItems = sortedNotes.map(([num, text]) => {
                                        const displayNumber = useEmoji
                                                ? getEmojiNumber(num)
                                                : String(num)

                                        return h('li.ec-footnote-item', [
                                                h('span.ec-footnote-item-number', displayNumber),
                                                h('span.ec-footnote-item-text', text)
                                        ])
                                })

                                const footnotesSection = h('div.ec-footnotes-area', [
                                        ...(footnotesTitle ? [h('div.ec-footnotes-title', footnotesTitle)] : []),
                                        h('ul.ec-footnotes-list', listItems)
                                ])

                                renderData.blockAst.children.push(footnotesSection)
                        }
                }
        })
}

export default pluginFootnotes
