import fs from 'fs'
import { readFileSync, readdirSync, statSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Fontmin from 'fontmin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const distDir = join(projectRoot, 'dist')
const fontsSourceDir = join(projectRoot, 'fonts-source')
const fontsOutputDir = join(projectRoot, 'public', 'fonts')
const distFontsDir = join(distDir, 'fonts')

// 思源宋体字体文件路径（支持 TTF 和 OTF）
let sourceFontPath = ''
if (fs.existsSync(join(fontsSourceDir, 'NotoSerifSC-Regular.ttf'))) {
  sourceFontPath = join(fontsSourceDir, 'NotoSerifSC-Regular.ttf')
} else if (fs.existsSync(join(fontsSourceDir, 'NotoSerifCJK-Regular.otf'))) {
  sourceFontPath = join(fontsSourceDir, 'NotoSerifCJK-Regular.otf')
} else {
  console.error('❌ 错误: 未找到源字体文件')
  console.error(`请将字体文件放置到以下位置之一:`)
  console.error(`  - ${join(fontsSourceDir, 'NotoSerifSC-Regular.ttf')}`)
  console.error(`  - ${join(fontsSourceDir, 'NotoSerifCJK-Regular.otf')}`)
  process.exit(1)
}

const outputFontPath = join(fontsOutputDir, 'NotoSerifCJK-Subset.woff2')

/**
 * 从 HTML 文件中提取所有中文字符
 */
function extractCharactersFromHTML(htmlContent) {
  const chineseChars = new Set()
  
  // 匹配中文字符（包括 CJK 统一汉字、扩展 A、B 等）
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g
  const matches = htmlContent.match(chineseRegex)
  
  if (matches) {
    matches.forEach(char => chineseChars.add(char))
  }
  
  // 也提取常用标点符号
  const punctuationRegex = /[，。！？；：、""''（）【】《》〈〉「」『』【】〔〕…—～·]/g
  const punctMatches = htmlContent.match(punctuationRegex)
  if (punctMatches) {
    punctMatches.forEach(char => chineseChars.add(char))
  }
  
  return chineseChars
}

/**
 * 递归读取目录下所有 HTML 文件
 */
function getAllHTMLFiles(dir, fileList = []) {
  const files = readdirSync(dir)
  
  files.forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      getAllHTMLFiles(filePath, fileList)
    } else if (file.endsWith('.html')) {
      fileList.push(filePath)
    }
  })
  
  return fileList
}

/**
 * 使用 fontmin 生成字体子集（纯 JS 方案）
 */
async function generateFontSubset(characters) {
  // 将字符集转换为字符串
  const charArray = Array.from(characters).sort()
  const text = charArray.join('')
  
  console.log(`📝 提取到 ${charArray.length} 个唯一字符`)
  console.log(`🔧 使用 fontmin 生成字体子集...`)
  
  // 确保输出目录存在
  if (!fs.existsSync(fontsOutputDir)) {
    fs.mkdirSync(fontsOutputDir, { recursive: true })
  }
  
  return new Promise((resolve, reject) => {
    // 第一步：生成 TTF 子集
    const fontmin = new Fontmin()
      .src(sourceFontPath)
      .use(Fontmin.glyph({
        text: text,
        hinting: false // 禁用 hinting 以加快速度
      }))
      .dest(fontsOutputDir)
    
    fontmin.run((err, files) => {
      if (err) {
        console.error('❌ 生成字体子集失败:', err.message)
        reject(err)
        return
      }
      
      // 找到生成的 TTF 文件
      const ttfFile = files.find(f => f.path.endsWith('.ttf') || f.path.endsWith('.otf'))
      if (!ttfFile) {
        reject(new Error('未找到生成的 TTF 文件'))
        return
      }
      
      const generatedTtfPath = ttfFile.path
      
      // 第二步：转换为 WOFF2
      const fontminWoff2 = new Fontmin()
        .src(generatedTtfPath)
        .use(Fontmin.ttf2woff2({
          deflate: {
            level: 11 // 最高压缩级别
          }
        }))
        .dest(fontsOutputDir)
      
      fontminWoff2.run((err2, files2) => {
        // 清理临时 TTF 文件
        try {
          if (fs.existsSync(generatedTtfPath)) {
            fs.unlinkSync(generatedTtfPath)
          }
        } catch (e) {
          // 忽略清理错误
        }
        
        if (err2) {
          console.error('❌ 转换为 WOFF2 失败:', err2.message)
          reject(err2)
          return
        }
        
        // 找到生成的 WOFF2 文件
        const woff2File = files2.find(f => f.path.endsWith('.woff2'))
        if (!woff2File) {
          reject(new Error('未找到生成的 WOFF2 文件'))
          return
        }
        
        const generatedWoff2Path = woff2File.path
        
        // 重命名为目标文件名
        if (generatedWoff2Path !== outputFontPath) {
          fs.renameSync(generatedWoff2Path, outputFontPath)
        }
        
        console.log(`✅ 字体子集已生成: ${outputFontPath}`)
        
        // 显示文件大小
        const stats = fs.statSync(outputFontPath)
        const sizeKB = (stats.size / 1024).toFixed(2)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
        console.log(`📦 文件大小: ${sizeKB} KB (${sizeMB} MB)`)
        
        // 复制字体文件到 dist/fonts/ 目录（构建后生成的文件需要手动复制）
        if (!fs.existsSync(distFontsDir)) {
          fs.mkdirSync(distFontsDir, { recursive: true })
        }
        const distFontPath = join(distFontsDir, 'NotoSerifCJK-Subset.woff2')
        copyFileSync(outputFontPath, distFontPath)
        console.log(`📋 字体文件已复制到: ${distFontPath}`)
        
        // 同时复制 LinBiolinum.woff2（如果存在）
        const linBiolinumPath = join(fontsOutputDir, 'LinBiolinum.woff2')
        if (fs.existsSync(linBiolinumPath)) {
          const distLinBiolinumPath = join(distFontsDir, 'LinBiolinum.woff2')
          copyFileSync(linBiolinumPath, distLinBiolinumPath)
          console.log(`📋 LinBiolinum 字体已复制到: ${distLinBiolinumPath}`)
        }
        
        resolve()
      })
    })
  })
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始字体子集化流程（纯 JS 方案）...\n')
  
  // 检查源字体文件是否存在
  if (!fs.existsSync(sourceFontPath)) {
    console.error('❌ 错误: 源字体文件不存在')
    console.error(`请将思源宋体字体文件放置到: ${sourceFontPath}`)
    console.error('\n下载地址:')
    console.error('https://github.com/adobe-fonts/source-han-serif/releases')
    console.error('或使用: https://fonts.google.com/noto/specimen/Noto+Serif+SC')
    process.exit(1)
  }
  
  // 检查 dist 目录是否存在
  if (!fs.existsSync(distDir)) {
    console.error('❌ 错误: dist 目录不存在，请先运行构建命令')
    console.error('运行: bun run build')
    process.exit(1)
  }
  
  console.log('📖 扫描 HTML 文件...')
  const htmlFiles = getAllHTMLFiles(distDir)
  console.log(`找到 ${htmlFiles.length} 个 HTML 文件\n`)
  
  // 提取所有字符
  const allCharacters = new Set()
  
  htmlFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf-8')
      const chars = extractCharactersFromHTML(content)
      chars.forEach(char => allCharacters.add(char))
    } catch (error) {
      console.warn(`⚠️  读取文件失败: ${file}`, error.message)
    }
  })
  
  // 添加常用字符（确保基本字符可用）
  const commonChars = '，。！？；：、""\'\'（）【】《》〈〉「」『』【】〔〕…—～·0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  commonChars.split('').forEach(char => allCharacters.add(char))
  
  console.log(`\n📊 统计信息:`)
  console.log(`   - HTML 文件数: ${htmlFiles.length}`)
  console.log(`   - 提取字符数: ${allCharacters.size}`)
  
  // 生成字体子集
  await generateFontSubset(allCharacters)
  
  console.log('\n✨ 字体子集化完成！')
  console.log('💡 字体文件已生成，可以直接部署')
}

main().catch(error => {
  console.error('❌ 发生错误:', error)
  process.exit(1)
})
