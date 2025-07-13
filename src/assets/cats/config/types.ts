import type { ImageMetadata } from 'astro'

/**
 * Interface for cat photo data
 */
export interface CatPhoto {
  name?: string
  image: ImageMetadata
  date: string
  tag?: string[]
  desc?: string
  // Other optional properties can be added in the future
  [key: string]: any
}

/**
 * Type for cat photos grouped by year
 */
export type CatPhotosByYear = Record<number, CatPhoto[]>
