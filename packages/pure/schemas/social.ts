import { z } from 'astro/zod'

import { getPlatformLabel } from '../libs/social'

// Support two formats:
// 1. Simple format: { platform: 'url' } - uses icon
// 2. Custom format: { platform: { url: 'url', label: 'label', textOnly?: true } } - supports text links
const SocialLinkValueSchema = z.union([
  z.string().url(), // Simple format: URL only
  z.object({
    url: z.string().url(),
    label: z.string(),
    textOnly: z.boolean().optional().default(false) // true means text only, no icon
  })
])

export const SocialLinksSchema = () =>
  z
    .record(z.string(), SocialLinkValueSchema) // Allow any string as key, not limited to predefined platforms
    .transform((links) => {
      const result: Array<{ platform: string; label: string; url: string; textOnly: boolean }> = []
      
      for (const key in links) {
        const value = links[key]
        if (!value) continue
        
        if (typeof value === 'string') {
          // Simple format: URL only
          result.push({
            platform: key,
            label: getPlatformLabel(key),
            url: value,
            textOnly: false
          })
        } else {
          // Custom format
          result.push({
            platform: key,
            label: value.label,
            url: value.url,
            textOnly: value.textOnly ?? false
          })
        }
      }
      
      return result
    })
    .optional()
