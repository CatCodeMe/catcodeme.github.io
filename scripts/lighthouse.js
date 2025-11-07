#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 配置选项
const config = {
  // 要测试的 URL（默认首页）
  url: process.argv[2] || 'http://localhost:4321/',
  // 输出目录
  outputDir: join(projectRoot, 'lighthouse-reports'),
  // 是否自动打开报告
  open: process.argv.includes('--open'),
  // 是否只显示分数
  scoreOnly: process.argv.includes('--score-only'),
};

// 确保输出目录存在
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

async function runLighthouse() {
  console.log('🚀 启动 Lighthouse 性能测试...\n');
  console.log(`📊 测试 URL: ${config.url}\n`);

  // 启动 Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(config.url, options);

    // 生成报告文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const urlPath = new URL(config.url).pathname.replace(/\//g, '_') || 'index';
    const reportFilename = `lighthouse-${urlPath}-${timestamp}.html`;
    const reportPath = join(config.outputDir, reportFilename);

    // 保存 HTML 报告
    fs.writeFileSync(reportPath, runnerResult.report);

    // 提取分数
    const scores = {
      performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
      accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
      'best-practices': Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
      seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
    };

    // 显示结果
    console.log('\n📈 Lighthouse 评分结果:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`性能 (Performance):     ${scores.performance}/100 ${getScoreEmoji(scores.performance)}`);
    console.log(`可访问性 (Accessibility): ${scores.accessibility}/100 ${getScoreEmoji(scores.accessibility)}`);
    console.log(`最佳实践 (Best Practices): ${scores['best-practices']}/100 ${getScoreEmoji(scores['best-practices'])}`);
    console.log(`SEO:                    ${scores.seo}/100 ${getScoreEmoji(scores.seo)}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 显示关键性能指标
    if (!config.scoreOnly) {
      const metrics = runnerResult.lhr.audits;
      console.log('🎯 关键性能指标:');
      console.log(`  首次内容绘制 (FCP): ${formatMetric(metrics['first-contentful-paint']?.displayValue)}`);
      console.log(`  最大内容绘制 (LCP): ${formatMetric(metrics['largest-contentful-paint']?.displayValue)}`);
      console.log(`  总阻塞时间 (TBT):   ${formatMetric(metrics['total-blocking-time']?.displayValue)}`);
      console.log(`  累积布局偏移 (CLS): ${formatMetric(metrics['cumulative-layout-shift']?.displayValue)}`);
      console.log(`  速度指数 (SI):      ${formatMetric(metrics['speed-index']?.displayValue)}`);
      console.log(`  交互就绪时间 (TTI): ${formatMetric(metrics['interactive']?.displayValue)}\n`);
    }

    console.log(`📄 详细报告已保存: ${reportPath}`);

    if (config.open) {
      // 在默认浏览器中打开报告
      const openCommand = process.platform === 'darwin' ? 'open' : 
                         process.platform === 'win32' ? 'start' : 'xdg-open';
      spawn(openCommand, [reportPath], { detached: true, stdio: 'ignore' });
    }

    // 返回退出码（如果性能分数低于 90，返回非零退出码）
    if (scores.performance < 90) {
      console.log('\n⚠️  性能分数低于 90，建议优化！');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Lighthouse 测试失败:', error);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
}

function getScoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}

function formatMetric(value) {
  return value || 'N/A';
}

// 检查预览服务器是否运行
async function checkServer(url) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  // 检查服务器是否运行
  const serverRunning = await checkServer(config.url);
  
  if (!serverRunning) {
    console.log('⚠️  检测到预览服务器未运行');
    console.log('💡 提示: 请先运行以下命令之一:');
    console.log('   - bun run preview  (测试构建后的站点)');
    console.log('   - bun run dev      (开发模式，但性能测试建议用 preview)\n');
    console.log('🔄 正在尝试启动预览服务器...\n');
    
    // 尝试启动预览服务器
    const previewProcess = spawn('bun', ['run', 'preview'], {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    // 等待服务器启动
    await new Promise((resolve, reject) => {
      let output = '';
      previewProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Local:') || output.includes('localhost')) {
          setTimeout(resolve, 2000); // 等待 2 秒确保服务器完全启动
        }
      });

      previewProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      previewProcess.on('error', reject);

      // 10 秒超时
      setTimeout(() => {
        if (!output.includes('Local:')) {
          reject(new Error('预览服务器启动超时'));
        }
      }, 10000);
    });

    console.log('✅ 预览服务器已启动\n');

    // 运行 Lighthouse
    await runLighthouse();

    // 关闭预览服务器
    previewProcess.kill();
  } else {
    await runLighthouse();
  }
}

main().catch((error) => {
  console.error('❌ 错误:', error.message);
  process.exit(1);
});
