import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

export const remarkMermaid: Plugin<[], Root> = function () {
  return function (tree) {
    visit(tree, 'code', (node) => {
      if (node.lang === 'mermaid') {
        node.type = 'html'
        node.value = `<pre class="mermaid">${node.value}</pre>`
      }
    })
  }
}
