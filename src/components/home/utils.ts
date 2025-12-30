import { getBlogCollection, sortMDByDate } from 'astro-pure/server'

/**
 * Calculate site age from start date
 * @param startDate - Site start date string (format: YYYY-MM-DD)
 * @returns Formatted site age string (e.g., "1y 2M", "3M 15d", "45 d")
 */
export function calculateSiteAge(startDate: string): string {
  const siteStartDate = new Date(startDate)
  const now = new Date()
  const diffTime = now.getTime() - siteStartDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffYears = Math.floor(diffDays / 365)
  const diffMonths = Math.floor((diffDays % 365) / 30)
  const diffRemainingDays = diffDays % 30

  let siteAgeText = ''
  if (diffYears > 0) {
    siteAgeText = `${diffYears}y`
    if (diffMonths > 0) {
      siteAgeText += ` ${diffMonths}M`
    }
  } else if (diffMonths > 0) {
    siteAgeText = `${diffMonths}M`
    if (diffRemainingDays > 0) {
      siteAgeText += ` ${diffRemainingDays}d`
    }
  } else {
    siteAgeText = `${diffDays} d`
  }

  return siteAgeText.trim()
}

/**
 * Get default highlight color using theme primary color
 */
export function getHighlightColor(): string {
  return '#f6eac5'
  // 之前的代码使用 hsl(var(--primary) / var(--un-text-opacity, 1))
  // 这是使用 CSS 变量获取主题主色，并通过除法运算控制透明度
  // var(--un-text-opacity, 1) 是 UnoCSS 的透明度变量，默认值为 1（完全不透明）
  // 除法运算用于将 HSL 颜色值与透明度值结合，实现颜色透明度的动态控制
}

/**
 * Get latest blog posts
 */
export async function getLatestPosts(limit: number = 6) {
  const allPosts = await getBlogCollection()
  return sortMDByDate(allPosts).slice(0, limit)
}

/**
 * Calculate total words in all blog posts
 */
export async function getTotalWords(): Promise<number> {
  const allPosts = await getBlogCollection()
  let totalWords = 0

  for (const post of allPosts) {
    if (post.body) {
      const text = post.body
        .replace(/<[^>]*>/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
        .replace(/[#*`_~]/g, '')
        .replace(/\n/g, ' ')
      const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
      const englishWords = text.match(/[a-zA-Z]+/g) || []
      totalWords += chineseChars.length + englishWords.length
    }
  }

  return totalWords
}