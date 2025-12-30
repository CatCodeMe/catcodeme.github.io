/**
 * Platform label mapping for common social platforms
 */
export const platformLabels: Record<string, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  discord: 'Discord',
  youtube: 'YouTube',
  instagram: 'Instagram',
  x: 'X',
  telegram: 'Telegram',
  rss: 'RSS',
  email: 'Email',
  reddit: 'Reddit',
  bluesky: 'BlueSky',
  tiktok: 'TikTok',
  weibo: 'Weibo',
  steam: 'Steam',
  bilibili: 'Bilibili',
  zhihu: 'Zhihu',
  coolapk: 'Coolapk',
  netease: 'NetEase',
  travelling: 'Travelling'
}

/**
 * Platforms that have built-in icons
 */
export const platformsWithIcons = Object.keys(platformLabels)

/**
 * Check if a platform has an icon available
 */
export function hasIcon(platform: string): boolean {
  return platformsWithIcons.includes(platform)
}

/**
 * Get label for a platform, fallback to platform name
 */
export function getPlatformLabel(platform: string): string {
  return platformLabels[platform] || platform
}