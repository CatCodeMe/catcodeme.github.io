export function getTheme() {
  return localStorage.getItem('theme')
}

export function listenThemeChange(theme?: string) {
  if (theme && theme !== 'system') return // if theme is specified, no need to listen window theme change
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    setTheme(e.matches ? 'dark' : 'light')
  })
}

export function setTheme(theme?: string, save = false) {
  const themes = ['system', 'dark', 'light']
  if (theme) {
    if (!themes.includes(theme)) return
    if (save) localStorage.setItem('theme', theme)
  } else {
    theme = getTheme() ?? undefined
    if (save) {
      // Set theme equals undefined, switch cycle in ['system', 'dark', 'light']
      const currentIndex = themes.indexOf(theme ?? 'system')
      theme = themes[(currentIndex + 1) % themes.length]
      localStorage.setItem('theme', theme) // save theme
    }
  }
  let targetTheme = theme
  if (theme === 'system') {
    targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    // Listen theme change
    listenThemeChange(theme)
  }

  const applyTheme = () => {
    // Set theme
    document.documentElement.classList.toggle('dark', targetTheme === 'dark')
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', targetTheme === 'dark' ? '#0B0B10' : '#FCFCFD')
  }

  // The View Transitions API is used here to animate the theme change.
  if (document.startViewTransition) {
    const x = window.innerWidth // Start from top-right corner
    const y = 0 // Start from top-right corner
    const endRadius = Math.hypot(window.innerWidth, window.innerHeight)
    const transition = document.startViewTransition(applyTheme)
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0 at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 800,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    }).then(() => {
      document.dispatchEvent(new CustomEvent('theme-transition-complete'))
    })
  } else {
    applyTheme()
  }

  return theme
}
