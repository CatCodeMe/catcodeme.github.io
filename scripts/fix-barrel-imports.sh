#!/usr/bin/env bash

# 脚本用于批量将 astro-pure barrel imports 转换为直接导入
# 使用方法: bash scripts/fix-barrel-imports.sh

set -e

echo "🔍 正在查找使用 barrel imports 的文件..."

# 定义需要处理的目录
DIRS=("src/layouts" "src/pages" "src/components" "src/content/blog")

# 统计信息
total_files=0
modified_files=0

# 临时文件
temp_file=$(mktemp)

for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    continue
  fi
  
  echo "📂 处理目录: $dir"
  
  # 查找所有 .astro 和 .mdx 文件
  find "$dir" -type f \( -name "*.astro" -o -name "*.mdx" \) | while read -r file; do
    ((total_files++))
    modified=false
    
    # 创建临时文件副本
    cp "$file" "$temp_file"
    
    # 处理各种 barrel import 模式
    # 1. Button
    if grep -q "from 'astro-pure/user'" "$file" && grep -q "Button" "$file"; then
      sed -i.bak "s/import { Button } from 'astro-pure\/user'/import Button from 'astro-pure\/user\/Button.astro'/g" "$file"
      sed -i.bak "s/import { Button, \([^}]*\) } from 'astro-pure\/user'/import Button from 'astro-pure\/user\/Button.astro'\nimport { \1 } from 'astro-pure\/user'/g" "$file"
      modified=true
    fi
    
    # 2. Icon
    if grep -q "from 'astro-pure/user'" "$file" && grep -q "Icon" "$file"; then
      sed -i.bak "s/import { Icon } from 'astro-pure\/user'/import Icon from 'astro-pure\/user\/Icon.astro'/g" "$file"
      modified=true
    fi
    
    # 3. Collapse
    if grep -q "from 'astro-pure/user'" "$file" && grep -q "Collapse" "$file"; then
      sed -i.bak "s/import { Collapse } from 'astro-pure\/user'/import Collapse from 'astro-pure\/user\/Collapse.astro'/g" "$file"
      modified=true
    fi
    
    # 4. Tabs 和 TabItem (通常一起使用)
    if grep -q "from 'astro-pure/user'" "$file" && grep -q "Tabs" "$file"; then
      sed -i.bak "s/import { Tabs, TabItem } from 'astro-pure\/user'/import Tabs from 'astro-pure\/user\/Tabs.astro'\nimport TabItem from 'astro-pure\/user\/TabItem.astro'/g" "$file"
      sed -i.bak "s/import { TabItem, Tabs } from 'astro-pure\/user'/import Tabs from 'astro-pure\/user\/Tabs.astro'\nimport TabItem from 'astro-pure\/user\/TabItem.astro'/g" "$file"
      modified=true
    fi
    
    # 5. Steps
    if grep -q "from 'astro-pure/user'" "$file" && grep -q "Steps" "$file"; then
      sed -i.bak "s/import { Steps } from 'astro-pure\/user'/import Steps from 'astro-pure\/user\/Steps.astro'/g" "$file"
      modified=true
    fi
    
    # 6. MdxRepl
    if grep -q "from 'astro-pure/user'" "$file" && grep -q "MdxRepl" "$file"; then
      sed -i.bak "s/import { MdxRepl } from 'astro-pure\/user'/import MdxRepl from 'astro-pure\/user\/MdxRepl.astro'/g" "$file"
      modified=true
    fi
    
    # 7. Aside
    if grep -q "from 'astro-pure/user'" "$file" && grep -q "Aside" "$file"; then
      sed -i.bak "s/import { Aside } from 'astro-pure\/user'/import Aside from 'astro-pure\/user\/Aside.astro'/g" "$file"
      modified=true
    fi
    
    # 8. Timeline 和 TimelineItem
    if grep -q "from 'astro-pure/user'" "$file" && grep -q "Timeline" "$file"; then
      sed -i.bak "s/import { Timeline, TimelineItem } from 'astro-pure\/user'/import Timeline from 'astro-pure\/user\/Timeline.astro'\nimport TimelineItem from 'astro-pure\/user\/TimelineItem.astro'/g" "$file"
      modified=true
    fi
    
    # 清理备份文件
    rm -f "${file}.bak"
    
    if [ "$modified" = true ]; then
      ((modified_files++))
      echo "  ✅ 已修改: $file"
    fi
  done
done

echo ""
echo "✨ 完成!"
echo "📊 统计:"
echo "  - 检查的文件数: $total_files"
echo "  - 修改的文件数: $modified_files"
echo ""
echo "⚠️  请注意:"
echo "  1. 此脚本可能无法处理所有复杂的 import 语句"
echo "  2. 建议运行后检查 git diff 确认修改正确"
echo "  3. 对于包含多个组件的导入，可能需要手动调整"
echo ""
echo "💡 下一步:"
echo "  1. 检查修改: git diff"
echo "  2. 测试构建: npm run build"
echo "  3. 测试开发服务器: npm run dev"
