import type { AstroIntegration } from 'astro'
import { execSync } from 'child_process'

/**
 * Astro Integration: 在构建后自动运行字体子集化
 */
export function fontSubsetting(): AstroIntegration {
  return {
    name: 'font-subsetting',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        console.log('\n🔤 开始字体子集化...')
        try {
          // 运行字体子集化脚本
          execSync('node scripts/subset-fonts.js', {
            stdio: 'inherit',
            cwd: process.cwd()
          })
          console.log('✅ 字体子集化完成\n')
        } catch (error) {
          console.error('❌ 字体子集化失败:', error)
          // 不终止构建，只输出警告
          console.warn('⚠️  继续部署，但字体文件可能未优化')
        }
      }
    }
  }
}
