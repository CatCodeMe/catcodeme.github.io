import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import remarkWikiLink from "@braindb/remark-wiki-link";
import expressiveCode from 'astro-expressive-code';
import icon from 'astro-icon';
import redircetFrom from 'astro-redirect-from';
import { defineConfig } from 'astro/config';
import fontCarrier from 'font-carrier';

// Others
// import { visualizer } from 'rollup-plugin-visualizer'
import rehypeCallouts from 'rehype-callouts';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';

import AstroPureIntegration from './packages/pure/index.ts';
// Local integrations
// Local rehype & remark plugins
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts';
import { remarkAiNotice } from './src/plugins/remark-ai-notice.mjs';
import { remarkMermaid } from './src/plugins/remark-mermaid';
import config from './src/site.config.ts';

const createFontSubsetIntegration = () => {
  return {
    name: 'font-subset-integration',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const projectRoot = process.cwd();
        const contentDir = path.join(projectRoot, 'src', 'content');
        const fontPath = path.join(projectRoot, 'src', 'assets', 'fonts', 'crjk03w03.ttf');
        const outputDir = fileURLToPath(new URL('./fonts', dir));
        const outputPath = path.join(outputDir, 'crjk-subset');

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        function getAllFiles(dirPath, arrayOfFiles) {
          const files = fs.readdirSync(dirPath);
          arrayOfFiles = arrayOfFiles || [];
          files.forEach(function (file) {
            if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
              arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
            } else {
              if (file.endsWith('.md') || file.endsWith('.mdx')) {
                arrayOfFiles.push(path.join(dirPath, file));
              }
            }
          });
          return arrayOfFiles;
        }

        const allFiles = getAllFiles(contentDir);
        let allText = '';
        allFiles.forEach((file) => {
          allText += fs.readFileSync(file, 'utf-8');
        });

        const font = fontCarrier.transfer(fontPath);
        font.min(allText);
        font.output({ path: outputPath });

        console.log('Font subset created successfully in dist/fonts!');
      },
    },
  };
};

// https://astro.build/config
export default defineConfig({
  // Top-Level Options
  site: 'https://8cat.life',
  // base: '/docs',
  trailingSlash: 'never',

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
  // output: 'static',
  // outDir: 'dist',

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  integrations: [
    redircetFrom({
      contentDir: './src/content',
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
        devicon: ['*']
      }
    }),
    AstroPureIntegration(config),
    createFontSubsetIntegration(),
  ],
  // root: './my-project-directory',

  // Prefetch Options
  prefetch: true,
  // Server Options
  // server: {
  //   host: true,
  //   https: {
  //       key: fs.readFileSync('./localhost+2-key.pem'),
  //       cert: fs.readFileSync('./localhost+2.pem')
  //     },
  // },

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
                  value: normalizedSlug || alias || ''
                }
              ]
            }
          }
        }
      ],
      remarkBreaks,
      remarkMermaid,
      remarkAiNotice
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
      [
        rehypeCallouts,
        {
          props: {
            containerProps: { class: ['callout', 'not-prose'] }
          }
        }
      ]
    ]
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
      host: true,
      // https: {
      //   key: fs.readFileSync('./localhost+2-key.pem'),
      //   cert: fs.readFileSync('./localhost+2.pem')
      // }
    }
  }
})