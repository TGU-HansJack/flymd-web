// FlyMD 国际化脚本 - 加载并应用翻译
// 支持后台管理系统的多语言管理（不经过数据库，直接读写 JSON 文件）

(function() {
  'use strict';

  let translations = {};
  let currentLocale = 'zh';

  // API 基础路径（用于从后台获取最新翻译）
  const API_BASE = window.FLYMD_API_BASE || '';

  // 检测语言
  function detectLanguage() {
    // 优先从 localStorage 读取
    const saved = localStorage.getItem('preferred-language');
    if (saved) return saved;

    // 检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.toLowerCase().startsWith('zh')) {
      return 'zh';
    }
    return 'en';
  }

  // 获取翻译值 - 支持点号分隔（nav.home）和下划线分隔（nav_home）两种格式
  function getValue(obj, key) {
    if (!obj || !key) return null;

    // 直接匹配（扁平键名，如 footer_tagline）
    if (key in obj) {
      return obj[key];
    }

    // 尝试点号分隔的嵌套路径（如 nav.home）
    if (key.includes('.')) {
      const keys = key.split('.');
      let value = obj;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return null;
        }
      }
      return value;
    }

    // 尝试下划线转点号的嵌套路径（如 footer_tagline -> footer.tagline）
    if (key.includes('_')) {
      const keys = key.split('_');
      let value = obj;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return null;
        }
      }
      return value;
    }

    return null;
  }

  // 翻译函数
  function t(key) {
    const localeData = translations[currentLocale];
    if (!localeData) return key;

    const value = getValue(localeData, key);
    return value !== null ? value : key;
  }

  // 应用翻译到所有带 data-i18n 属性的元素
  function applyTranslations() {
    // 处理 data-i18n 属性（从 JSON 文件获取翻译）
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translated = t(key);
      if (translated !== key) {
        element.textContent = translated;
      }
    });

    // 处理 data-zh/data-en 属性（内联翻译）
    document.querySelectorAll('[data-zh], [data-en]').forEach(element => {
      const zhText = element.getAttribute('data-zh');
      const enText = element.getAttribute('data-en');
      if (currentLocale === 'zh' && zhText) {
        element.textContent = zhText;
      } else if (currentLocale === 'en' && enText) {
        element.textContent = enText;
      }
    });

    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translated = t(key);
      if (translated !== key) {
        element.placeholder = translated;
      }
    });

    // 更新 title 属性
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translated = t(key);
      if (translated !== key) {
        element.title = translated;
      }
    });
  }

  // 切换语言
  function setLanguage(locale) {
    if (locale === currentLocale && translations[locale]) {
      return;
    }

    currentLocale = locale;
    localStorage.setItem('preferred-language', locale);

    // 更新 html 的 lang 和 data-lang 属性
    document.documentElement.lang = locale;
    document.documentElement.setAttribute('data-lang', locale);

    // 如果翻译已加载，直接应用
    if (translations[locale]) {
      applyTranslations();
      updateLangOnlyElements();
    } else {
      // 否则加载翻译后应用
      loadTranslation(locale).then(() => {
        applyTranslations();
        updateLangOnlyElements();
      });
    }
  }

  // 更新 data-lang-only 元素的显示状态
  function updateLangOnlyElements() {
    document.querySelectorAll('[data-lang-only]').forEach(element => {
      const elementLang = element.getAttribute('data-lang-only');
      if (elementLang === currentLocale) {
        element.classList.add('active');
        element.style.display = '';
      } else {
        element.classList.remove('active');
        element.style.display = 'none';
      }
    });
  }

  // 获取 i18n 文件的基础路径
  function getBasePath() {
    // 如果设置了 API 基础路径，使用 API 获取翻译
    if (API_BASE) {
      return API_BASE + '/api/i18n/translations/';
    }
    // 使用 CDN 工具函数（如果可用）
    if (window.cdnUrl) {
      return window.cdnUrl('i18n/');
    }
    // 获取当前脚本的路径来确定基础路径
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src && src.includes('i18n.js')) {
        return src.replace('i18n.js', 'i18n/');
      }
    }
    // 默认使用相对路径
    return 'i18n/';
  }

  // 加载翻译文件
  async function loadTranslation(locale) {
    try {
      const basePath = getBasePath();
      const url = basePath.includes('/api/')
        ? basePath + locale
        : basePath + locale + '.json';

      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      // 如果是 API 返回的格式，提取 data 字段
      translations[locale] = data.data || data;
    } catch (error) {
      console.error(`Failed to load ${locale} translations:`, error);
      translations[locale] = {};
    }
  }

  // 重新加载翻译（供后台管理系统调用）
  async function reloadTranslations() {
    translations = {};
    await loadTranslation(currentLocale);
    applyTranslations();
    updateLangOnlyElements();
  }

  // 初始化
  async function init() {
    currentLocale = detectLanguage();

    // 预加载当前语言的翻译
    await loadTranslation(currentLocale);

    // 设置语言
    document.documentElement.lang = currentLocale;
    document.documentElement.setAttribute('data-lang', currentLocale);

    // 应用翻译
    applyTranslations();
    updateLangOnlyElements();

    // 创建语言切换器（如果需要）
    setupLanguageSwitcher();
  }

  // 设置语言切换器
  function setupLanguageSwitcher() {
    // 查找语言切换按钮
    const langSwitchers = document.querySelectorAll('[data-lang-switch]');
    langSwitchers.forEach(switcher => {
      switcher.addEventListener('click', (e) => {
        e.preventDefault();
        const targetLang = switcher.getAttribute('data-lang-switch');
        setLanguage(targetLang);
      });
    });

    // 监听语言切换事件（来自其他脚本）
    window.addEventListener('languageChange', (e) => {
      if (e.detail && e.detail.locale) {
        setLanguage(e.detail.locale);
      }
    });
  }

  // 导出到全局
  window.FlyMDi18n = {
    t,
    setLanguage,
    getLocale: () => currentLocale,
    reload: reloadTranslations,
    applyTranslations
  };

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
