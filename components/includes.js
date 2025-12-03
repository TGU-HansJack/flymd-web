/**
 * HTML Components Loader
 * Dynamically loads reusable HTML components (header, footer, etc.)
 */
(function() {
  'use strict';

  // 获取组件路径（支持 CDN）
  function getComponentsPath() {
    // 组件 HTML 通常不走 CDN（需要实时更新）
    return 'components/';
  }

  const COMPONENTS_PATH = getComponentsPath();

  /**
   * Load HTML component into target element
   * @param {string} componentName - Name of component file (without .html)
   * @param {string} targetSelector - CSS selector for target element
   * @param {Function} callback - Optional callback after loading
   */
  async function loadComponent(componentName, targetSelector, callback) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`[includes.js] Target element not found: ${targetSelector}`);
      return;
    }

    try {
      const response = await fetch(`${COMPONENTS_PATH}${componentName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load ${componentName}: ${response.status}`);
      }
      const html = await response.text();

      // Insert the HTML
      if (target.dataset.includePosition === 'before') {
        target.insertAdjacentHTML('afterbegin', html);
      } else if (target.dataset.includePosition === 'after') {
        target.insertAdjacentHTML('beforeend', html);
      } else {
        target.innerHTML = html;
      }

      // Execute callback if provided
      if (typeof callback === 'function') {
        callback(target);
      }
    } catch (error) {
      console.error(`[includes.js] Error loading component ${componentName}:`, error);
    }
  }

  /**
   * Process all include placeholders in the document
   */
  async function processIncludes() {
    const includeElements = document.querySelectorAll('[data-include]');
    const loadPromises = [];

    includeElements.forEach(el => {
      const componentName = el.dataset.include;
      const promise = loadComponent(componentName, `[data-include="${componentName}"]`);
      loadPromises.push(promise);
    });

    // Wait for all components to load
    await Promise.all(loadPromises);

    // Dispatch event when all components are loaded
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
  }

  /**
   * Set active navigation link based on current page
   */
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.header-nav a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const linkPage = href.split('#')[0];
        if (linkPage === currentPage ||
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && href.startsWith('#'))) {
          // Don't add active class to anchor links on index page
          if (!href.startsWith('#')) {
            link.classList.add('active');
          }
        }
      }
    });
  }

  // Auto-process includes when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processIncludes);
  } else {
    processIncludes();
  }

  // Set active nav link after components are loaded
  document.addEventListener('componentsLoaded', setActiveNavLink);

  // Export for manual use
  window.loadComponent = loadComponent;
  window.processIncludes = processIncludes;
})();
