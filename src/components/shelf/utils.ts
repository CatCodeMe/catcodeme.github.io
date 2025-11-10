import bookshelfToml from './bookshelf.toml?raw'
import { parse } from 'toml'
import { getBlogCollection, sortMDByDate } from 'astro-pure/server'

export type ShelfItem = {
  title: string
  type: 'book' | 'paper' | 'article'
  status: 'read' | 'reading' | 'to-read'
  description?: string  // 详细描述，最多300字，用于书卡展示
  summary?: string      // 一句话描述，用于首页等简短展示场景
  rating?: number
  identifier?: string
  sourceUrl?: string
  links?: string[]
  tags?: string[]
  coverImage?: string
  progress?: number
  order?: number
  startDate?: string
  endDate?: string
}

// 解析 TOML 数据
const bookshelfData = parse(bookshelfToml).items as ShelfItem[]

/**
 * Get all bookshelf items
 */
export function getAllBookshelfItems(): ShelfItem[] {
  return bookshelfData
}

/**
 * Get bookshelf items sorted by startDate (newest first), then by order
 */
export function getSortedBookshelfItems(): ShelfItem[] {
  const items = getAllBookshelfItems()
  return items.sort((a, b) => {
    // ???? startDate?? startDate ?????????
    if (a.startDate && b.startDate) {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    }
    // ???? a ? startDate?a ????
    if (a.startDate && !b.startDate) return -1
    // ???? b ? startDate?b ????
    if (!a.startDate && b.startDate) return 1
    // ???? order?? order ??
    if (a.order !== undefined && b.order !== undefined) {
      return b.order - a.order
    }
    // ???? a ? order?a ????
    if (a.order !== undefined && b.order === undefined) return -1
    // ???? b ? order?b ????
    if (a.order === undefined && b.order !== undefined) return 1
    // ???????
    return 0
  })
}

/**
 * Get current reading item (the first item with status 'reading')
 */
export function getCurrentReading(): ShelfItem | undefined {
  const items = getSortedBookshelfItems()
  return items.find((item) => item.status === 'reading')
}

/**
 * Get bookshelf items by status
 */
export function getBookshelfItemsByStatus(status: ShelfItem['status']): ShelfItem[] {
  return getAllBookshelfItems().filter((item) => item.status === status)
}

/**
 * Get bookshelf statistics
 */
export function getBookshelfStats() {
  const items = getAllBookshelfItems()
  return {
    total: items.length,
    toRead: items.filter((item) => item.status === 'to-read').length,
    reading: items.filter((item) => item.status === 'reading').length,
    read: items.filter((item) => item.status === 'read').length
  }
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