import fs from 'fs'
import { readFileSync, readdirSync, statSync, writeFileSync, unlinkSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'
import { tmpdir } from 'os'

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
 * 检查 pyftsubset 是否可用，返回可用的命令
 */
function checkPyftsubset() {
  try {
    // 先尝试直接调用 pyftsubset
    execSync('pyftsubset --help', { stdio: 'ignore' })
    return 'pyftsubset'
  } catch {
    try {
      // 如果直接调用失败，尝试使用 python -m fontTools.subset
      execSync('python -m fontTools.subset --help', { stdio: 'ignore' })
      return 'python -m fontTools.subset'
    } catch {
      try {
        // 尝试 python3
        execSync('python3 -m fontTools.subset --help', { stdio: 'ignore' })
        return 'python3 -m fontTools.subset'
      } catch {
        return null
      }
    }
  }
}

/**
 * 使用 pyftsubset 生成字体子集
 */
function generateFontSubset(characters) {
  const pyftsubsetCmd = checkPyftsubset()
  if (!pyftsubsetCmd) {
    console.error('❌ 错误: 未找到 pyftsubset 工具')
    console.error('请安装: pip install fonttools brotli')
    console.error('或使用: npm install -g pyftsubset')
    process.exit(1)
  }
  
  // 将字符集转换为 Unicode 范围字符串
  const charArray = Array.from(characters).sort()
  const text = charArray.join('')
  
  console.log(`📝 提取到 ${charArray.length} 个唯一字符`)
  console.log(`🔧 使用命令: ${pyftsubsetCmd}`)
  
  // 确保输出目录存在
  if (!fs.existsSync(fontsOutputDir)) {
    fs.mkdirSync(fontsOutputDir, { recursive: true })
  }
  
  // 创建临时文件来存储文本内容，避免 shell 引号转义问题
  const tempTextFile = join(tmpdir(), `font-subset-text-${Date.now()}.txt`)
  try {
    writeFileSync(tempTextFile, text, 'utf-8')
    
    // 使用 --text-file 参数而不是 --text，避免 shell 引号问题
    // 将命令拆分为数组，避免 shell 解析
    const cmdParts = pyftsubsetCmd.split(' ')
    const args = [
      ...cmdParts.slice(1), // 如果是 "python -m fontTools.subset"，这里会包含 "-m", "fontTools.subset"
      sourceFontPath,
      '--text-file=' + tempTextFile,
      '--flavor=woff2',
      '--output-file=' + outputFontPath,
      '--layout-features=*',
      '--glyph-names',
      '--symbol-cmap',
      '--legacy-cmap',
      '--notdef-glyph',
      '--notdef-outline',
      '--recommended-glyphs'
    ]
    
    // 如果 pyftsubsetCmd 是单个命令（如 "pyftsubset"），则 cmdParts[0] 是命令本身
    const command = cmdParts.length > 1 ? cmdParts[0] : pyftsubsetCmd
    
    // 使用 spawn 方式执行，避免 shell 解析问题
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false
    })
    
    return new Promise((resolve, reject) => {
      child.on('close', (code) => {
        // 清理临时文件
        try {
          if (fs.existsSync(tempTextFile)) {
            unlinkSync(tempTextFile)
          }
        } catch (e) {
          // 忽略清理错误
        }
        
        if (code !== 0) {
          console.error(`❌ 生成字体子集失败，退出码: ${code}`)
          process.exit(1)
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
      
      child.on('error', (error) => {
        // 清理临时文件
        try {
          if (fs.existsSync(tempTextFile)) {
            unlinkSync(tempTextFile)
          }
        } catch (e) {
          // 忽略清理错误
        }
        
        console.error('❌ 生成字体子集失败:', error.message)
        reject(error)
      })
    })
  } catch (error) {
    // 清理临时文件
    try {
      if (fs.existsSync(tempTextFile)) {
        unlinkSync(tempTextFile)
      }
    } catch (e) {
      // 忽略清理错误
    }
    
    console.error('❌ 生成字体子集失败:', error.message)
    process.exit(1)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始字体子集化流程...\n')
  
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
  
  // 生成字体子集（现在是异步的）
  await generateFontSubset(allCharacters)
  
  console.log('\n✨ 字体子集化完成！')
  console.log('💡 字体文件已生成，可以直接部署')
}

main().catch(error => {
  console.error('❌ 发生错误:', error)
  process.exit(1)
})
