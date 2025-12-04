/**
 * FlyMD 网站配置
 * CDN 加速配置 - 设置后静态资源将从 CDN 加载
 */
(function() {
  'use strict';

  window.FLYMD_CONFIG = {
    // ========================================
    // CDN 配置
    // ========================================

    /**
     * CDN 基础域名
     * - 留空 '' 则使用本地相对路径（默认）
     * - 设置后，匹配的资源将从 CDN 加载
     * - 示例: 'https://cdn.llingfei.com'
     * - 注意: 末尾不要带斜杠 /
     */
    cdnBase: '',

    /**
     * 需要走 CDN 的资源路径前缀
     * - 匹配这些前缀的资源会使用 CDN
     * - 留空则只按扩展名匹配
     */
    cdnPaths: [
      'fonts/'      // 字体文件目录
    ],

    /**
     * 需要走 CDN 的文件扩展名（仅媒体文件）
     * - 匹配这些扩展名的资源会使用 CDN
     */
    cdnExtensions: [
      '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',  // 图片
      '.woff', '.woff2', '.ttf', '.eot', '.otf',                  // 字体
      '.mp4', '.webm', '.ogg', '.mp3'                             // 视频/音频
    ],

    /**
     * 排除的路径（即使匹配上面规则也不走 CDN）
     * - 用于排除需要实时更新的资源
     */
    cdnExclude: [
      // 'content/blog/_index.json'  // 示例：排除博客索引
    ],

    /**
     * 是否为 CDN 资源添加版本号
     * - true: 添加 ?v=时间戳 防止缓存
     * - false: 不添加版本号（依赖 CDN 缓存策略）
     */
    cdnVersioning: false,

    /**
     * CDN 版本号（手动设置）
     * - 当 cdnVersioning 为 true 时使用
     * - 更新资源后修改此值以刷新缓存
     */
    cdnVersion: '1.0.0'
  };

  // 冻结配置对象，防止意外修改
  Object.freeze(window.FLYMD_CONFIG);
  Object.freeze(window.FLYMD_CONFIG.cdnPaths);
  Object.freeze(window.FLYMD_CONFIG.cdnExtensions);
  Object.freeze(window.FLYMD_CONFIG.cdnExclude);

})();
