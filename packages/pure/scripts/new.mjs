/**
 * Create a new post in the content directory
 *
 * Usage: astro-pure new [options] <post-title>
 *
 * Options:
 *   -l, --lang <en|zh>   Set the language (default: en)
 *   -d, --draft          Create a draft post (default: false)
 *   -m, --mdx            Use MDX format (default: false)
 *   -h, --help           Show this help message
 *
 * Example:
 *   astro-pure new "Hello World"
 *   astro-pure new -l zh "你好，世界"
 */

import fs from 'node:fs'
import path from 'node:path'

import minimist from './libs/minimist.cjs'
import slugify from './libs/slugify.cjs'

const ID_LENGTH = 4;
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function generateShortId(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
  }
  return result;
}

function getDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-based
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function getPostSlug(postTitle) {
  let slug = slugify(postTitle).toLocaleLowerCase()
  if (slug === '') {
    slug = 'untitled'
  }
  return slug
}

const HELP_INFO = `Usage: astro-pure new [options] <post-title>

Options:
  -l, --lang           Set the language (default: null)
  -d, --draft          Create a draft post (default: false)
  -m, --mdx            Use MDX format (default: false)
  -h, --help           Show this help message

Example:
  astro-pure new "Hello World"
  astro-pure new -l zh "你好，世界"
`
const TARGET_DIR = 'src/content/blog/'

function getExistingSlugs() {
  const existingSlugs = new Set();
  const files = fs.readdirSync(TARGET_DIR);

  for (const file of files) {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const filePath = path.join(TARGET_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (frontmatterMatch && frontmatterMatch[1]) {
        const frontmatter = frontmatterMatch[1];
        const slugMatch = frontmatter.match(/^slug:\s*(.*)$/m);
        if (slugMatch && slugMatch[1]) {
          existingSlugs.add(slugMatch[1].trim());
        }
      }
    }
  }
  return existingSlugs;
}

export default function main(args) {
  const parsedArgs = minimist(args, {
    string: ['lang'],
    boolean: ['draft', 'mdx', 'help'],
    default: {
      lang: null,
      draft: false,
      mdx: false
    },
    alias: {
      l: 'lang',
      d: 'draft',
      m: 'mdx',
      h: 'help'
    }
  })

  if (parsedArgs.help) {
    console.log(HELP_INFO)
    process.exit(0)
  }

  let postTitle = parsedArgs._.join(' ') // join the rest of the arguments
  if (!postTitle || postTitle.trim() === '') {
    postTitle = 'Untitled'
  }
  console.log('Creating new post:', postTitle)

  const fileExtension = parsedArgs.mdx ? '.mdx' : '.md'
  const fileName = getPostSlug(postTitle) + fileExtension
  const fullPath = path.join(TARGET_DIR, fileName)

  console.log('Full path:', fullPath)

  if (fs.existsSync(fullPath)) {
    console.error(`ERROR: File ${fullPath} already exists`)
    process.exit(1)
  }

  let slug = generateShortId(ID_LENGTH);
  const existingSlugs = getExistingSlugs();

  while (existingSlugs.has(slug)) {
    slug = generateShortId(ID_LENGTH);
  }

  let content = `---\ntitle: ${postTitle}\ndescription: 'Write your description here.'\npublishDate: ${getDate()}\nslug: ${slug}\n`
  content += parsedArgs.draft ? 'draft: true\n' : ''
  content += parsedArgs.lang ? `lang: ${parsedArgs.lang}\n` : ''
  content += `tags: ['tag1', 'tag2']\n---\n\nWrite your content here.
`

  fs.writeFileSync(fullPath, content)
  console.log(`Post "${postTitle}" created at ${fullPath}`)
}

main(process.argv.slice(2));