import type { Config, IntegrationUserConfig, ThemeUserConfig } from 'packages/pure/types';
import type { CardListData } from 'astro-pure/types';
import type { IconName } from '../packages/pure/libs/icons';


const menu: { title: string; link: string; icon?: IconName; iconImg?: string }[] = [
  { title: '文章', link: '/blog', icon: 'document' },
  { title: '归档', link: '/archives', icon: 'archive' },
  // { title: '书架', link: '/shelf', icon: 'shelf' },
  // { title: 'Projects', link: '/projects' },
  { title: '关于', link: '/about', icon: 'about' },
  { title: '留言板', link: '/msgboard', icon: 'msgboard' },
  { title: '', link: '/cats', iconImg: '/favicon/favicon-32x32.png' }
]

export const theme: ThemeUserConfig = {
  // === Basic configuration ===
  /** Title for your website. Will be used in metadata and as browser tab title. */
  title: 'CCM',
  /** Will be used in index page & copyright declaration */
  author: 'ccm',
  about: '写代码赖以生存，读闲书文明精神，想问题认识世界',
  /** Description metadata for your website. Can be used in page metadata. */
  description: '文字沉淀生命, 回忆勾连古今',
  /** The default favicon for your site which should be a path to an image in the `public/` directory. */
  favicon: '/favicon/favicon.ico',
  /** Specify the default language for this site. */
  locale: {
    lang: 'zh-CN',
    // attrs: 'en_US',
    attrs: 'zh_CN',
    // Date locale
    // dateLocale: 'en-US',
    dateLocale: 'zh-CN',
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
  npmCDN: 'https://gcore.jsdelivr.net/npm',

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
    menu
  },

  /** Configure the footer of your site. */
  footer: {
    // Year format
    year: `© ${new Date().getFullYear()}`,
    // year: `© 2019 - ${new Date().getFullYear()}`,
    links: [
      {
        title: '京ICP备2025143479号-1',
        link: 'https://beian.miit.gov.cn/',
        style: 'text-sm'
      },
      {
        title: 'Site Policy',
        link: '/terms/list',
        pos: 1
      }
    ],
    credits: true,
    social: {
      travelling: {
        label: '🚇 Travelling',
        url: 'https://www.travellings.cn/train.html',
        textOnly: true
      }
    }
  },

  content: {
    externalLinks: {
      content: '',
      customIcons: {
        'github.com': 'github'
      }
    },
    /** Blog page size for pagination (optional) */
    blogPageSize: 8,
    // Currently support weibo, x, bluesky
    share: ['x', 'bluesky']
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
      { name: 'Avatar', val: 'https://avatars.githubusercontent.com/u/11496772?v=4&size=64' },
    ],
  },
  // Enable page search function
  pagefind: true,
  // Add a random quote to the footer (default on homepage footer)
  // See: https://astro-pure.js.org/docs/integrations/advanced#web-content-render
  quote: {
    // 固定显示格言
    server: 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify([{ content: '文字沉淀生命, 回忆勾连古今' }])),
    target: `(data) => data[0].content || '文字沉淀生命, 回忆勾连古今'`,
  },
  // UnoCSS typography
  // See: https://unocss.dev/presets/typography
  typography: {
    class: 'prose text-base text-muted-foreground',
    // The style of blockquote font, normal or italic (default to italic in typography)
    blockquoteStyle: 'italic',
    // The style of inline code block, code or modern (default to code in typography)
    inlineCodeBlockStyle: 'modern',
  },
  // A lightbox library that can add zoom effect
  // See: https://astro-pure.js.org/docs/integrations/others#medium-zoom
  mediumZoom: {
    enable: true, // disable it will not load the whole library
    selector: '.prose .zoomable',
    options: {
      className: 'zoomable',
    },
  },
  // Comment system
  waline: {
    enable: false,
    server: 'https://waline.8cat.life',
    emoji: ['qq'],
    additionalConfigs: {
      // turnstileKey: '0x4AAAAAAB2iD4bdDPvuzxk1',
      search: false, //表情包搜索
      lang: 'zh-CN',
      meta: ['nick', 'mail'],
      requiredMeta: ['nick'],
      login: 'force',
      wordlimit: 1024,
      // withCredentials: true,
      reaction: [
        '/waline/1.png',
        '/waline/2.png',
        '/waline/3.png',
        '/waline/4.png',
        '/waline/5.png',
      ],
      pageview: true, //页面 pv
      comment: true, //页面评论数
      locale: {
        placeholder: '欢迎留言~ (邮箱用于接收回复通知，不会公开)',
        reactionTitle: '',
        region: '',
      },
    },
  },
  giscus: {
    enable: true,
    repo: 'CatCodeMe/catcodeme.github.io', // 仓库名
    repoId: 'R_kgDOLTuIuQ', // 仓库 ID
    category: 'General', // 分类名
    categoryId: 'DIC_kwDOLTuIuc4Csz7O',
    mapping: 'pathname', // 评论关联方式
    strict: '0',
    reactionsEnabled: '0',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: 'noborder_light', // 可选: light, dark, transparent_dark, preferred_color_scheme
    lang: 'en',
  },
};

export const terms: CardListData = {
  title: 'Terms content',
  list: [
    {
      title: 'Privacy Policy',
      link: '/terms/privacy-policy',
    },
    {
      title: 'Terms and Conditions',
      link: '/terms/terms-and-conditions',
    },
    {
      title: 'Copyright',
      link: '/terms/copyright',
    },
    {
      title: 'Disclaimer',
      link: '/terms/disclaimer',
    },
  ],
};

const config = { ...theme, integ } as Config;
export default config;