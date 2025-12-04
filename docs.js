// FlyMD 文档页面 - 从 json/md 文件动态加载

(function() {
  'use strict';

  function assetUrl(path, options) {
    if (!path) return path;
    const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('mailto:');
    if (isAbsolute) return path;
    const opts = typeof options === 'object' ? options : { noCache: !!options };
    if (window.cdnUrl) {
      return window.cdnUrl(path, opts);
    }
    if (opts.noCache) {
      const separator = path.indexOf('?') === -1 ? '?' : '&';
      return path + separator + '_t=' + Date.now();
    }
    return path;
  }

  // ROADMAP 原文地址
  const ROADMAP_URLS = {
    zh: 'https://raw.githubusercontent.com/flyhunterl/flymd/main/ROADMAP.md',
    en: 'https://raw.githubusercontent.com/flyhunterl/flymd/main/ROADMAP.en.md'
  };
  const ROADMAP_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 小时

  // 从 GitHub 获取 ROADMAP Markdown（带缓存）
  async function fetchRoadmapMarkdown(locale) {
    const cacheKey = `flymd_roadmap_cache_${locale}`;
    let cachedData = null;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        cachedData = JSON.parse(cached);
        if (Date.now() - cachedData.timestamp < ROADMAP_CACHE_DURATION) {
          return cachedData.content;
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
        cachedData = null;
      }
    }

    const url = ROADMAP_URLS[locale] || ROADMAP_URLS.en;

    try {
      const response = await fetch(url, { headers: { 'Accept': 'text/plain' } });
      if (!response.ok) {
        throw new Error(`GitHub raw content error: ${response.status}`);
      }

      const markdown = await response.text();
      localStorage.setItem(cacheKey, JSON.stringify({
        content: markdown,
        timestamp: Date.now()
      }));

      return markdown;
    } catch (err) {
      console.warn('获取 Roadmap 失败:', err.message);
      if (cachedData) {
        return cachedData.content;
      }
      return null;
    }
  }

  // 渲染 ROADMAP Markdown
  function renderRoadmapMarkdown(markdown, locale) {
    if (!markdown) {
      return locale === 'zh'
        ? '<p>暂时无法加载 Roadmap。</p>'
        : '<p>Unable to load the roadmap right now.</p>';
    }

    if (typeof marked !== 'undefined') {
      return marked.parse(markdown);
    }

    const escapeHtml = (str) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return escapeHtml(markdown)
      .split(/\n{2,}/)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  // 配置 marked
  function configureMarked() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        highlight: function(code, lang) {
          if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          if (typeof hljs !== 'undefined') {
            return hljs.highlightAuto(code).value;
          }
          return code;
        },
        breaks: true,
        gfm: true
      });
    }
  }

  const tocNav = document.getElementById('tocNav');
  const docsContent = document.getElementById('docsContentInner');
  const docsLoading = document.getElementById('docsLoading');

  let docsData = null;
  let currentLocale = 'zh';
  let currentDoc = null;

  // 检测语言
  function detectLanguage() {
    const saved = localStorage.getItem('preferred-language');
    if (saved) return saved;

    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  // 解析 Markdown front matter
  function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      return { frontMatter: {}, body: content };
    }

    const frontMatterStr = match[1];
    const body = match[2];
    const frontMatter = {};

    frontMatterStr.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();
        value = value.replace(/^['"]|['"]$/g, '');
        frontMatter[key] = value;
      }
    });

    return { frontMatter, body };
  }

  // 渲染目录树 - VitePress风格
  function renderTocTree(items, level = 0, parentKey = 'root') {
    if (!items || items.length === 0) return '';

    let html = '';
    items.forEach((item, index) => {
      const hasChildren = item.children && item.children.length > 0;
      const isCategory = !item.file;
      const nodeKey = `${parentKey}-${index}`;

      if (isCategory) {
        // 分类标题 - VitePress风格可折叠
        const categoryId = `toc-cat-${nodeKey}`;
        html += `
          <div class="toc-category" data-category-id="${categoryId}">
            <div class="toc-category-header">
              <span class="toc-category-title">${item.title}</span>
              <span class="toc-category-toggle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
            <div class="toc-category-children">
              ${hasChildren ? renderTocTree(item.children, level + 1, nodeKey) : ''}
            </div>
          </div>
        `;
      } else {
        // 文档链接
        const paddingLeft = level > 0 ? 12 : 0;
        html += `
          <a href="#" class="toc-link" data-slug="${item.slug}" data-file="${item.file}" style="padding-left: ${paddingLeft}px;">
            ${item.title}
          </a>
        `;
      }
    });

    return html;
  }

  function setupTocCategoryToggle() {
    if (!tocNav) return;
    tocNav.querySelectorAll('.toc-category-header').forEach(header => {
      header.addEventListener('click', () => {
        const category = header.closest('.toc-category');
        if (category) {
          category.classList.toggle('collapsed');
        }
      });
    });
  }

  // 更新目录高亮
  function updateTocActive(slug) {
    if (!tocNav) return;

    tocNav.querySelectorAll('.toc-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.slug === slug) {
        link.classList.add('active');
      }
    });
  }

  // 隐藏加载状态
  function hideLoading() {
    if (docsLoading) {
      docsLoading.style.display = 'none';
    }
  }

  // 显示加载状态
  function showLoading() {
    if (docsLoading) {
      docsLoading.style.display = 'block';
    }
  }

  // 加载文档内容
  async function loadDocument(file, slug) {
    if (!docsContent) return;

    try {
      // 如果是 changelog，直接加载 GitHub ROADMAP
      if (slug === 'changelog') {
        const markdown = await fetchRoadmapMarkdown(currentLocale);
        const htmlContent = renderRoadmapMarkdown(markdown, currentLocale);

        hideLoading();

        docsContent.innerHTML = `
          <article class="docs-article">
            <div class="docs-section">
              ${htmlContent}
            </div>
          </article>
        `;

        // 代码高亮
        if (typeof hljs !== 'undefined') {
          docsContent.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
          });
        }

        currentDoc = slug;
        updateTocActive(slug);
        history.replaceState(null, '', `#${slug}`);
        generatePageToc();
        return;
      }

      const response = await fetch(assetUrl(`content/docs/${file}`));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const mdContent = await response.text();
      const { frontMatter, body } = parseFrontMatter(mdContent);

      // 渲染 Markdown
      let htmlContent = body;
      if (typeof marked !== 'undefined') {
        htmlContent = marked.parse(body);
      }

      // 查找文档元数据
      const tree = docsData?.tree?.[currentLocale] || [];
      let docTitle = frontMatter.title || slug;

      const findTitle = (items) => {
        for (const item of items) {
          if (item.slug === slug) return item.title;
          if (item.children) {
            const found = findTitle(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      docTitle = findTitle(tree) || docTitle;

      // 隐藏加载状态，显示内容
      hideLoading();

      docsContent.innerHTML = `
        <article class="docs-article">
          <div class="docs-section">
            ${htmlContent}
          </div>
        </article>
      `;

      // 代码高亮
      if (typeof hljs !== 'undefined') {
        docsContent.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      }

      currentDoc = slug;
      updateTocActive(slug);

      // 更新 URL hash
      history.replaceState(null, '', `#${slug}`);

      // 重新生成页内目录
      generatePageToc();

    } catch (error) {
      console.error('Failed to load document:', error);
      hideLoading();
      docsContent.innerHTML = `
        <article class="docs-article">
          <div class="docs-section">
            <h2>${currentLocale === 'zh' ? '加载失败' : 'Failed to Load'}</h2>
            <p>${currentLocale === 'zh' ? '无法加载文档内容，请重试。' : 'Unable to load document content, please try again.'}</p>
            <p style="color: var(--text-secondary); font-size: 12px;">Error: ${error.message}</p>
          </div>
        </article>
      `;
    }
  }

  // 生成页内目录（右侧浮动）
  function generatePageToc() {
    const article = docsContent?.querySelector('.docs-article');
    if (!article) return;

    const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const pageToc = document.getElementById('pageTocNav');
    const mobilePageToc = document.getElementById('mobilePageTocNav');

    if (headings.length === 0) {
      if (pageToc) pageToc.innerHTML = '';
      if (mobilePageToc) mobilePageToc.innerHTML = '';
      return;
    }

    let html = '';
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }
      const level = parseInt(heading.tagName.substring(1));
      html += `<a href="#${heading.id}" class="page-toc-link" data-level="${level}">${heading.textContent}</a>`;
    });

    if (pageToc) pageToc.innerHTML = html;
    if (mobilePageToc) mobilePageToc.innerHTML = html;

    // 绑定点击事件（桌面端）
    if (pageToc) {
      pageToc.querySelectorAll('.page-toc-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToHeading(link.getAttribute('href').substring(1));
        });
      });
    }

    // 绑定点击事件（移动端）
    if (mobilePageToc) {
      mobilePageToc.querySelectorAll('.page-toc-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          closeMobilePageToc();
          scrollToHeading(link.getAttribute('href').substring(1));
        });
      });
    }

    // 监听滚动高亮当前标题
    setupScrollSpy(headings);
  }

  // 滚动到指定标题
  function scrollToHeading(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
      const headerHeight = 80;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  }

  // 滚动监听高亮
  function setupScrollSpy(headings) {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          updatePageTocActive(id);
        }
      });
    }, {
      rootMargin: '-80px 0px -80% 0px'
    });

    headings.forEach(heading => {
      observer.observe(heading);
    });
  }

  // 更新页内目录高亮
  function updatePageTocActive(id) {
    const pageToc = document.getElementById('pageTocNav');
    const mobilePageToc = document.getElementById('mobilePageTocNav');

    [pageToc, mobilePageToc].forEach(toc => {
      if (!toc) return;
      toc.querySelectorAll('.page-toc-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // 移动端 On this page 下拉菜单控制
  function setupMobilePageToc() {
    const btn = document.getElementById('mobilePageTocBtn');
    const dropdown = document.getElementById('mobilePageTocDropdown');

    if (!btn || !dropdown) return;

    // 点击按钮切换下拉菜单
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobilePageToc();
    });

    // 点击回到顶部链接
    const backToTopLink = dropdown.querySelector('.back-to-top');
    if (backToTopLink) {
      backToTopLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobilePageToc();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        closeMobilePageToc();
      }
    });
  }

  function toggleMobilePageToc() {
    const btn = document.getElementById('mobilePageTocBtn');
    const dropdown = document.getElementById('mobilePageTocDropdown');
    if (btn && dropdown) {
      btn.classList.toggle('open');
      dropdown.classList.toggle('open');
    }
  }

  function openMobilePageToc() {
    const btn = document.getElementById('mobilePageTocBtn');
    const dropdown = document.getElementById('mobilePageTocDropdown');
    if (btn) btn.classList.add('open');
    if (dropdown) dropdown.classList.add('open');
  }

  function closeMobilePageToc() {
    const btn = document.getElementById('mobilePageTocBtn');
    const dropdown = document.getElementById('mobilePageTocDropdown');
    if (btn) btn.classList.remove('open');
    if (dropdown) dropdown.classList.remove('open');
  }

  // 渲染目录
  function renderToc() {
    if (!tocNav || !docsData) return;

    const tree = docsData.tree?.[currentLocale] || [];

    if (tree.length === 0) {
      tocNav.innerHTML = `<div style="color: var(--text-secondary); font-size: 12px; padding: 12px;">
        ${currentLocale === 'zh' ? '暂无目录' : 'No documents'}
      </div>`;
      hideLoading();
      return;
    }

    tocNav.innerHTML = renderTocTree(tree);
    setupTocCategoryToggle();

    // 绑定点击事件
    tocNav.querySelectorAll('.toc-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const file = link.dataset.file;
        const slug = link.dataset.slug;
        if (file) {
          loadDocument(file, slug);
        }
      });
    });

    // 加载默认文档或 hash 指定的文档
    const hash = window.location.hash.substring(1);
    let defaultDoc = null;

    const findFirstDoc = (items) => {
      for (const item of items) {
        if (item.file) return item;
        if (item.children) {
          const found = findFirstDoc(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const findDocBySlug = (items, slug) => {
      for (const item of items) {
        if (item.slug === slug && item.file) return item;
        if (item.children) {
          const found = findDocBySlug(item.children, slug);
          if (found) return found;
        }
      }
      return null;
    };

    if (hash) {
      defaultDoc = findDocBySlug(tree, hash);
    }
    if (!defaultDoc) {
      defaultDoc = findFirstDoc(tree);
    }

    if (defaultDoc) {
      loadDocument(defaultDoc.file, defaultDoc.slug);
    } else {
      hideLoading();
    }
  }

  // 加载文档数据
  async function loadDocsData() {
    showLoading();

    try {
      const response = await fetch(assetUrl('content/docs/_index.json'));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      docsData = await response.json();
      renderToc();

    } catch (error) {
      console.error('Failed to load docs data:', error);
      hideLoading();

      if (tocNav) {
        tocNav.innerHTML = `<div style="color: var(--text-secondary); font-size: 12px; padding: 12px;">
          ${currentLocale === 'zh' ? '加载目录失败' : 'Failed to load menu'}
        </div>`;
      }

      if (docsContent) {
        docsContent.innerHTML = `
          <article class="docs-article">
            <div class="docs-section">
              <h2>${currentLocale === 'zh' ? '加载失败' : 'Failed to Load'}</h2>
              <p>${currentLocale === 'zh' ? '无法加载文档目录，请检查 content/docs/_index.json 文件是否存在。' : 'Unable to load document index, please check if content/docs/_index.json exists.'}</p>
              <p style="color: var(--text-secondary); font-size: 12px;">Error: ${error.message}</p>
            </div>
          </article>
        `;
      }
    }
  }

  // 监听语言变化
  function setupLanguageListener() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-lang') {
          const newLang = document.documentElement.getAttribute('data-lang');
          if (newLang && newLang !== currentLocale) {
            currentLocale = newLang;
            if (docsData) {
              renderToc();
            }
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-lang']
    });
  }

  // 监听 hash 变化
  function setupHashListener() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.substring(1);
      if (hash && docsData) {
        const tree = docsData.tree?.[currentLocale] || [];
        const findDoc = (items, slug) => {
          for (const item of items) {
            if (item.slug === slug && item.file) return item;
            if (item.children) {
              const found = findDoc(item.children, slug);
              if (found) return found;
            }
          }
          return null;
        };
        const doc = findDoc(tree, hash);
        if (doc && doc.slug !== currentDoc) {
          loadDocument(doc.file, doc.slug);
        }
      }
    });
  }

  // 初始化
  function init() {
    currentLocale = detectLanguage();
    configureMarked();
    setupLanguageListener();
    setupHashListener();
    setupMobilePageToc();
    loadDocsData();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
