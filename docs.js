// FlyMD 文档页面 - 从 json/md 文件动态加载

(function() {
  'use strict';

  // GitHub 仓库配置
  const GITHUB_REPO = 'flyhunterl/flymd';
  const GITHUB_RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases`;

  // 缓存 GitHub releases 数据
  let cachedReleases = null;

  // 从 GitHub API 获取 releases
  async function fetchGitHubReleases() {
    // 检查 localStorage 缓存
    const cached = localStorage.getItem('flymd_releases_cache');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        // 缓存 30 分钟有效
        if (Date.now() - data.timestamp < 30 * 60 * 1000) {
          cachedReleases = data.releases;
          return data.releases;
        }
      } catch (e) {
        localStorage.removeItem('flymd_releases_cache');
      }
    }

    try {
      const response = await fetch(GITHUB_RELEASES_API, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const releases = await response.json();
      cachedReleases = releases;

      // 缓存到 localStorage
      localStorage.setItem('flymd_releases_cache', JSON.stringify({
        releases,
        timestamp: Date.now()
      }));

      return releases;
    } catch (err) {
      console.warn('获取 GitHub Releases 失败:', err.message);
      // 如果有过期缓存，仍然使用
      if (cachedReleases) {
        return cachedReleases;
      }
      return null;
    }
  }

  // 将 GitHub releases 渲染为 changelog HTML
  function renderChangelogFromReleases(releases, locale) {
    if (!releases || releases.length === 0) {
      return locale === 'zh'
        ? '<p>暂无更新日志</p>'
        : '<p>No changelog available</p>';
    }

    let html = `<h1>${locale === 'zh' ? '更新日志' : 'Changelog'}</h1>\n`;

    releases.forEach(release => {
      const version = release.tag_name || release.name;
      const body = release.body || '';
      const publishedAt = release.published_at
        ? new Date(release.published_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')
        : '';

      html += `<h2>${version}</h2>\n`;

      if (publishedAt) {
        html += `<p style="color: var(--text-secondary); font-size: 0.9em; margin-top: -0.5em;">${publishedAt}</p>\n`;
      }

      // 渲染 release body（markdown 格式）
      if (body && typeof marked !== 'undefined') {
        html += marked.parse(body);
      } else if (body) {
        // 简单处理：将换行转为列表
        const lines = body.split('\n');
        let inList = false;

        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) {
              html += '<ul>\n';
              inList = true;
            }
            html += `<li>${trimmed.substring(2)}</li>\n`;
          } else {
            if (inList) {
              html += '</ul>\n';
              inList = false;
            }
            if (trimmed) {
              html += `<p>${trimmed}</p>\n`;
            }
          }
        });

        if (inList) {
          html += '</ul>\n';
        }
      }
    });

    return html;
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
      // 如果是 changelog，从 GitHub releases 获取
      if (slug === 'changelog') {
        const releases = await fetchGitHubReleases();
        const htmlContent = renderChangelogFromReleases(releases, currentLocale);

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

      const response = await fetch(`content/docs/${file}`);
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
      const response = await fetch('content/docs/_index.json');
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
