// https://github.com/rehypejs/rehype-external-links
import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'
import { Icons } from '../libs/icons'
import isAbsoluteUrl from '../utils/is-absolute-url'

export interface ExternalLinkOptions {
  protocols?: string[]
  rel?: string | string[]
  target?: string
  properties?: Record<string, unknown>
  customIcons?: Record<string, string> // hostname -> icon key
}

const defaultProtocols = ['http', 'https']

export default function rehypeExternalLinks(options: ExternalLinkOptions = {}) {
  const {
    protocols = defaultProtocols,
    rel = ['nofollow', 'noopener', 'noreferrer'],
    target = '_blank',
    properties = {},
    customIcons = {}
  } = options

  return async function transformer(tree: Root): Promise<void> {
    const nodesToProcess: { node: Element; hostname: string }[] = []

    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a' && typeof node.properties?.href === 'string') {
        const href = node.properties.href
        const protocolRelative = href.startsWith('//')
        const protocol = protocolRelative ? 'http' : href.slice(0, href.indexOf(':'))

        if (protocolRelative || (isAbsoluteUrl(href) && protocols.includes(protocol))) {
          node.properties = {
            ...node.properties,
            ...properties,
            rel,
            target
          }

          const url = protocolRelative ? `http:${href}` : href
          try {
            const hostname = new URL(url).hostname
            nodesToProcess.push({ node, hostname })
          } catch (e) {
            // Ignore invalid URLs
          }
        }
      }
    })

    await Promise.all(
      nodesToProcess.map(async ({ node, hostname }) => {
        let iconNode: Element | undefined

        const customIconKey = customIcons?.[hostname]
        if (customIconKey) {
          let svgString = Icons[customIconKey as keyof typeof Icons]
          if (svgString) {
            if (!svgString.trim().startsWith('<svg')) {
              svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">${svgString}</svg>`
            }
            const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`
            iconNode = {
              type: 'element',
              tagName: 'img',
              properties: {
                src: dataUri,
                className: ['external-link-icon'],
                alt: '', // Decorative
                width: 16,
                height: 16
              },
              children: []
            }
          }
        }

        if (!iconNode) {
          const controller = new AbortController()
          const timeout = setTimeout(() => {
            controller.abort()
          }, 2000)

          try {
            const response = await fetch(`https://www.google.com/s2/favicons?domain=${hostname}&size=16`, {
              signal: controller.signal
            })

            if (!response.ok) {
              throw new Error(`Failed to fetch favicon for ${hostname}, status: ${response.status}`)
            }

            const buffer = await response.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            const type = response.headers.get('content-type') || 'image/x-icon'
            const dataUri = `data:${type};base64,${base64}`

            iconNode = {
              type: 'element',
              tagName: 'img',
              properties: {
                src: dataUri,
                className: ['external-link-icon'],
                alt: '', // Decorative
                width: 16,
                height: 16
              },
              children: []
            }
          } catch (e) {
            // When timeout or other fetch error occurs
            iconNode = {
              type: 'element',
              tagName: 'span',
              properties: {
                className: ['external-link-icon']
              },
              children: [{ type: 'text', value: '🌐' }]
            }
          } finally {
            clearTimeout(timeout)
          }
        }

        if (iconNode) {
          node.children.unshift(iconNode)
        }
      })
    )
  }
}
