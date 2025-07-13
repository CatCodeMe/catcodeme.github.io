import type { CatPhoto, CatPhotosByYear } from './types'

/**
 * Group cat photos by year
 * @param cats Array of cat photos
 * @returns Object with years as keys and arrays of cat photos as values
 */
export function groupCatsByYear(cats: CatPhoto[]): CatPhotosByYear {
  return cats.reduce(
    (acc, cat) => {
      const year = new Date(cat.date).getFullYear()
      if (!acc[year]) acc[year] = []
      acc[year].push(cat)
      return acc
    },
    {} as CatPhotosByYear
  )
}

/**
 * Sort years in descending order
 * @param catsByYear Object with years as keys and arrays of cat photos as values
 * @returns Array of years sorted in descending order
 */
export function getSortedYears(catsByYear: CatPhotosByYear): number[] {
  return Object.keys(catsByYear)
    .map(Number)
    .sort((a, b) => b - a)
}
