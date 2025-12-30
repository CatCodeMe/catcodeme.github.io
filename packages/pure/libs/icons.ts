/**
 * 图标系统使用说明：
 * 
 * 1. **添加新图标**：
 *    - 将新的 .svg 文件放入 `src/icons/` 目录下。
 *    - 运行 `bun run extract-icons` (如果配置了该脚本) 或手动在下面的 `BuiltInIcons` 中添加键名。
 *    - 在 `BuiltInIcons` 中添加对应的键名（值可以为空字符串 ``），这是为了维持 TypeScript 类型提示和 Zod 模式验证。
 * 
 * 2. **在组件中使用**：
 *    - **Astro 组件**：使用 `<Icon name="icon-name" />`。
 *    - **MDX 文件**：可以直接使用 `<Icon name="icon-name" />`（需先导入）。
 * 
 * 3. **优化原理**：
 *    - 本文件不再直接存储 SVG 字符串，而是作为图标名称的类型注册表。
 *    - 实际渲染时，`Icon.astro` 通过 `import.meta.glob` 按需从 `/src/icons/` 加载 SVG 内容。
 *    - 这实现了真正的 Tree-shaking，未使用的图标不会进入最终的 JS Bundle。
 */

export const BuiltInIcons = {
  // Social
  github: '',
  gitlab: '',
  discord: '',
  youtube: '',
  instagram: '',
  x: '',
  telegram: '',
  rss: '',
  email: '',
  reddit: '',
  bluesky: '',
  tiktok: '',
  weibo: '',
  steam: '',
  bilibili: '',
  zhihu: '',
  coolapk: '',
  netease: '',

  // Copyright & share & sponsor
  link: '',
  qrcode: '',
  copyright: '',
  'receive-money': '',
  alipay: '',
  'wechat-pay': '',

  // UI
  menu: '',
  search: '',
  sun: '',
  moon: '',
  computer: '',
  calendar: '',
  time: '',
  earth: '',
  hashtag: '',
  info: '',
  up: '',
  'tag-2': '',
  list: '',

  // Project
  'github-circle': '',
  document: '',
  package: '',

  // Home
  location: '',

  // Aside
  callout_info: '',
  note: '',
  quote: '',
  tip: '',
  warning: '',
  important: '',
  caution: '',
  heart: '',
  star: '',
  book: '',
  doi: '',
  citation: '',
  brain: '',
  pin: '',
  'pin-off': '',
  'open-link-new-tab': '',
  close: '',
  paper_article: '',
  paper_book: '',
  down_arrow: '',
  deep_seek: '',
  cake: '',
  sleep: '',
  msgboard: '',
  archive: '',
  shelf: '',
  about: '',
  friendLink: '',
  contract: ''
}

export const Icons = {
  ...BuiltInIcons
}

export type IconName = keyof typeof Icons
