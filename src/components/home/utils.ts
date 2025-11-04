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
  return 'hsl(var(--primary) / var(--un-text-opacity, 1))'
}