// FlyMD 博客页面动态加载脚本

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

  const featuredGrid = document.getElementById('featured-grid');
  const blogGrid = document.getElementById('blog-grid');
  let blogData = null;
  let currentLocale = 'zh';

  // 图标 SVG - 用于无封面图片时显示
  const icons = [
    `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>`,
    `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`
  ];

  // 格式化日期 - 简短格式
  function formatDate(dateString, locale) {
    const date = new Date(dateString);
    if (locale === 'en') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  }

  // 获取作者名首字母
  function getAuthorInitial(locale) {
    return locale === 'zh' ? 'F' : 'F';
  }

  // 渲染特色文章卡片（顶部3篇）
  function renderFeaturedCard(article, index) {
    const translation = article.translations[currentLocale];
    if (!translation || translation.status !== 'published') {
      return '';
    }

    const dateStr = formatDate(article.date, currentLocale);
    const tags = translation.tags || [];
    const firstTag = tags[0] || (currentLocale === 'zh' ? '文章' : 'Article');
    const detailUrl = currentLocale === 'zh'
      ? `blog-post.html?slug=${article.slug}`
      : `blog-post.html?slug=${article.slug}&lang=en`;

    // 封面图片或图标
    const hasCover = article.cover && article.cover.trim() !== '';
    const imageContent = hasCover
      ? `<img src="${assetUrl(article.cover)}" alt="${translation.title}" />`
      : `<div class="featured-card-icon">${icons[index % icons.length]}</div>`;
    const imageClass = hasCover ? '' : ' no-cover';

    return `
      <article class="featured-card" data-slug="${article.slug}">
        <div class="featured-card-image${imageClass}">
          ${imageContent}
          <time class="featured-card-date">${dateStr}</time>
        </div>
        <div class="featured-card-content">
          <h2 class="featured-card-title">
            <a href="${detailUrl}">${translation.title}</a>
          </h2>
          <p class="featured-card-excerpt">${translation.summary || ''}</p>
          <div class="featured-card-footer">
            <div class="featured-card-author">${getAuthorInitial(currentLocale)}</div>
            <span class="featured-card-author-name">FlyMD</span>
          </div>
        </div>
      </article>
    `;
  }

  // 渲染普通文章卡片
  function renderArticleCard(article) {
    const translation = article.translations[currentLocale];
    if (!translation || translation.status !== 'published') {
      return '';
    }

    const dateStr = formatDate(article.date, currentLocale);
    const tags = translation.tags || [];
    const firstTag = tags[0] || (currentLocale === 'zh' ? '文章' : 'Article');
    const detailUrl = currentLocale === 'zh'
      ? `blog-post.html?slug=${article.slug}`
      : `blog-post.html?slug=${article.slug}&lang=en`;

    return `
      <article class="blog-card" data-slug="${article.slug}">
        <div class="blog-card-header">
          <span class="blog-card-tag">${firstTag}</span>
          <time class="blog-card-date">${dateStr}</time>
        </div>
        <h2 class="blog-card-title">
          <a href="${detailUrl}">${translation.title}</a>
        </h2>
        <p class="blog-card-excerpt">${translation.summary || ''}</p>
        <div class="blog-card-footer">
          <div class="blog-card-author">${getAuthorInitial(currentLocale)}</div>
          <span class="blog-card-author-name">FlyMD</span>
        </div>
      </article>
    `;
  }

  // 渲染所有文章
  function renderArticles() {
    if (!blogData || !blogData.articles) {
      return;
    }

    // 过滤已发布的文章并按日期排序
    const publishedArticles = blogData.articles
      .filter(article => {
        const trans = article.translations[currentLocale];
        return trans && trans.status === 'published';
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (publishedArticles.length === 0) {
      if (featuredGrid) featuredGrid.innerHTML = '';
      if (blogGrid) {
        blogGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #666;">
            <p>${currentLocale === 'zh' ? '暂无文章' : 'No articles yet'}</p>
          </div>
        `;
      }
      return;
    }

    // 前3篇作为特色文章
    const featuredArticles = publishedArticles.slice(0, 3);
    // 其余作为普通文章
    const regularArticles = publishedArticles.slice(3);

    // 渲染特色文章
    if (featuredGrid) {
      let featuredHtml = '';
      featuredArticles.forEach((article, index) => {
        featuredHtml += renderFeaturedCard(article, index);
      });
      featuredGrid.innerHTML = featuredHtml;
    }

    // 渲染普通文章
    if (blogGrid) {
      if (regularArticles.length === 0) {
        // 如果没有更多文章，隐藏"最新文章"区域
        const latestSection = document.querySelector('.latest-section');
        if (latestSection) {
          latestSection.style.display = 'none';
        }
      } else {
        let regularHtml = '';
        regularArticles.forEach(article => {
          regularHtml += renderArticleCard(article);
        });
        blogGrid.innerHTML = regularHtml;
      }
    }
  }

  // 加载博客数据
  async function loadBlogData() {
    try {
      // 显示加载状态
      if (blogGrid) {
        blogGrid.innerHTML = `
          <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <div style="width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
            <p style="color: #666;">${currentLocale === 'zh' ? '正在加载文章...' : 'Loading articles...'}</p>
          </div>
        `;
      }

      const response = await fetch(assetUrl('content/blog/_index.json'));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      blogData = await response.json();
      renderArticles();
    } catch (error) {
      console.error('Failed to load blog data:', error);
      if (blogGrid) {
        blogGrid.innerHTML = `
          <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #666;">
            <p>${currentLocale === 'zh' ? '加载失败，请刷新重试' : 'Failed to load, please refresh'}</p>
          </div>
        `;
      }
    }
  }

  // 检测当前语言
  function detectLanguage() {
    // 优先从 localStorage 读取
    const saved = localStorage.getItem('preferred-language');
    if (saved) {
      return saved;
    }

    // 检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.toLowerCase().startsWith('zh')) {
      return 'zh';
    }
    return 'en';
  }

  // 监听语言变化
  function setupLanguageListener() {
    // 监听 html 的 data-lang 属性变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-lang') {
          const newLang = document.documentElement.getAttribute('data-lang');
          if (newLang && newLang !== currentLocale) {
            currentLocale = newLang;
            renderArticles();
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-lang']
    });

    // 监听 localStorage 变化（跨标签页）
    window.addEventListener('storage', (e) => {
      if (e.key === 'preferred-language' && e.newValue) {
        currentLocale = e.newValue;
        renderArticles();
      }
    });
  }

  // 初始化
  function init() {
    currentLocale = detectLanguage();
    setupLanguageListener();
    loadBlogData();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 添加旋转动画样式
  if (!document.getElementById('blog-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'blog-spinner-style';
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
})();
