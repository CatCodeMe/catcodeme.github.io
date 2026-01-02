# Expressive Code 插件开发方案

本文档描述了为 Expressive Code 开发自定义插件的技术方案，实现类似 Code Hike 的特色功能。

## 📋 功能清单

我们计划开发以下 4 个插件：

| 插件名称 | 功能描述 | 优先级 | 复杂度 |
|----------|----------|--------|--------|
| `plugin-auto-fold` | 长代码自动折叠 | 🔥 高 | ⭐⭐ 中等 |
| `plugin-callout` | 代码气泡注释 | 🔥 高 | ⭐⭐⭐ 较高 |
| `plugin-footnotes` | 代码脚注 | ⭐ 中 | ⭐⭐ 中等 |
| `plugin-focus` | 聚焦高亮/淡化 | 🔥 高 | ⭐⭐ 中等 |

---

## 1️⃣ Plugin: Auto Fold（自动折叠）

### 功能描述
当代码块超过指定行数时，自动折叠多余的行，底部显示"展开更多"按钮。

### 使用语法
```markdown
```js maxLines=15
// 超过 15 行的代码会自动折叠
function example() {
  // ... 很多代码
}
\```
```

或者全局配置默认值：
```js
// ec.config.mjs
plugins: [
  pluginAutoFold({ defaultMaxLines: 20 })
]
```

### 技术方案

#### Hook 选择
- `preprocessMetadata`: 解析 `maxLines` 参数
- `postprocessRenderedBlock`: 在渲染后添加折叠容器和按钮

#### 实现思路
1. 解析 meta 中的 `maxLines=N` 参数
2. 如果代码行数超过 N，在 `postprocessRenderedBlock` 中：
   - 给 `.expressive-code` 添加 `data-auto-fold` 属性
   - 添加 CSS 类控制 `max-height` 和 `overflow: hidden`
   - 在 `<code>` 元素后插入展开按钮的 HTML
3. 通过 `jsModules` 添加客户端 JS：
   - 点击按钮时移除折叠 CSS 类
   - 可选：添加平滑过渡动画

#### 核心代码结构
```typescript
import { definePlugin } from '@expressive-code/core'
import { select } from '@expressive-code/core/hast'
import { h } from 'hastscript'

export interface AutoFoldOptions {
  defaultMaxLines?: number  // 默认: 20
  buttonText?: string       // 默认: '展开全部 ({remaining} 行)'
}

export function pluginAutoFold(options: AutoFoldOptions = {}) {
  const { defaultMaxLines = 20, buttonText = '展开全部 ({remaining} 行)' } = options
  
  return definePlugin({
    name: 'Auto Fold',
    baseStyles: `
      .ec-auto-fold {
        position: relative;
        max-height: var(--ec-fold-height);
        overflow: hidden;
      }
      .ec-auto-fold::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3em;
        background: linear-gradient(transparent, var(--sl-color-bg));
        pointer-events: none;
      }
      .ec-fold-button {
        // 按钮样式
      }
      .ec-auto-fold.expanded {
        max-height: none;
      }
      .ec-auto-fold.expanded::after {
        display: none;
      }
    `,
    jsModules: `
      document.querySelectorAll('.ec-fold-button').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.closest('.ec-auto-fold')?.classList.add('expanded');
          btn.remove();
        });
      });
    `,
    hooks: {
      preprocessMetadata: ({ codeBlock }) => {
        const maxLines = codeBlock.metaOptions.getInteger('maxLines') ?? defaultMaxLines
        // 存储到 props
        codeBlock.props.maxLines = maxLines
      },
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const maxLines = codeBlock.props.maxLines
        const lineCount = codeBlock.getLines().length
        
        if (lineCount <= maxLines) return
        
        const wrapper = renderData.blockAst
        // 添加折叠类和数据属性
        wrapper.properties.className = [...(wrapper.properties.className || []), 'ec-auto-fold']
        wrapper.properties.style = `--ec-fold-height: calc(${maxLines} * 1.4em + 2em);`
        
        // 插入展开按钮
        const remaining = lineCount - maxLines
        const button = h('button.ec-fold-button', {
          type: 'button',
          'aria-label': 'Expand code'
        }, buttonText.replace('{remaining}', String(remaining)))
        
        wrapper.children.push(button)
      }
    }
  })
}
```

---

## 2️⃣ Plugin: Callout（代码气泡注释）

### 功能描述
在代码的特定位置添加气泡形式的注释，带有指向代码的箭头。

### 使用语法
```markdown
```js
const foo = bar() // [!callout] 这是一个重要的函数调用
const result = process(foo) // [!callout type="warning"] 注意这里可能会抛出异常
\```
```

### 技术方案

#### Hook 选择
- `preprocessMetadata`: 解析 `// [!callout]` 注释
- `preprocessCode`: 从代码中移除注释语法
- `annotateCode`: 添加 CalloutAnnotation
- `postprocessRenderedLine`: 在渲染后添加气泡 HTML

#### 实现思路
1. 用正则匹配 `// [!callout] 内容` 或 `// [!callout type="xxx"] 内容`
2. 创建自定义 `CalloutAnnotation` 类
3. 在行渲染后插入气泡元素
4. 气泡使用绝对定位，箭头指向注释所在的列位置

#### Callout 类型
- `info` (默认): 蓝色气泡
- `warning`: 黄色气泡
- `error`: 红色气泡
- `tip`: 绿色气泡

#### 核心代码结构
```typescript
import { definePlugin, ExpressiveCodeAnnotation } from '@expressive-code/core'
import { h } from 'hastscript'

// 自定义 Annotation
class CalloutAnnotation extends ExpressiveCodeAnnotation {
  constructor(
    public message: string,
    public type: 'info' | 'warning' | 'error' | 'tip' = 'info',
    public column: number
  ) {
    super({ /* range options */ })
  }
  
  render({ nodesToTransform }) {
    // 保持原始节点不变，气泡在 postprocessRenderedLine 中添加
    return nodesToTransform
  }
}

export function pluginCallout() {
  return definePlugin({
    name: 'Callout',
    baseStyles: `
      .ec-callout {
        position: relative;
        margin-top: 0.5em;
        padding: 0.5em 0.75em;
        border-radius: 6px;
        font-size: 0.85em;
        background: var(--ec-callout-bg);
        color: var(--ec-callout-fg);
      }
      .ec-callout::before {
        content: '';
        position: absolute;
        top: -6px;
        left: var(--ec-callout-arrow-pos);
        border: 6px solid transparent;
        border-bottom-color: var(--ec-callout-bg);
      }
      .ec-callout.info { --ec-callout-bg: #1e40af20; --ec-callout-fg: #3b82f6; }
      .ec-callout.warning { --ec-callout-bg: #a1630020; --ec-callout-fg: #f59e0b; }
      .ec-callout.error { --ec-callout-bg: #dc262620; --ec-callout-fg: #ef4444; }
      .ec-callout.tip { --ec-callout-bg: #16a34a20; --ec-callout-fg: #22c55e; }
    `,
    hooks: {
      preprocessMetadata: ({ codeBlock }) => {
        // 解析每一行的 callout 注释
        codeBlock.getLines().forEach((line, index) => {
          const match = line.text.match(/\/\/\s*\[!callout(?:\s+type="(\w+)")?\]\s*(.+)$/)
          if (match) {
            const [fullMatch, type, message] = match
            const column = line.text.indexOf(fullMatch)
            
            line.addAnnotation(new CalloutAnnotation(
              message,
              (type || 'info') as any,
              column
            ))
          }
        })
      },
      preprocessCode: ({ codeBlock }) => {
        // 从代码中移除 callout 注释
        codeBlock.getLines().forEach(line => {
          line.editText(line.text.replace(/\s*\/\/\s*\[!callout[^\]]*\]\s*.+$/, ''))
        })
      },
      postprocessRenderedLine: ({ line, renderData }) => {
        const callouts = line.getAnnotations().filter(a => a instanceof CalloutAnnotation)
        
        callouts.forEach(callout => {
          const bubble = h('div.ec-callout', {
            className: callout.type,
            style: `--ec-callout-arrow-pos: ${callout.column}ch;`
          }, callout.message)
          
          // 在行后面添加气泡
          renderData.lineAst.children.push(bubble)
        })
      }
    }
  })
}
```

---

## 3️⃣ Plugin: Footnotes（代码脚注）

### 功能描述
在代码行尾添加数字标记，对应的脚注显示在代码块下方。

### 使用语法
```markdown
```js
import express from 'express' // [!note] 这是 Express 框架的导入
const app = express() // [!note] 创建 Express 应用实例

app.listen(3000) // [!note] 在 3000 端口启动服务器
\```
```

渲染效果：
```
import express from 'express' ¹
const app = express() ²
app.listen(3000) ³

───────────────────────────
¹ 这是 Express 框架的导入
² 创建 Express 应用实例
³ 在 3000 端口启动服务器
```

### 技术方案

#### Hook 选择
- `preprocessMetadata`: 解析 `// [!note]` 注释并存储
- `preprocessCode`: 移除注释语法
- `annotateCode`: 添加脚注编号标记
- `postprocessRenderedBlock`: 在代码块后添加脚注列表

#### 实现思路
1. 收集所有 `// [!note] 内容` 注释
2. 按出现顺序分配编号（①②③ 或 ¹²³）
3. 在每行末尾添加小标签显示编号
4. 代码块渲染完成后，添加脚注列表 `<ol>` 或 `<ul>`

#### 核心代码结构
```typescript
import { definePlugin, AttachedPluginData } from '@expressive-code/core'
import { h } from 'hastscript'

interface FootnoteData {
  notes: Array<{ lineIndex: number; text: string }>
}

const footnoteData = new AttachedPluginData<FootnoteData>(() => ({ notes: [] }))

export function pluginFootnotes() {
  return definePlugin({
    name: 'Footnotes',
    baseStyles: `
      .ec-footnote-marker {
        display: inline-block;
        min-width: 1.2em;
        height: 1.2em;
        margin-left: 0.5em;
        padding: 0 0.3em;
        font-size: 0.7em;
        line-height: 1.2em;
        text-align: center;
        background: var(--ec-footnote-bg, #3b82f630);
        color: var(--ec-footnote-fg, #3b82f6);
        border-radius: 50%;
        vertical-align: super;
      }
      .ec-footnotes {
        margin-top: 0.75em;
        padding-top: 0.75em;
        border-top: 1px dashed var(--sl-color-gray-5);
        font-size: 0.85em;
      }
      .ec-footnotes li {
        margin: 0.25em 0;
        padding-left: 0.5em;
      }
      .ec-footnotes li::marker {
        color: var(--ec-footnote-fg, #3b82f6);
      }
    `,
    hooks: {
      preprocessMetadata: ({ codeBlock }) => {
        const data = footnoteData.getOrCreateFor(codeBlock)
        
        codeBlock.getLines().forEach((line, index) => {
          const match = line.text.match(/\/\/\s*\[!note\]\s*(.+)$/)
          if (match) {
            data.notes.push({ lineIndex: index, text: match[1] })
          }
        })
      },
      preprocessCode: ({ codeBlock }) => {
        codeBlock.getLines().forEach(line => {
          line.editText(line.text.replace(/\s*\/\/\s*\[!note\]\s*.+$/, ''))
        })
      },
      postprocessRenderedLine: ({ line, lineIndex, renderData, codeBlock }) => {
        const data = footnoteData.getOrCreateFor(codeBlock)
        const noteIndex = data.notes.findIndex(n => n.lineIndex === lineIndex)
        
        if (noteIndex !== -1) {
          const marker = h('span.ec-footnote-marker', {}, String(noteIndex + 1))
          renderData.lineAst.children.push(marker)
        }
      },
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const data = footnoteData.getOrCreateFor(codeBlock)
        if (data.notes.length === 0) return
        
        const list = h('ol.ec-footnotes', {},
          data.notes.map((note, i) => h('li', {}, note.text))
        )
        
        renderData.blockAst.children.push(list)
      }
    }
  })
}
```

---

## 4️⃣ Plugin: Focus（聚焦高亮/淡化）

### 功能描述
高亮指定的代码行，其他行淡化显示，引导读者关注重点代码。

### 使用语法
```markdown
```js focus=3-5
function example() {
  const a = 1
  const b = 2    // 这三行会高亮
  const c = 3    // 
  const d = 4    // 
  return a + b + c + d
}
\```
```

或者使用注释语法：
```markdown
```js
function example() {
  const a = 1
  const b = 2    // [!focus]
  const c = 3    // [!focus]
  const d = 4    // [!focus]
  return a + b + c + d
}
\```
```

### 技术方案

#### 与现有功能的区别
Expressive Code 已有 text-markers 可以高亮行，但我们的 Focus 插件有以下增强：
1. **淡化非聚焦行**：其他行变成半透明
2. **悬浮恢复**：鼠标悬浮时恢复全部显示
3. **平滑过渡**：淡化/恢复有动画效果

#### Hook 选择
- `preprocessMetadata`: 解析 `focus=` 参数或 `// [!focus]` 注释
- `postprocessRenderedLine`: 给行添加 `data-focus` 或 `data-dim` 属性

#### 核心代码结构
```typescript
import { definePlugin, AttachedPluginData } from '@expressive-code/core'

interface FocusData {
  focusedLines: Set<number>
}

const focusData = new AttachedPluginData<FocusData>(() => ({ focusedLines: new Set() }))

export function pluginFocus() {
  return definePlugin({
    name: 'Focus',
    baseStyles: `
      /* 有聚焦行时，代码块进入聚焦模式 */
      .ec-focus-mode .ec-line {
        opacity: 0.4;
        filter: blur(0.5px);
        transition: opacity 0.2s, filter 0.2s;
      }
      .ec-focus-mode .ec-line[data-focus="true"] {
        opacity: 1;
        filter: none;
        background: var(--ec-focus-bg, rgba(59, 130, 246, 0.1));
        border-left: 3px solid var(--ec-focus-border, #3b82f6);
        margin-left: -3px;
        padding-left: 3px;
      }
      /* 悬浮时恢复全部显示 */
      .ec-focus-mode:hover .ec-line {
        opacity: 1;
        filter: none;
      }
      .ec-focus-mode:hover .ec-line[data-focus="true"] {
        background: var(--ec-focus-bg, rgba(59, 130, 246, 0.1));
      }
    `,
    hooks: {
      preprocessMetadata: ({ codeBlock }) => {
        const data = focusData.getOrCreateFor(codeBlock)
        
        // 解析 meta 中的 focus=1-3,5,7-9
        const focusRanges = codeBlock.metaOptions.getRanges('focus')
        focusRanges?.forEach(range => {
          for (let i = range.from; i <= range.to; i++) {
            data.focusedLines.add(i - 1) // 0-indexed
          }
        })
        
        // 解析行内 // [!focus] 注释
        codeBlock.getLines().forEach((line, index) => {
          if (line.text.includes('[!focus]')) {
            data.focusedLines.add(index)
          }
        })
      },
      preprocessCode: ({ codeBlock }) => {
        // 移除 [!focus] 注释
        codeBlock.getLines().forEach(line => {
          if (line.text.includes('[!focus]')) {
            line.editText(line.text.replace(/\s*\/\/\s*\[!focus\]/, ''))
          }
        })
      },
      postprocessRenderedLine: ({ lineIndex, renderData, codeBlock }) => {
        const data = focusData.getOrCreateFor(codeBlock)
        
        if (data.focusedLines.has(lineIndex)) {
          renderData.lineAst.properties['data-focus'] = 'true'
        }
      },
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const data = focusData.getOrCreateFor(codeBlock)
        
        if (data.focusedLines.size > 0) {
          const className = renderData.blockAst.properties.className || []
          renderData.blockAst.properties.className = [...className, 'ec-focus-mode']
        }
      }
    }
  })
}
```

---

## 🗂️ 项目结构

建议的目录结构：

```
src/
├── plugins/
│   └── expressive-code/
│       ├── index.ts                 # 统一导出
│       ├── plugin-auto-fold.ts      # 自动折叠
│       ├── plugin-callout.ts        # 气泡注释
│       ├── plugin-footnotes.ts      # 代码脚注
│       └── plugin-focus.ts          # 聚焦高亮
```

在 `ec.config.mjs` 中使用：

```javascript
import { pluginAutoFold } from './src/plugins/expressive-code/plugin-auto-fold'
import { pluginCallout } from './src/plugins/expressive-code/plugin-callout'
import { pluginFootnotes } from './src/plugins/expressive-code/plugin-footnotes'
import { pluginFocus } from './src/plugins/expressive-code/plugin-focus'

export default defineEcConfig({
  plugins: [
    pluginLineNumbers(),
    pluginCollapsibleSections(),
    pluginFileIcons({ /* ... */ }),
    // 自定义插件
    pluginAutoFold({ defaultMaxLines: 25 }),
    pluginCallout(),
    pluginFootnotes(),
    pluginFocus(),
  ],
  // ...
})
```

---

## 📅 开发优先级建议

1. **Phase 1**: `plugin-focus` (最简单，效果明显)
2. **Phase 2**: `plugin-auto-fold` (用户需求高)
3. **Phase 3**: `plugin-footnotes` (实用性强)
4. **Phase 4**: `plugin-callout` (最复杂，需要更多测试)

---

## ⚠️ 注意事项

1. **与现有插件兼容**: 注意不要与 `plugin-collapsible-sections` 或 `text-markers` 冲突
2. **主题适配**: 颜色应该支持 light/dark 模式
3. **性能**: 避免在大代码块上有过多 DOM 操作
4. **可访问性**: 按钮需要合适的 aria 属性
5. **国际化**: 可以考虑支持多语言文本

---

## 🚀 下一步

准备好开始开发了吗？我建议从 `plugin-focus` 开始，因为它：
- 实现相对简单
- 效果直观
- 可以快速验证我们的插件开发流程

确认后我就开始写代码！
