/**
 * FlyMD CDN 工具函数
 * 根据配置自动判断资源是否使用 CDN 加载
 */
(function() {
  'use strict';

  /**
   * 获取资源的完整 URL
   * 根据 FLYMD_CONFIG 配置自动判断是否使用 CDN
   *
   * @param {string} path - 资源的相对路径（如 'libs/marked.min.js', 'hero.png'）
   * @param {object} options - 可选配置
   * @param {boolean} options.forceCdn - 强制使用 CDN（即使不匹配规则）
   * @param {boolean} options.forceLocal - 强制使用本地路径（即使匹配规则）
   * @param {boolean} options.noCache - 添加时间戳防止缓存
   * @returns {string} 完整的资源 URL
   */
  function getAssetUrl(path, options) {
    if (!path) return path;

    options = options || {};
    const config = window.FLYMD_CONFIG || {};
    const cdnBase = config.cdnBase || '';

    // 如果没有配置 CDN 或强制使用本地路径，直接返回相对路径
    if (!cdnBase || options.forceLocal) {
      return addVersionParam(path, options.noCache);
    }

    // 规范化路径（移除开头的 ./ 或 /）
    let normalizedPath = path.replace(/^\.\//, '').replace(/^\//, '');

    // 检查是否在排除列表中
    const excludeList = config.cdnExclude || [];
    for (let i = 0; i < excludeList.length; i++) {
      if (normalizedPath === excludeList[i] || normalizedPath.indexOf(excludeList[i]) === 0) {
        return addVersionParam(path, options.noCache);
      }
    }

    // 判断是否应该使用 CDN
    let shouldUseCdn = options.forceCdn || false;

    if (!shouldUseCdn) {
      // 检查路径前缀
      const cdnPaths = config.cdnPaths || [];
      for (let i = 0; i < cdnPaths.length; i++) {
        if (normalizedPath.indexOf(cdnPaths[i]) === 0) {
          shouldUseCdn = true;
          break;
        }
      }
    }

    if (!shouldUseCdn) {
      // 检查文件扩展名
      const cdnExtensions = config.cdnExtensions || [];
      const pathLower = normalizedPath.toLowerCase();
      for (let i = 0; i < cdnExtensions.length; i++) {
        if (pathLower.lastIndexOf(cdnExtensions[i]) === pathLower.length - cdnExtensions[i].length) {
          shouldUseCdn = true;
          break;
        }
      }
    }

    // 构建最终 URL
    if (shouldUseCdn) {
      let url = cdnBase + '/' + normalizedPath;
      return addVersionParam(url, options.noCache, config);
    }

    return addVersionParam(path, options.noCache);
  }

  /**
   * 添加版本参数
   * @private
   */
  function addVersionParam(url, noCache, config) {
    if (!url) return url;

    config = config || window.FLYMD_CONFIG || {};

    // 如果需要防止缓存，添加时间戳
    if (noCache) {
      const separator = url.indexOf('?') === -1 ? '?' : '&';
      return url + separator + '_t=' + Date.now();
    }

    // 如果配置了 CDN 版本号
    if (config.cdnVersioning && config.cdnVersion) {
      const separator = url.indexOf('?') === -1 ? '?' : '&';
      return url + separator + 'v=' + config.cdnVersion;
    }

    return url;
  }

  /**
   * 批量转换资源 URL
   * @param {string[]} paths - 资源路径数组
   * @param {object} options - 可选配置
   * @returns {string[]} 转换后的 URL 数组
   */
  function getAssetUrls(paths, options) {
    if (!Array.isArray(paths)) return [];
    return paths.map(function(path) {
      return getAssetUrl(path, options);
    });
  }

  /**
   * 获取当前 CDN 配置状态
   * @returns {object} CDN 配置信息
   */
  function getCdnStatus() {
    const config = window.FLYMD_CONFIG || {};
    return {
      enabled: !!config.cdnBase,
      cdnBase: config.cdnBase || '',
      cdnPaths: config.cdnPaths || [],
      cdnExtensions: config.cdnExtensions || [],
      cdnExclude: config.cdnExclude || [],
      versioning: config.cdnVersioning || false,
      version: config.cdnVersion || ''
    };
  }

  /**
   * 预加载资源（可选，用于性能优化）
   * @param {string[]} paths - 需要预加载的资源路径
   */
  function preloadAssets(paths) {
    if (!Array.isArray(paths) || !document.head) return;

    paths.forEach(function(path) {
      const url = getAssetUrl(path);
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;

      // 根据扩展名设置 as 属性
      const ext = path.split('.').pop().toLowerCase();
      if (['js'].indexOf(ext) !== -1) {
        link.as = 'script';
      } else if (['css'].indexOf(ext) !== -1) {
        link.as = 'style';
      } else if (['woff', 'woff2', 'ttf', 'eot', 'otf'].indexOf(ext) !== -1) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].indexOf(ext) !== -1) {
        link.as = 'image';
      }

      document.head.appendChild(link);
    });
  }

  // 导出到全局
  window.FlyMDCdn = {
    getAssetUrl: getAssetUrl,
    getAssetUrls: getAssetUrls,
    getCdnStatus: getCdnStatus,
    preloadAssets: preloadAssets
  };

  // 简写别名
  window.cdnUrl = getAssetUrl;

})();
