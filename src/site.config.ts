import type { CardListData } from 'astro-pure/types'
import type { ThemeUserConfig,Config,IntegrationUserConfig } from 'packages/pure/types'

export const theme: ThemeUserConfig = {
  // === Basic configuration ===
  /** Title for your website. Will be used in metadata and as browser tab title. */
  title: 'CCM\'blog',
  /** Will be used in index page & copyright declaration */
  author: 'CCM',
  /** Description metadata for your website. Can be used in page metadata. */
  description: 'Stay hungry, stay foolish',
  /** The default favicon for your site which should be a path to an image in the `public/` directory. */
  favicon: '/favicon/favicon.ico',
  /** Specify the default language for this site. */
  locale: {
    lang: 'zh-CN',
    attrs: 'en_US',
    // Date locale
    dateLocale: 'en-US',
    dateOptions: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  },
  /** Set a logo image to show in the homepage. */
  logo: {
    src: 'src/assets/avatar.png',
    alt: 'Avatar'
  },

  // === Global configuration ===
  titleDelimiter: '•',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',

  // Still in test
  head: [
    /* Telegram channel */
    // {
    //   tag: 'meta',
    //   attrs: { name: 'telegram:channel', content: '@cworld0_cn' },
    //   content: ''
    // }
  ],
  customCss: [],

  /** Configure the header of your site. */
  header: {
    menu: [
      { title: 'Blog', link: '/blog' },
      { title: 'Archives', link: '/archives' },
      // { title: 'Docs', link: '/docs' },
      // { title: 'Projects', link: '/projects' },
      { title: 'Cats', link: '/cats' },
      // { title: 'Links', link: '/links' },
      { title: 'About', link: '/about' }
    ]
  },

  /** Configure the footer of your site. */
  footer: {
    // Year format
    year: `© ${new Date().getFullYear()}`,
    // year: `© 2019 - ${new Date().getFullYear()}`,
    links: [
      // {
      //   title: 'Moe ICP APTX4869',
      //   link: 'https://icp.gov.moe/?keyword=APTX4869',
      //   style: 'text-sm'
      // },
      // {
      //   title: 'CC BY-NC-SA 4.0',
      //   link: '/terms/list',
      //   pos: 2
      // }
    ],
    credits: true,
    social: { github: 'https://github.com/catcodeme' }
  },

  content: {
    externalLinksContent: ' ↗',
    /** Blog page size for pagination (optional) */
    blogPageSize: 8,
    externalLinkArrow: false, // show external link arrow
    // Currently support weibo, x, bluesky
    share: ['weibo', 'x', 'bluesky']
  }
}

export const integ: IntegrationUserConfig = {
  // Links management
  // See: https://astro-pure.js.org/docs/integrations/links
  links: {
    // Friend logbook
    logbook: [
      // { date: '2024-07-01', content: 'Lorem ipsum dolor sit amet.' },
      // { date: '2024-07-01', content: 'vidit suscipit at mei.' },
      // { date: '2024-07-01', content: 'Quem denique mea id.' }
    ],
    // Yourself link info
    applyTip: [
      { name: 'Name', val: theme.title },
      { name: 'Desc', val: theme.description || 'Null' },
      { name: 'Link', val: 'https://8cat.life/' },
      { name: 'Avatar', val: 'https://avatars.githubusercontent.com/u/11496772?v=4&size=64' }
    ]
  },
  // Enable page search function
  pagefind: true,
  // Add a random quote to the footer (default on homepage footer)
  // See: https://astro-pure.js.org/docs/integrations/advanced#web-content-render
  quote: {
    // https://developer.hitokoto.cn/sentence/#%E8%AF%B7%E6%B1%82%E5%9C%B0%E5%9D%80
    // server: 'https://v1.hitokoto.cn/?c=i',
    // target: (data) => (data as { hitokoto: string }).hitokoto || 'Error'
    // https://github.com/lukePeavey/quotable
    server: 'https://api.quotable.io/quotes/random?maxLength=60',
    target: `(data) => data[0].content || 'Error'`
  },
  // UnoCSS typography
  // See: https://unocss.dev/presets/typography
  typography: {
    class: 'prose text-base text-muted-foreground',
    // The style of blockquote font, normal or italic (default to italic in typography)
    blockquoteStyle: 'italic',
    // The style of inline code block, code or modern (default to code in typography)
    inlineCodeBlockStyle: 'modern'
  },
  // A lightbox library that can add zoom effect
  // See: https://astro-pure.js.org/docs/integrations/others#medium-zoom
  mediumZoom: {
    enable: true, // disable it will not load the whole library
    selector: '.prose .zoomable',
    options: {
      className: 'zoomable'
    }
  },
  // Comment system
  waline: {
    enable: false,
    server: 'https://waline.8cat.life/',
    emoji: ['weibo'],
    additionalConfigs: {
      search: false,
      meta: ['nick', 'mail'],
      requiredMeta: ['nick'],
      imageUploader: false,
      reaction: false,
      pageview: true,
      comment: true,
      placeholder: '欢迎留言~ (邮箱用于接收回复通知，不会公开)',
      copyright: false,
      locale: {
        placeholder: '欢迎留言~ (邮箱用于接收回复通知，不会公开)'
      }
    }
  },
  giscus: {
    enable: true,
    repo: 'CatCodeMe/catcodeme.github.io', // 仓库名
    repoId: 'R_kgDOPOflqw', // 仓库 ID
    category: 'Announcements', // 分类名
    categoryId: 'DIC_kwDOPOflq84CtHbc', // 分类 ID
    mapping: 'og:title', // 评论关联方式
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: 'preferred_color_scheme', // 可选: light, dark, transparent_dark, preferred_color_scheme
    lang: 'en'
  }
}

export const terms: CardListData = {
  title: 'Terms content',
  list: [
    {
      title: 'Privacy Policy',
      link: '/terms/privacy-policy'
    },
    {
      title: 'Terms and Conditions',
      link: '/terms/terms-and-conditions'
    },
    {
      title: 'Copyright',
      link: '/terms/copyright'
    },
    {
      title: 'Disclaimer',
      link: '/terms/disclaimer'
    }
  ]
}

const config = { ...theme, integ } as Config
export default config