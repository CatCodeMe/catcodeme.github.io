import { defineEcConfig } from 'astro-expressive-code'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLanguageBadge } from './src/plugins/experssive-code-language-badge.js'

export default defineEcConfig({
  plugins: [
    pluginLineNumbers(),
    pluginCollapsibleSections(),
    pluginLanguageBadge(),
  ],
  defaultProps: {
    collapseStyle: 'collapsible-auto',
  },
  frames: {
    extractFileNameFromCode: true,
  },
  themes: ['github-light','github-dark'],
  removeUnusedThemes: true,
  themeCssSelector: (theme) => `[data-theme='${theme.type}']`
})
