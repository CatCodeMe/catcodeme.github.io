#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * 将 astro-pure barrel imports 转换为直接路径导入
 * 使用 @/custom/components/* 别名而不是依赖 package.json exports
 * 
 * 用法: node scripts/fix-imports-custom-path.mjs [--dry-run]
 */

const DRY_RUN = process.argv.includes('--dry-run');

// 组件映射 - 使用项目内路径别名
const COMPONENT_MAPPINGS = {
        'astro-pure/user': {
                prefix: '@/custom/components/user',
                components: ['Button', 'Icon', 'Collapse', 'Tabs', 'TabItem', 'Steps',
                        'MdxRepl', 'Aside', 'Timeline', 'TimelineItem', 'Card',
                        'CardList', 'Spoiler', 'FormattedDate', 'Label', 'Svg'],
        },
        'astro-pure/components/pages': {
                prefix: '@/custom/components/pages',
                components: ['TOC', 'BackToTop', 'Paginator', 'PostPreview',
                        'ArticleBottom', 'Copyright', 'Hero', 'TOCHeading', 'PFSearch'],
        },
        'astro-pure/advanced': {
                prefix: '@/custom/components/advanced',
                components: ['Quote', 'GithubCard', 'LinkPreview', 'QRCode', 'MediumZoom'],
        },
};

const stats = {
        filesScanned: 0,
        filesModified: 0,
        importsReplaced: 0,
};

function findFiles(dir, extensions = ['.astro', '.mdx']) {
        const files = [];
        try {
                const items = readdirSync(dir);
                for (const item of items) {
                        const fullPath = join(dir, item);
                        const stat = statSync(fullPath);

                        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                                files.push(...findFiles(fullPath, extensions));
                        } else if (stat.isFile() && extensions.includes(extname(item))) {
                                files.push(fullPath);
                        }
                }
        } catch (err) {
                // 忽略无权限访问的目录
        }
        return files;
}

function replaceBarrelImports(content, filePath) {
        let modified = false;
        let newContent = content;

        // 匹配 import { A, B, C } from 'astro-pure/user'
        const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g;

        let match;
        const replacements = [];

        while ((match = importRegex.exec(content)) !== null) {
                const [fullMatch, imports, source] = match;

                if (COMPONENT_MAPPINGS[source]) {
                        const { prefix, components: availableComponents } = COMPONENT_MAPPINGS[source];
                        const componentNames = imports.split(',').map(s => s.trim());

                        // 为每个组件生成独立的 import 语句
                        const newImports = componentNames
                                .filter(name => availableComponents.includes(name))
                                .map(name => `import ${name} from '${prefix}/${name}.astro'`)
                                .join('\n');

                        if (newImports) {
                                replacements.push({
                                        original: fullMatch,
                                        replacement: newImports,
                                        components: componentNames,
                                        source,
                                });
                                modified = true;
                                stats.importsReplaced += componentNames.length;
                        }
                }
        }

        // 执行替换
        for (const { original, replacement } of replacements) {
                newContent = newContent.replace(original, replacement);
        }

        return { content: newContent, modified };
}

function processFile(filePath) {
        stats.filesScanned++;

        const content = readFileSync(filePath, 'utf-8');
        const { content: newContent, modified } = replaceBarrelImports(content, filePath);

        if (modified) {
                stats.filesModified++;

                if (DRY_RUN) {
                        console.log(`  [DRY RUN] 将修改: ${filePath}`);
                } else {
                        writeFileSync(filePath, newContent, 'utf-8');
                        console.log(`  ✅ 已修改: ${filePath}`);
                }
        }
}

function main() {
        console.log('🔍 开始转换为项目内路径导入...\n');

        if (DRY_RUN) {
                console.log('⚠️  DRY RUN 模式 - 不会实际修改文件\n');
        }

        const dirs = [
                'src/layouts',
                'src/pages',
                'src/components',
                'src/content/blog',
        ];

        for (const dir of dirs) {
                console.log(`📂 处理目录: ${dir}`);
                const files = findFiles(dir);
                files.forEach(processFile);
        }

        console.log('\n✨ 完成!');
        console.log('📊 统计:');
        console.log(`  - 扫描的文件: ${stats.filesScanned}`);
        console.log(`  - 修改的文件: ${stats.filesModified}`);
        console.log(`  - 替换的导入: ${stats.importsReplaced}`);

        if (DRY_RUN) {
                console.log('\n💡 要实际执行修改，请运行:');
                console.log('  node scripts/fix-imports-custom-path.mjs');
        } else if (stats.filesModified > 0) {
                console.log('\n💡 下一步:');
                console.log('  1. 检查修改: git diff');
                console.log('  2. 测试构建: npm run dev');
                console.log('  3. 如有问题: git restore .');
        }
}

main();
