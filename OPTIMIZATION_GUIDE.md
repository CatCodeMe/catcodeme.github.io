# Astro MDX 组件加载优化方案

## 问题诊断

经过分析，发现页面加载缓慢的根本原因是：

1. **Barrel Export 问题**: `astro-pure/user` 通过 `index.ts` 导出所有 18 个组件
2. **间接依赖**: 布局文件（BaseLayout, ContentLayout, BlogPost）中导入了 `astro-pure/user` 的组件
3. **模块打包**: 即使页面不使用某些组件，构建工具仍会加载整个 barrel export

## 解决方案

### 方案 1: 使用直接导入路径（推荐 ⭐⭐⭐⭐⭐）

修改所有使用 `astro-pure/user` 的导入，改为直接导入具体文件。

**优点**:
- 立即生效，无需修改配置
- Tree-shaking 效果最佳
- 减少 90%+ 的不必要模块加载

**实施步骤**:

1. 全局替换导入语句：

```typescript
// ❌ 旧方式 - 会加载所有组件
import { Button, Icon } from 'astro-pure/user'

// ✅ 新方式 - 只加载需要的组件
import Button from 'astro-pure/components/user/Button.astro'
import Icon from 'astro-pure/components/user/Icon.astro'
```

2. 修改 `packages/pure/package.json`,添加子路径导出：

```json
"exports": {
  ".": "./index.ts",
  "./user": "./components/user/index.ts",
  "./user/*": "./components/user/*.astro",  // 新增
  "./advanced": "./components/advanced/index.ts",
  "./advanced/*": "./components/advanced/*.astro",  // 新增
  "./components/pages": "./components/pages/index.ts",
  "./components/pages/*": "./components/pages/*.astro",  // 新增
  // ... 其他导出
}
```

3. 然后可以这样导入：

```typescript
import Button from 'astro-pure/user/Button'
import Icon from 'astro-pure/user/Icon'
```

### 方案 2: 配置 Vite 优化依赖（辅助方案 ⭐⭐⭐）

在 `astro.config.mjs` 的 `vite` 配置中添加：

```javascript
vite: {
  optimizeDeps: {
    include: ['@excalidraw/excalidraw', 'roughjs', 'clsx'],
    // 排除不需要预构建的包
    exclude: ['astro-pure']
  },
  build: {
    rollupOptions: {
      output: {
        // 代码分割策略
        manualChunks(id) {
          // 将每个 pure 组件打包到独立 chunk
          if (id.includes('packages/pure/components/user/')) {
            const match = id.match(/components\/user\/([^/]+)\.astro/)
            if (match) return `pure-user-${match[1]}`
          }
        }
      }
    }
  }
}
```

### 方案 3: 懒加载组件（针对客户端组件 ⭐⭐⭐⭐）

对于 React 组件（如 Excalidraw），使用 Astro 的 `client:` 指令进行懒加载：

```astro
---
// 服务端不加载
---

<Excalidraw 
  snapshotUrl="/excalidraw/test.excalidraw" 
  client:visible  <!-- 只在可见时加载 -->
>
```

支持的指令：
- `client:load` - 页面加载时
- `client:idle` - 页面空闲时
- `client:visible` - 组件可见时（推荐）
- `client:media={QUERY}` - 媒体查询匹配时
- `client:only="react"` - 仅客户端

## 推荐实施顺序

1. **立即执行**: 方案 1 - 修改导入路径
2. **短期优化**: 方案 3 - 为客户端组件添加懒加载
3. **长期优化**: 方案 2 - 配置构建优化

## 预期效果

实施方案 1 后：
- **减少请求数量**: 从 200+ 降至 20-30
- **首屏加载时间**: 减少 60-80%
- **按需加载**: 只加载页面实际使用的组件

## 自动化脚本

可以使用以下脚本批量替换导入：

```bash
# 查找所有使用 barrel import 的文件
find src -name "*.astro" -o -name "*.mdx" | xargs grep -l "from 'astro-pure/user'"

# 建议手动替换，或使用 sed/awk 批量处理
```
