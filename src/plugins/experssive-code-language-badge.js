import { definePlugin } from '@expressive-code/core'

const iconMap = {
  astro: { name: 'astro', variant: 'original' },
  bash: { name: 'bash', variant: 'original' },
  css: { name: 'css3', variant: 'original' },
  go: { name: 'go', variant: 'original' },
  java: { name: 'java', variant: 'original' },
  javascript: { name: 'javascript', variant: 'original' },
  js: { name: 'javascript', variant: 'original' },
  json: { name: 'json', variant: 'plain' },
  jsx: { name: 'javascript', variant: 'original' },
  markdown: { name: 'markdown', variant: 'original' },
  md: { name: 'markdown', variant: 'original' },
  py: { name: 'python', variant: 'original' },
  python: { name: 'python', variant: 'original' },
  rust: { name: 'rust', variant: 'original' },
  scala: { name: 'scala', variant: 'original' },
  sql: { name: 'microsoftsqlserver', variant: 'plain' },
  ts: { name: 'typescript', variant: 'original' },
  tsx: { name: 'typescript', variant: 'original' },
  typescript: { name: 'typescript', variant: 'original' },
  yaml: { name: 'yaml', variant: 'plain' },
  yml: { name: 'yaml', variant: 'plain' },
}

function generateLanguageStyles() {
  let styles = ''
  for (const lang in iconMap) {
    const iconInfo = iconMap[lang]
    const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconInfo.name}/${iconInfo.name}-${iconInfo.variant}.svg`
    styles += `\n[data-language="${lang}"]::before { background-image: url('${url}'); }`
  }
  return styles
}

export function pluginLanguageBadge() {
  return definePlugin({
    name: 'Language Badge',
    baseStyles: ({ cssVar }) => `
      [data-language]::before {
        position: absolute;
        z-index: 2;
        right: calc(${cssVar('borderWidth')} + ${cssVar('uiPaddingInline')} / 2);
        top: calc(${cssVar('borderWidth')} + 0.35rem);
        height: 1.5rem;
        padding: 0 0.5rem 0 2rem;
        content: attr(data-language);
        font-size: 0.75rem;
        color: hsl(var(--primary) / var(--un-text-opacity, 1));
        pointer-events: none;
        transition: opacity 0.2s;
        display: inline-flex;
        align-items: center;
        line-height: 1;
        background-position: 0.5rem 50%;
        background-repeat: no-repeat;
        background-size: 0.9rem 0.9rem;
        /* Default icon: mingcute:code-line */
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='none'%3E%3Cpath d='M0 0h24v24H0z'/%3E%3Cpath fill='currentColor' d='M14.486 3.143a1 1 0 0 1 .692 1.233l-4.43 15.788a1 1 0 0 1-1.926-.54l4.43-15.788a1 1 0 0 1 1.234-.693M7.207 7.05a1 1 0 0 1 0 1.414L3.672 12l3.535 3.535a1 1 0 1 1-1.414 1.415L1.55 12.707a1 1 0 0 1 0-1.414L5.793 7.05a1 1 0 0 1 1.414 0m9.586 1.414a1 1 0 1 1 1.414-1.414l4.243 4.243a1 1 0 0 1 0 1.414l-4.243 4.243a1 1 0 0 1-1.414-1.415L20.328 12z'/%3E%3C/g%3E%3C/svg%3E"); 
      }
      
      .frame:not(.has-title):not(.is-terminal) {
        @media not (hover: hover) {
          .copy {
            margin-right: 3rem;
          }
        }
        @media (hover: hover) {
          &:hover [data-language]::before {
            opacity: 0;
          }
        }
      }
      ${generateLanguageStyles()}
    `,
  })
}