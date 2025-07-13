// @ts-check

import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import vercel from '@astrojs/vercel'
import AstroPureIntegration from './packages/pure/index.ts'
import { defineConfig } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import remarkWikiLink from "@braindb/remark-wiki-link"
import { remarkMermaid } from './src/plugins/remark-mermaid'

// Others
// import { visualizer } from 'rollup-plugin-visualizer'
import rehypeCallouts from 'rehype-callouts'
import expressiveCode from 'astro-expressive-code'
import redircetFrom from 'astro-redirect-from'

import icon from 'astro-icon'
import path from 'node:path'

// Local integrations
// Local rehype & remark plugins
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts'

import config from './src/site.config.ts'

// https://astro.build/config
export default defineConfig({
  // Top-Level Options
  site: 'https://8cat.life',
  // base: '/docs',
  trailingSlash: 'never',

  // Adapter
  // https://docs.astro.build/en/guides/deploy/
  // 1. Vercel (serverless)
  adapter: vercel(),
  output: 'server',
  // 2. Vercel (static)
  // adapter: vercelStatic(),
  // 3. Local (standalone)
  // adapter: node({ mode: 'standalone' }),
  // output: 'server',
  // ---

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  integrations: [
    redircetFrom({
      contentDir: "./src/content",
      getSlug: (filePath) => {
        const parsedPath = path.parse(filePath)
        let slug
        // construct slug as full path from either:
        // - folder name if file name is index.md, or
        // - file name
        if (parsedPath.base === 'index.md' || parsedPath.base === 'index.mdx') {
          slug = `${parsedPath.dir}`
        } else {
          slug = `${parsedPath.dir}/${parsedPath.name}`
        }
        return slug
      }
    }),
    expressiveCode(),
    icon({
      include: {
        devicon: ['*'],
      }
    }),
    AstroPureIntegration(config),
    // Comment out BrainDB temporarily
    // brainDbAstro({
    //   remarkWikiLink: false,
    //   git: false,
    //   root: 'src/content',
    //   cache: true,
    //   slug: (filePath, collection) => {
    //     let slug = filePath
    //       .replace(/^\/\//, '')
    //       .replace(/^src\/content\//, '')
    //       .replace(/^\/+/, '')
    //       .replace(/\.(md|mdx)$/, '')
    //       .replace(/\/index$/, '')
    //     return slug
    //   }
    // }),
  ],
  // root: './my-project-directory',

  // Prefetch Options
  prefetch: true,
  // Server Options
  server: {
    host: true
  },
  // Markdown Options
  markdown: {
    remarkPlugins: [
      remarkMath,
      [remarkWikiLink, {
        linkTemplate: ({ slug, alias }) => {
          let normalizedSlug = slug
            .replace(/^\/\//, '')
            .replace(/^src\/content\//, '')
            .replace(/^\/+/, '')
            .replace(/\.(md|mdx)$/, '')
            .replace(/\/index$/, '')

          return {
            hName: "a",
            hProperties: {
              href: `/${normalizedSlug}`,
              class: "inner-link not-prose",
            },
            hChildren: [
              {
                type: "text",
                value: alias || normalizedSlug,
              },
            ],
          }
        },
      }],
      remarkBreaks,
      remarkMermaid
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
      ],
      [rehypeCallouts, {
        props: {
          containerProps: { class: ['callout', 'not-prose'] },
        }
      }]
    ],
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
    ]
  }
})
