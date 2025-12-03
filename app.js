// FlyMD 网站交互脚本

// CDN URL 辅助函数（在 cdn.js 加载前的后备方案）
function getCdnUrl(path, noCache) {
  if (window.cdnUrl) {
    return window.cdnUrl(path, { noCache: noCache });
  }
  // 后备方案：直接使用相对路径
  if (noCache) {
    return path + (path.indexOf('?') === -1 ? '?' : '&') + '_t=' + Date.now();
  }
  return path;
}

document.addEventListener('DOMContentLoaded', function() {
  // ===============================
  // 自动加载最新博客文章
  // ===============================
  function loadLatestPost() {
    const pillRow = document.querySelector('.feature-pill-row');
    if (!pillRow) return;

    // 从博客索引获取最新文章
    fetch(getCdnUrl('content/blog/_index.json', true))
      .then(response => response.json())
      .then(blogData => {
        const currentLang = localStorage.getItem('preferred-language') ||
          (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');

        // 过滤已发布的文章并按日期排序
        const publishedArticles = (blogData.articles || [])
          .filter(article => {
            const trans = article.translations[currentLang];
            return trans && trans.status === 'published';
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (publishedArticles.length === 0) {
          return;
        }

        // 获取最新文章
        const latestArticle = publishedArticles[0];
        const translation = latestArticle.translations[currentLang];
        const tags = translation.tags || [];
        const firstTag = tags[0] || (currentLang === 'zh' ? '更新' : 'Update');

        // 构建文章链接
        const detailUrl = currentLang === 'zh'
          ? `blog-post.html?slug=${latestArticle.slug}`
          : `blog-post.html?slug=${latestArticle.slug}&lang=en`;

        // 更新链接
        pillRow.href = detailUrl;

        // 更新标签
        const tagText = pillRow.querySelector('.feature-pill-tag > span:last-child');
        if (tagText) {
          const zhTag = latestArticle.translations.zh?.tags?.[0] || '更新';
          const enTag = latestArticle.translations.en?.tags?.[0] || 'Update';
          tagText.textContent = currentLang === 'zh' ? zhTag : enTag;
          tagText.setAttribute('data-zh', zhTag);
          tagText.setAttribute('data-en', enTag);
        }

        // 更新标题
        const titleText = pillRow.querySelector('.feature-pill-text');
        if (titleText) {
          const zhTitle = latestArticle.translations.zh?.title || '';
          const enTitle = latestArticle.translations.en?.title || '';
          titleText.textContent = currentLang === 'zh' ? zhTitle : enTitle;
          titleText.setAttribute('data-zh', zhTitle);
          titleText.setAttribute('data-en', enTitle);
        }

        // 更新按钮文字
        const btnText = pillRow.querySelector('.feature-pill-btn');
        if (btnText) {
          btnText.setAttribute('data-zh', '点击详情');
          btnText.setAttribute('data-en', 'Details');
          btnText.textContent = currentLang === 'zh' ? '点击详情' : 'Details';
        }
      })
      .catch(err => {
        console.log('无法加载最新文章信息:', err);
      });
  }

  // 页面加载时获取最新文章
  loadLatestPost();
  // 顶栏滚动效果 - 等待组件加载完成后执行
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
      // 页面加载时检查一次（如果已经滚动了）
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      }
    }
  }

  // 监听组件加载完成事件
  document.addEventListener('componentsLoaded', initHeaderScroll);
  // 如果组件已加载（header 已存在），直接执行
  if (document.querySelector('.site-header')) {
    initHeaderScroll();
  }

  // ===============================
  // 移动端汉堡菜单功能
  // ===============================
  function initMobileMenu() {
    const header = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuDropdown = document.querySelector('.mobile-menu-dropdown');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (!header || !menuToggle || !menuDropdown) return;

    // 打开菜单
    function openMenu() {
      header.setAttribute('data-menu-state', 'open');
      menuDropdown.setAttribute('data-state', 'open');
      menuDropdown.setAttribute('aria-hidden', 'false');
      menuToggle.setAttribute('aria-expanded', 'true');
    }

    // 关闭菜单
    function closeMenu() {
      header.setAttribute('data-menu-state', 'closed');
      menuDropdown.setAttribute('data-state', 'closed');
      menuDropdown.setAttribute('aria-hidden', 'true');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    // 获取当前菜单状态
    function isMenuOpen() {
      return menuDropdown.getAttribute('data-state') === 'open';
    }

    // 切换菜单
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // 点击导航链接关闭菜单
    mobileNavLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });

    // 点击页面其他区域关闭菜单
    document.addEventListener('click', function(e) {
      if (isMenuOpen() && !header.contains(e.target)) {
        closeMenu();
      }
    });

    // 窗口大小变化时关闭菜单
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && isMenuOpen()) {
        closeMenu();
      }
    });

    // ESC 键关闭菜单
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isMenuOpen()) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  // 监听组件加载完成事件
  document.addEventListener('componentsLoaded', initMobileMenu);
  // 如果组件已加载，直接执行
  if (document.querySelector('.mobile-menu-dropdown')) {
    initMobileMenu();
  }

  // Hero 向下滚动箭头点击事件
  const heroScrollArrow = document.getElementById('heroScrollArrow');
  if (heroScrollArrow) {
    heroScrollArrow.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const headerHeight = 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  }

  // 自动检测设备平台
  function detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (platform.indexOf('win') !== -1) {
      return 'windows';
    } else if (platform.indexOf('mac') !== -1) {
      return 'macos';
    } else if (platform.indexOf('linux') !== -1 || platform.indexOf('x11') !== -1) {
      return 'linux';
    } else if (/android/.test(userAgent)) {
      return 'android';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    return 'windows'; // 默认 Windows
  }

  // GitHub 仓库配置
  const GITHUB_REPO = 'flyhunterl/flymd';
  const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

  // 平台文件匹配规则（用于从 release assets 中识别对应平台的文件）
  const platformPatterns = {
    windows: { patterns: [/windows.*\.exe$/i, /win.*x64.*\.exe$/i, /\.exe$/i], icon: 'fa-brands fa-windows', text: '下载 Windows 版' },
    macos: { patterns: [/macos.*\.dmg$/i, /mac.*universal.*\.dmg$/i, /\.dmg$/i], icon: 'fa-brands fa-apple', text: '下载 macOS 版' },
    linux: { patterns: [/linux.*\.AppImage$/i, /linux.*x64.*\.AppImage$/i, /\.AppImage$/i], icon: 'fa-brands fa-linux', text: '下载 Linux 版' },
    android: { patterns: [/\.apk$/i], icon: 'fa-brands fa-android', text: 'Android 即将推出' },
    ios: { patterns: [], icon: 'fa-brands fa-apple', text: 'iOS 即将推出' }
  };

  // 默认下载链接（备用，当 API 请求失败时使用）
  const defaultDownloadLinks = {
    windows: `https://github.com/${GITHUB_REPO}/releases/latest/download/flymd-windows-x64.exe`,
    macos: `https://github.com/${GITHUB_REPO}/releases/latest/download/flymd-macos-universal.dmg`,
    linux: `https://github.com/${GITHUB_REPO}/releases/latest/download/flymd-linux-x64.AppImage`,
    android: '#',
    ios: '#'
  };

  // 缓存从 GitHub API 获取的下载链接
  let githubReleaseLinks = null;
  let githubReleaseVersion = null;

  // 从 localStorage 读取缓存（不检查过期）
  function loadCachedRelease() {
    const cached = localStorage.getItem('flymd_release_cache');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        githubReleaseLinks = data.links;
        githubReleaseVersion = data.version;
        return data;
      } catch (e) {
        localStorage.removeItem('flymd_release_cache');
      }
    }
    return null;
  }

  // 从 GitHub Releases API 获取最新版本下载链接
  async function fetchGitHubReleaseLinks() {
    try {
      const response = await fetch(GITHUB_API_URL, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const release = await response.json();
      const assets = release.assets || [];
      const links = {};

      // 为每个平台匹配对应的资产文件
      for (const [platform, config] of Object.entries(platformPatterns)) {
        let matchedAsset = null;

        for (const pattern of config.patterns) {
          matchedAsset = assets.find(asset => pattern.test(asset.name));
          if (matchedAsset) break;
        }

        links[platform] = matchedAsset ? matchedAsset.browser_download_url : defaultDownloadLinks[platform];
      }

      githubReleaseLinks = links;
      githubReleaseVersion = release.tag_name || release.name;

      // 缓存到 localStorage
      localStorage.setItem('flymd_release_cache', JSON.stringify({
        links,
        version: githubReleaseVersion,
        timestamp: Date.now()
      }));

      console.log('已从 GitHub 获取最新 release:', githubReleaseVersion);
      return links;
    } catch (err) {
      console.warn('获取 GitHub Release 失败:', err.message);

      // API 失败时，如果有缓存（即使过期）则继续使用
      if (githubReleaseLinks) {
        console.log('使用过期缓存的 release 信息:', githubReleaseVersion);
        return githubReleaseLinks;
      }

      // 完全没有缓存时，使用默认链接
      console.log('无缓存，使用默认下载链接');
      return null;
    }
  }

  // 获取指定平台的下载链接
  function getDownloadUrl(platform) {
    if (githubReleaseLinks && githubReleaseLinks[platform]) {
      return githubReleaseLinks[platform];
    }
    return defaultDownloadLinks[platform] || '#';
  }

  // 获取平台配置信息
  function getPlatformConfig(platform) {
    const config = platformPatterns[platform] || platformPatterns.windows;
    return {
      url: getDownloadUrl(platform),
      icon: config.icon,
      text: config.text
    };
  }

  // 更新主下载按钮
  const downloadMainBtn = document.getElementById('downloadMainBtn');
  const downloadIcon = document.getElementById('downloadIcon');
  const downloadText = document.getElementById('downloadText');

  // 初始化下载按钮（异步获取 GitHub release 链接）
  async function initDownloadButtons() {
    const platform = detectPlatform();

    // 立即加载缓存并渲染（无需等待 API）
    loadCachedRelease();
    renderDownloadButtons(platform);

    // 后台检查是否需要刷新缓存
    const cached = localStorage.getItem('flymd_release_cache');
    let needRefresh = true;

    if (cached) {
      try {
        const data = JSON.parse(cached);
        needRefresh = Date.now() - data.timestamp >= 10 * 60 * 1000;
      } catch (e) {
        // ignore
      }
    }

    // 如果缓存过期或不存在，后台刷新
    if (needRefresh) {
      fetchGitHubReleaseLinks().then(() => {
        // 刷新成功后更新 UI
        renderDownloadButtons(platform);
      });
    }
  }

  // 渲染下载按钮
  function renderDownloadButtons(platform) {
    if (downloadMainBtn && downloadIcon && downloadText) {
      const platformInfo = getPlatformConfig(platform);

      downloadMainBtn.href = platformInfo.url;
      downloadIcon.className = platformInfo.icon;
      downloadText.textContent = platformInfo.text;
    }

    // 更新下拉菜单
    updateDropdownLinks();
  }

  // 为移动端平台绑定提示事件（只绑定一次）
  let mobileAlertBound = false;
  function bindMobileAlert() {
    if (mobileAlertBound) return;
    const platform = detectPlatform();
    if ((platform === 'android' || platform === 'ios') && downloadMainBtn) {
      downloadMainBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('该平台版本即将推出，敬请期待！');
      });
      mobileAlertBound = true;
    }
  }

  // 更新下拉菜单中的下载链接
  function updateDropdownLinks() {
    const downloadOptions = document.querySelectorAll('#downloadDropdownMenu .download-option:not(.disabled)');
    downloadOptions.forEach(option => {
      const platform = option.getAttribute('data-platform');
      if (platform) {
        const platformMap = { win: 'windows', mac: 'macos', linux: 'linux' };
        const normalizedPlatform = platformMap[platform] || platform;
        const url = getDownloadUrl(normalizedPlatform);
        option.href = url;
      }
    });
  }

  // 立即开始初始化
  initDownloadButtons();
  bindMobileAlert();

  // 更多平台下拉菜单
  const downloadWrapper = document.querySelector('.download-dropdown-wrapper');
  const morePlatformsBtn = document.getElementById('morePlatformsBtn');
  const downloadMenu = document.getElementById('downloadDropdownMenu');

  if (morePlatformsBtn && downloadMenu) {
    morePlatformsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      downloadWrapper.classList.toggle('open');
    });

    // 点击外部关闭下拉菜单
    document.addEventListener('click', function(e) {
      if (!downloadWrapper.contains(e.target)) {
        downloadWrapper.classList.remove('open');
      }
    });

    // 处理下拉菜单中的下载选项点击（链接已由 updateDropdownLinks 动态设置）
    const downloadOptions = downloadMenu.querySelectorAll('.download-option:not(.disabled)');
    downloadOptions.forEach(option => {
      option.addEventListener('click', function() {
        // 关闭下拉菜单（链接跳转由浏览器自动处理）
        downloadWrapper.classList.remove('open');
      });
    });
  }

  // 功能标签切换
  const featurePills = document.querySelectorAll('.feature-pill');
  const featureImage = document.querySelector('[data-role="feature-image"]');
  const featureTitle = document.querySelector('[data-role="feature-title"]');
  const featureDesc = document.querySelector('[data-role="feature-desc"]');
  const featurePoints = document.querySelector('[data-role="feature-points"]');

  if (featurePills.length > 0 && featureImage && featureTitle && featureDesc && featurePoints) {
    featurePills.forEach(pill => {
      pill.addEventListener('click', function() {
        // 移除所有活动状态
        featurePills.forEach(p => {
          p.classList.remove('is-active');
          p.setAttribute('aria-pressed', 'false');
        });

        // 添加当前活动状态
        this.classList.add('is-active');
        this.setAttribute('aria-pressed', 'true');

        // 获取数据
        const imageSrc = this.getAttribute('data-image');
        const title = this.getAttribute('data-title');
        const desc = this.getAttribute('data-desc');
        const points = this.getAttribute('data-points').split('|');
        const alt = this.getAttribute('data-alt');

        // 图片淡出效果
        featureImage.classList.add('fade-out');

        setTimeout(() => {
          // 更新内容
          featureImage.src = imageSrc;
          featureImage.alt = alt;
          featureTitle.textContent = title;
          featureDesc.textContent = desc;

          // 更新弹幕内容
          featurePoints.innerHTML = '';
          points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            featurePoints.appendChild(li);
          });

          // 图片淡入
          featureImage.classList.remove('fade-out');
        }, 300);
      });
    });
  }

  // 性能数字倒数动画已移除，保持静态显示

  // ===============================
  // 自动语言检测功能
  // ===============================
  function detectUserLanguage() {
    // 优先检查 localStorage 中保存的语言设置
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang) {
      return savedLang;
    }

    // 检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;

    // 如果是中文（简体、繁体、香港等），返回 zh，否则返回 en
    if (browserLang.toLowerCase().startsWith('zh')) {
      return 'zh';
    }

    return 'en';
  }

  function setLanguage(lang) {
    // 保存语言选择
    localStorage.setItem('preferred-language', lang);

    // 更新所有带有 data-lang-only 属性的元素
    const langElements = document.querySelectorAll('[data-lang-only]');
    langElements.forEach(element => {
      const elementLang = element.getAttribute('data-lang-only');
      if (elementLang === lang) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });

    // 更新页面语言属性
    document.documentElement.lang = lang;
    // 设置 data-lang 属性，用于目录生成等功能
    document.documentElement.setAttribute('data-lang', lang);
  }

  // 初始化语言
  const currentLang = detectUserLanguage();
  setLanguage(currentLang);

  // ===============================
  // 侧边栏链接激活状态
  // ===============================
  function updateActiveLink() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const currentHash = window.location.hash;

    sidebarLinks.forEach(link => {
      if (link.getAttribute('href') === currentHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // 监听 hash 变化
  window.addEventListener('hashchange', updateActiveLink);

  // 页面加载时更新
  updateActiveLink();

  // ===============================
  // 平滑滚动到锚点
  // ===============================
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // 只处理页面内锚点
      if (href && href.startsWith('#')) {
        e.preventDefault();

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // 计算目标位置（减去顶部导航栏高度）
          const headerHeight = 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

          // 平滑滚动
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // 更新 URL hash
          history.pushState(null, null, href);

          // 更新激活状态
          updateActiveLink();
        }
      }
    });
  });

  // ===============================
  // 滚动时高亮当前章节
  // ===============================
  function highlightCurrentSection() {
    const sections = document.querySelectorAll('.docs-section[id], .docs-section h2[id], .docs-section h3[id]');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    if (sections.length === 0) return;

    // 获取所有章节的位置
    const sectionPositions = Array.from(sections).map(section => ({
      id: section.id,
      top: section.getBoundingClientRect().top
    }));

    // 找到当前可见的章节（距离顶部最近的）
    const headerOffset = 100;
    const currentSection = sectionPositions
      .filter(section => section.top <= headerOffset)
      .pop();

    if (currentSection) {
      sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSection.id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  // 使用节流函数优化滚动性能
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
      highlightCurrentSection();
    });
  });

  // ===============================
  // 移动端目录导航功能
  // ===============================
  const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
  const docsToc = document.getElementById('docsToc');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  function openMobileSidebar() {
    if (docsToc) {
      docsToc.classList.add('mobile-open');
    }
    if (sidebarBackdrop) {
      sidebarBackdrop.style.display = 'block';
      // 触发重绘以确保过渡动画生效
      setTimeout(() => {
        sidebarBackdrop.classList.add('active');
      }, 10);
    }
    // 禁止页面滚动
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (docsToc) {
      docsToc.classList.remove('mobile-open');
    }
    if (sidebarBackdrop) {
      sidebarBackdrop.classList.remove('active');
      // 等待过渡动画完成后隐藏遮罩
      setTimeout(() => {
        sidebarBackdrop.style.display = 'none';
      }, 300);
    }
    // 恢复页面滚动
    document.body.style.overflow = '';
  }

  // 点击菜单按钮
  if (mobileSidebarToggle && docsToc) {
    mobileSidebarToggle.addEventListener('click', () => {
      if (docsToc.classList.contains('mobile-open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });
  }

  // 点击遮罩关闭侧边栏
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }

  // 监听窗口大小变化，桌面端自动关闭移动菜单
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (docsToc && window.innerWidth > 1024 && docsToc.classList.contains('mobile-open')) {
        closeMobileSidebar();
      }
    }, 250);
  });

  // ===== 目录导航生成功能 =====
  const tocNav = document.getElementById('tocNav');
  const docsContent = document.querySelector('.docs-content');

  if (tocNav && docsContent) {
    // 生成目录
    function generateTOC() {
      // 获取当前激活的语言
      const currentLang = document.documentElement.getAttribute('data-lang') || 'zh';
      const activeArticle = document.querySelector(`.docs-article[data-lang-only="${currentLang}"]`);

      if (!activeArticle) return;

      // 查找所有标题（H1-H6）
      const headings = activeArticle.querySelectorAll('h1, h2, h3, h4, h5, h6');

      if (headings.length === 0) {
        const emptyText = currentLang === 'en' ? 'No headings' : '暂无目录';
        tocNav.innerHTML = `<div style="color: var(--text-secondary); font-size: 12px; padding: 12px;">${emptyText}</div>`;
        return;
      }

      // 清空现有目录
      tocNav.innerHTML = '';

      headings.forEach((heading, index) => {
        // 为标题生成 ID（如果没有）
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }

        // 获取标题级别（1-6）
        const level = parseInt(heading.tagName.substring(1));

        // 创建目录链接
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.className = 'toc-link';
        link.setAttribute('data-level', level);
        link.textContent = heading.textContent;

        // 平滑滚动
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.getElementById(heading.id);
          if (target) {
            const headerHeight = 68; // 顶栏高度
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });

            // 更新 URL hash（不触发滚动）
            history.pushState(null, null, `#${heading.id}`);
          }

          // 移动端点击后关闭目录
          if (docsToc && docsToc.classList.contains('mobile-open')) {
            closeMobileSidebar();
          }
        });

        tocNav.appendChild(link);
      });

      // 初始化高亮
      updateActiveTocLink();
    }

    // 更新激活的目录链接
    function updateActiveTocLink() {
      const scrollPos = window.scrollY + 100; // 偏移量
      const tocLinks = tocNav.querySelectorAll('.toc-link');
      const currentLang = document.documentElement.getAttribute('data-lang') || 'zh';
      const activeArticle = document.querySelector(`.docs-article[data-lang-only="${currentLang}"]`);

      if (!activeArticle) return;

      const headings = activeArticle.querySelectorAll('h1, h2, h3, h4, h5, h6');

      let activeHeading = null;

      // 找到当前可视区域的标题
      headings.forEach((heading) => {
        const headingTop = heading.getBoundingClientRect().top + window.pageYOffset;
        if (headingTop <= scrollPos) {
          activeHeading = heading;
        }
      });

      // 更新激活状态
      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (activeHeading && link.getAttribute('href') === `#${activeHeading.id}`) {
          link.classList.add('active');
        }
      });
    }

    // 滚动监听
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveTocLink, 50);
    });

    // 初始化目录
    generateTOC();

    // 监听语言切换，重新生成目录
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-lang') {
          generateTOC();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-lang']
    });
  }

  // ===============================
  // FlyMD Feature Grid（site/components/feature-grid.html）
  // ===============================
  const featureGridState = {
    cache: null,
    promise: null
  };

  document.addEventListener('componentsLoaded', initFeatureGrid);
  document.addEventListener('componentsLoaded', initContributors);
  document.addEventListener('componentsLoaded', initDynamicNavLinks);
  initFeatureGrid();
  initContributors();
  initDynamicNavLinks();

  // ===============================
  // 动态导航链接加载
  // ===============================
  async function initDynamicNavLinks() {
    const container = document.getElementById('dynamicNavLinks');
    if (!container || container.dataset.loaded === 'true') return;

    try {
      const response = await fetch(getCdnUrl('content/nav-links.json', true));
      if (!response.ok) return;
      const data = await response.json();

      if (!data.links || data.links.length === 0) return;

      const currentLang = localStorage.getItem('preferred-language') ||
        (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');

      // 过滤启用的链接并按 order 排序
      const links = data.links
        .filter(link => link.enabled !== false)
        .sort((a, b) => (a.order || 999) - (b.order || 999));

      const html = links.map(link => {
        const attrs = [];
        if (link.target) attrs.push(`target="${link.target}"`);
        if (link.target === '_blank') attrs.push('rel="noopener"');
        if (link.className) attrs.push(`class="${link.className}"`);
        attrs.push(`data-zh="${link.text.zh}"`);
        attrs.push(`data-en="${link.text.en}"`);

        return `<a href="${link.url}" ${attrs.join(' ')}>${link.text[currentLang] || link.text.zh}</a>`;
      }).join('');

      container.innerHTML = html;
      container.dataset.loaded = 'true';
    } catch (err) {
      console.warn('加载动态导航失败:', err);
    }
  }

  // ===============================
  // 贡献者动态加载
  // ===============================
  async function initContributors() {
    const grid = document.getElementById('contributorsGrid');
    if (!grid || grid.dataset.loaded === 'true') return;

    try {
      const response = await fetch(getCdnUrl('content/contributors.json', true));
      if (!response.ok) return;
      const data = await response.json();

      if (!data.contributors || data.contributors.length === 0) return;

      const currentLang = localStorage.getItem('preferred-language') ||
        (navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');

      // 按 order 排序
      const contributors = data.contributors.sort((a, b) => (a.order || 999) - (b.order || 999));

      grid.innerHTML = contributors.map(contributor => `
        <div class="developer-card">
          <span class="developer-badge">${contributor.badge}</span>
          <a href="${contributor.link}" target="_blank" rel="noopener" class="developer-link">
            <img src="${getCdnUrl(contributor.avatar)}" alt="${contributor.name}" class="developer-avatar" />
            <div class="developer-info">
              <h3 class="developer-name">${contributor.name}</h3>
              <p class="developer-role">${contributor.role[currentLang] || contributor.role.zh}</p>
              <span class="developer-github">@${contributor.github}</span>
            </div>
          </a>
        </div>
      `).join('');

      grid.dataset.loaded = 'true';
    } catch (err) {
      console.warn('加载贡献者失败:', err);
    }
  }

  async function initFeatureGrid() {
    const grid = document.getElementById('feature-grid');
    if (!grid || grid.dataset.ready === 'true') return;

    try {
      const data = await loadTauriFeatureData();
      if (!data) return;
      grid.dataset.ready = 'true';
      setupEditorCard(grid);
      setupThemeCard(grid, data.colorPalettes);
      setupNotificationCard(grid);
      setupPluginCard(grid, data.automationPlugins);
    } catch (err) {
      console.warn('初始化组件网格失败:', err);
    }
  }

  async function loadTauriFeatureData() {
    if (featureGridState.cache) return featureGridState.cache;
    if (featureGridState.promise) return featureGridState.promise;

    featureGridState.promise = fetch(getCdnUrl('tauri/components.ts'))
      .then(response => (response.ok ? response.text() : ''))
      .then(text => {
        if (!text) return null;
        const payload = {
          colorPalettes: extractExportedArray(text, 'colorPalettes'),
          automationPlugins: extractExportedArray(text, 'automationPlugins')
        };
        featureGridState.cache = payload;
        return payload;
      })
      .catch(err => {
        console.warn('读取 Tauri 组件数据失败:', err);
        return null;
      })
      .finally(() => {
        featureGridState.promise = null;
      });

    return featureGridState.promise;
  }

  function extractExportedArray(source, keyword) {
    if (!source) return [];
    const match = source.match(new RegExp(`export const ${keyword}\\s*=\\s*(\\[[\\s\\S]*?\\])`));
    if (!match) return [];
    try {
      // eslint-disable-next-line no-new-func
      return Function(`\"use strict\"; return (${match[1]});`)();
    } catch (err) {
      console.warn(`解析 ${keyword} 失败:`, err);
      return [];
    }
  }

  function setupEditorCard(root) {
    const split = root.querySelector('.editor-split');
    const toggleButtons = root.querySelectorAll('[data-editor-view]');
    if (!split || toggleButtons.length === 0) return;

    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.dataset.editorView || 'source';
        split.dataset.view = mode;
        toggleButtons.forEach(btn => btn.classList.toggle('is-active', btn === button));
      });
    });
  }

  function setupThemeCard(root, palettes) {
    const swatchList = root.querySelector('#themeSwatchList');
    const preview = root.querySelector('#themePreview');
    const previewName = root.querySelector('#themePreviewName');
    if (!swatchList || !preview || !previewName) return;

    const source = Array.isArray(palettes) && palettes.length > 0
      ? palettes.slice(0, 8)
      : [
          { label: '纯白', color: '#ffffff' },
          { label: '雾蓝', color: '#eef3f9' },
          { label: '薄荷', color: '#eef8f1' },
          { label: '深色', color: '#0b0c0e' }
        ];

    swatchList.innerHTML = '';

    const setActive = (palette, btn) => {
      swatchList.querySelectorAll('.theme-swatch').forEach(el => el.classList.remove('is-active'));
      btn.classList.add('is-active');
      preview.style.setProperty('background', palette.color);
      const isDark = palette.color.toLowerCase() === '#0b0c0e';
      preview.style.setProperty('color', isDark ? '#f7f9ff' : '#090b10');
      previewName.textContent = palette.label;
    };

    source.forEach((palette, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-swatch';
      btn.style.setProperty('background', palette.color);
      btn.dataset.name = palette.label;
      btn.addEventListener('mouseenter', () => setActive(palette, btn));
      btn.addEventListener('click', () => setActive(palette, btn));
      swatchList.appendChild(btn);
      if (index === 0) setActive(palette, btn);
    });
  }

  function setupNotificationCard(root) {
    const stack = root.querySelector('#notificationStack');
    const trigger = root.querySelector('#notificationTrigger');
    if (!stack || !trigger) return;

    // 如果已有内容，只绑定事件不重建
    if (stack.children.length > 0) {
      trigger.addEventListener('click', () => {
        const messages = [
          { type: 'success', text: 'WebDAV 同步完成' },
          { type: 'info', text: 'AI 正在生成回复' },
          { type: 'warning', text: '图床上传中...' },
          { type: 'success', text: '协同连接成功' }
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const toast = document.createElement('div');
        toast.className = 'notification-toast notification-toast--flymd';
        toast.setAttribute('data-type', msg.type);
        toast.innerHTML = `
          <div class="notification-icon">
            <i class="fa-solid fa-${msg.type === 'success' ? 'check' : msg.type === 'warning' ? 'bell' : 'chevron-right'}"></i>
          </div>
          <div class="notification-content">
            <span class="notification-text">${msg.text}</span>
          </div>
        `;
        stack.insertBefore(toast, stack.firstChild);
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(-20px)';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      });
      return;
    }

    const samples = [
      { title: 'WebDAV 同步完成', body: '16ms 内完成上传，当前库已备份。', type: 'success' },
      { title: 'AI 助手待命', body: '右键选区即可润色、改写或生成摘要。', type: 'info' },
      { title: '便签已置顶', body: '桌面便签模式开启，保持在最前。', type: 'warning' },
      { title: '导出成功', body: 'PDF 已保存到 Documents/FlyMD。', type: 'success' }
    ];

    const queue = [];
    let pointer = 0;

    const render = () => {
      stack.innerHTML = '';
      queue.forEach(item => {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.dataset.type = item.type;
        toast.innerHTML = `<strong>${item.title}</strong><p>${item.body}</p>`;
        stack.appendChild(toast);
      });
    };

    const pushToast = () => {
      const sample = samples[pointer % samples.length];
      pointer += 1;
      queue.unshift({ ...sample, id: Date.now() });
      if (queue.length > 3) queue.pop();
      render();
    };

    trigger.addEventListener('click', pushToast);
    pushToast();
    setTimeout(pushToast, 1400);
  }

  function setupPluginCard(root, plugins) {
    const list = root.querySelector('#pluginToggleList');
    if (!list) return;

    // 如果已有内容，跳过重建
    if (list.children.length > 0) return;

    const payload = Array.isArray(plugins) && plugins.length > 0
      ? plugins
      : [
          { label: 'AI 助手扩展', capability: '润色、改写、段落理解' },
          { label: '待办推送', capability: '多渠道提醒、定时通知' }
        ];

    list.innerHTML = '';

    payload.forEach(plugin => {
      const item = document.createElement('div');
      item.className = 'plugin-toggle';
      item.innerHTML = `
        <div>
          <h4>${plugin.label}</h4>
          <p>${plugin.capability}</p>
        </div>
      `;

      const switchBtn = document.createElement('button');
      switchBtn.type = 'button';
      switchBtn.className = 'plugin-switch';
      switchBtn.dataset.active = 'true';
      switchBtn.setAttribute('aria-pressed', 'true');
      switchBtn.addEventListener('click', () => {
        const isActive = switchBtn.dataset.active === 'true';
        switchBtn.dataset.active = isActive ? 'false' : 'true';
        switchBtn.setAttribute('aria-pressed', (!isActive).toString());
      });

      item.appendChild(switchBtn);
      list.appendChild(item);
    });
  }
});
