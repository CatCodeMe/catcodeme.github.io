/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('vfile').VFile} VFile
 */

const notice = {
  en: {
    title: 'AI-Assisted Content',
    body: 'This article is AI-assisted, and the author has strived for accuracy. Please use with discretion.',
    dateTemplates: {
      today: 'Posted today',
      singular: 'Posted 1 day ago',
      plural: 'Posted {days} days ago'
    }
  },
  zh: {
    title: 'AI-Assisted Content',
    body: '本文由AI辅助生成，作者已尽力确保内容准确，请谨慎参考',
    dateTemplates: {
      today: '发布于今天',
      singular: '发布于 1 天前',
      plural: '发布于 {days} 天前'
    }
  }
}

/**
 * A remark plugin to add a notice to posts tagged with 'ai-generation'.
 *
 * @returns {(tree: Node, file: VFile) => void}
 */
export function remarkAiNotice() {
  return (tree, file) => {
    const frontmatter = file.data.astro?.frontmatter;
    const aiModels = frontmatter?.['ai-model'];
    const shouldShowNotice = aiModels && ((Array.isArray(aiModels) && aiModels.length > 0) || (typeof aiModels === 'string' && aiModels.trim() !== ''));

    if (frontmatter && shouldShowNotice) {
      const lang = frontmatter.language?.toLowerCase() === 'english' ? 'en' : 'zh';
      const noticeText = notice[lang];

      const modelsArray = Array.isArray(aiModels) ? aiModels : [aiModels];
      const modelsHtml = `
          <div class="ai-notice-models">
            ${modelsArray.map(model => `<span class="ai-model-tag">${model}</span>`).join('')}
          </div>`;

      const pubDate = frontmatter.publishDate || frontmatter.pubDate || frontmatter.date
      let dateHtml = ''
      if (pubDate) {
        const date = new Date(pubDate)
        dateHtml = `<span class="publish-date"
                        data-publish-date="${date.toISOString()}"
                        data-template-today="${noticeText.dateTemplates.today}"
                        data-template-singular="${noticeText.dateTemplates.singular}"
                        data-template-plural="${noticeText.dateTemplates.plural}">
                      </span>`
      }

      const noticeNode = {
        type: 'html',
        value: `
<div class="ai-notice not-prose">
  <div class="ai-notice-robot-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
  </div>
  <div class="ai-notice-text">
    <p><strong>${noticeText.title}</strong></p>
    <p>${noticeText.body}</p>
  </div>
  ${(modelsHtml || dateHtml) ?
    `<div class="ai-notice-footer">
      ${modelsHtml}
      ${dateHtml}
    </div>` : ''}
</div>
<script>
  if (!window.hasInitializedAiNoticeScript) {
    const calculateDays = () => {
      const dateElements = document.querySelectorAll('.publish-date[data-publish-date]');
      if (dateElements.length === 0) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      dateElements.forEach(el => {
        const pubDateStr = el.dataset.publishDate;
        if (!pubDateStr) return;

        const pubDate = new Date(pubDateStr);
        pubDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - pubDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return;

        let text;
        if (diffDays === 0) {
          text = el.dataset.templateToday;
        } else if (diffDays === 1) {
          text = el.dataset.templateSingular;
        } else {
          text = el.dataset.templatePlural.replace('{days}', diffDays);
        }
        el.textContent = text;
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', calculateDays);
    } else {
      calculateDays();
    }
    window.hasInitializedAiNoticeScript = true;
  }
</script>
`,
      }

      if (tree.children) {
        tree.children.unshift(noticeNode)
      }
    }
  }
}
