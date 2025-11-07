import { rehypeHeadingIds } from '@astrojs/markdown-remark';
// import vercel from '@astrojs/vercel';
import remarkWikiLink from "@braindb/remark-wiki-link";
import expressiveCode from 'astro-expressive-code';
import icon from 'astro-icon';
import mermaid from 'astro-mermaid';
import { defineConfig } from 'astro/config';
// Others
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';


import AstroPureIntegration from './packages/pure/index.ts';
// Local integrations
import { fontSubsetting } from './src/integrations/font-subsetting.ts';
// Local rehype & remark plugins
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts';
// Shiki
// import { addCopyButton, addLanguage, addTitle, transformerNotationDiff, transformerNotationHighlight, updateStyle } from './src/plugins/shiki-transformers.ts';
import config from './src/site.config.ts';

// https://astro.build/config
export default defineConfig({
  // Top-Level Options
  site: 'https://8cat.life',
  // base: '/docs',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'auto'
  },

  // Adapter
  // https://docs.astro.build/en/guides/deploy/
  // 1. Vercel (serverless)
  // adapter: vercel(),
  // output: 'server',
  // 2. Vercel (static)
  // adapter: vercelStatic(),
  // 3. Local (standalone)
  // adapter: node({ mode: 'standalone' }),
  // output: 'server',
  // ---
  // adapter: undefined,
  output: 'static',
  // outDir: 'dist',

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  integrations: [
    mermaid({
      autoTheme: true,
      theme: 'forest',
      mermaidConfig: {
        startOnLoad: false,
        logLevel: 'error',
        securityLevel: 'strict'
      }
    }),
    expressiveCode(),
    icon({
      include: {
        devicon: ['*'],
        mingcute: ['*']
      }
    }),
    AstroPureIntegration(config),
    fontSubsetting() // 构建后自动运行字体子集化
  ],
  // root: './my-project-directory',

  // Prefetch Options
  prefetch: true,

  // Markdown Options
  markdown: {
    remarkPlugins: [
      remarkMath,
      [
        remarkWikiLink,
        {
          linkTemplate: ({ slug, alias }) => {
            let normalizedSlug = (slug || '')
              .replace(/^\/\//, '')
              .replace(/^src\/content\//, '')
              .replace(/^\/+/, '')
              .replace(/\.(md|mdx)$/, '')
              .replace(/\/index$/, '')

            return {
              hName: 'a',
              hProperties: {
                href: `/${normalizedSlug}`,
                class: 'inner-link not-prose'
              },
              hChildren: [
                {
                  type: 'text',
                  value: alias || normalizedSlug || ''
                }
              ]
            }
          }
        }
      ],
      remarkBreaks
    ],
    rehypePlugins: [
      [rehypeKatex, {}],
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['anchor'] },
          content: { type: 'text', value: '#' }
        }
      ]
    ]
    // https://docs.astro.build/en/guides/syntax-highlighting/
    // shikiConfig: {
    //   themes: {
    //     light: 'github-light',
    //     dark: 'github-dark'
    //   },
    //   transformers: [
    //     transformerNotationDiff(),
    //     transformerNotationHighlight(),
    //     updateStyle(),
    //     addTitle(),
    //     addLanguage(),
    //     addCopyButton(2000)
    //   ]
    // }
  },
  experimental: {
    svg: true,
    contentIntellisense: true
  },
  vite: {
    plugins: [
      //   visualizer({
      //     emitFile: true,
      //     filename: 'stats.html'
      //   })
    ],
    server: {
      host: true
      // https: {
      //   key: fs.readFileSync('./localhost+2-key.pem'),
      //   cert: fs.readFileSync('./localhost+2.pem')
      // }
    }
  }
})