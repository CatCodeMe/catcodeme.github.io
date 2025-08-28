
import type { Element, Root, Node } from 'hast';
import { rehype } from 'rehype';

const isElement = (node: Node): node is Element => node.type === 'element';

export type SplitType = 'ol' | 'h2' | 'h3' | 'h4' | 'hr';

/**
 * Process HTML content to transform it into styled steps.
 * @param html Inner HTML passed to the <AdvanceStep> component.
 * @param split The separator type to use for splitting steps.
 */
export const processAdvanceSteps = (html: string | undefined, split: SplitType) => {
  if (!html) return { html: '' };

  const stepsProcessor = rehype()
    .data('settings', { fragment: true })
    .use(function advancedSteps() {
      return (tree: Root) => {
        // --- OL Split Mode ---
        if (split === 'ol') {
          const rootElements = tree.children.filter(isElement);
          if (rootElements.length === 1 && rootElements[0].tagName === 'ol') {
            const ol = rootElements[0];
            const classes = new Set(
              Array.isArray(ol.properties.className)
                ? ol.properties.className.map(String)
                : [],
            );
            classes.add('advanced-steps');
            classes.add('not-prose');
            ol.properties.className = [...classes];
            ol.properties.role = 'list';
          } else {
            // Fallback for 'ol' mode: if content is not a single OL, wrap everything in one step.
            if (tree.children.length > 0) {
              const li: Element = { type: 'element', tagName: 'li', properties: {}, children: tree.children };
              tree.children = [{
                type: 'element',
                tagName: 'ol',
                properties: { className: ['advanced-steps', 'not-prose'], role: 'list' },
                children: [li],
              }];
            }
          }
          return;
        }

        // --- Tag-based Split Mode (h2, hr, etc.) ---
        const isAuthoritativeSeparator = (node: Node): boolean => {
          return isElement(node) && node.tagName === split;
        };

        const hasSeparators = tree.children.some(isAuthoritativeSeparator);

        if (!hasSeparators) {
          if (tree.children.length > 0) {
            const li: Element = { type: 'element', tagName: 'li', properties: {}, children: tree.children };
            tree.children = [{
              type: 'element',
              tagName: 'ol',
              properties: { className: ['advanced-steps', 'not-prose'], role: 'list' },
              children: [li],
            }];
          }
          return;
        }

        const steps: Node[][] = [];
        let currentStep: Node[] | null = null;

        for (const node of tree.children) {
          if (isAuthoritativeSeparator(node)) {
            currentStep = [];
            steps.push(currentStep);
            if (split !== 'hr') {
              currentStep.push(node);
            }
          } else {
            if (currentStep === null) {
              currentStep = [];
              steps.push(currentStep);
            }
            currentStep.push(node);
          }
        }

        const listItems = steps
          .filter(
            (step) =>
              step.length > 0 &&
              step.some((node) => isElement(node) || (node.type === 'text' && node.value.trim() !== '')),
          )
          .map((stepNodes) => {
            return {
              type: 'element',
              tagName: 'li',
              properties: {},
              children: stepNodes,
            } as Element;
          });

        const ol: Element = {
          type: 'element',
          tagName: 'ol',
          properties: { className: ['advanced-steps', 'not-prose'], role: 'list' },
          children: listItems,
        };

        tree.children = [ol];
      };
    });

  const file = stepsProcessor.processSync({ value: html });
  return { html: file.toString() };
};
