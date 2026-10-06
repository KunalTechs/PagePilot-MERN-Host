import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Domain allow-list for external vendor scripts.
 * Restricted strictly to pagepilot.fabbuilder.com to prevent untrusted script injection.
 */
const ALLOWED_SCRIPT_DOMAINS = [
  'pagepilot.fabbuilder.com'
];

/**
 * Validates whether a given script URL is secure (HTTPS) and belongs to an allow-listed domain.
 * @param {string} url - Script URL candidate
 * @returns {boolean} True if URL is valid and allow-listed
 */
function isAllowlistedScriptUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_SCRIPT_DOMAINS.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
  } catch (err) {
    return false;
  }
}

/**
 * VendorScriptLoader Component
 * Single config-driven component that securely loads, initializes on route changes,
 * and cleans up vendor SDK scripts (Tooltips, Tours, Webinars, Widgets).
 */
const VendorScriptLoader = ({ scriptUrl = import.meta.env.VITE_PAGEPILOT_WIDGET_SCRIPT_URL }) => {
  const location = useLocation();
  const scriptInsertedRef = useRef(false);

  // 1. Initial Script Loading & Unmount Cleanup
  useEffect(() => {
    if (!scriptUrl || !isAllowlistedScriptUrl(scriptUrl)) {
      if (scriptUrl) {
        console.warn(`[VendorScriptLoader] Script URL "${scriptUrl}" rejected: Not on domain allow-list.`);
      }
      return;
    }

    const scriptId = 'pagepilot-vendor-sdk-script';
    let scriptEl = document.getElementById(scriptId);

    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.src = scriptUrl;
      scriptEl.async = true;
      scriptEl.onload = () => {
        scriptInsertedRef.current = true;
        if (window.PagePilotWidget && typeof window.PagePilotWidget.init === 'function') {
          window.PagePilotWidget.init();
        }
      };
      document.body.appendChild(scriptEl);
    } else {
      scriptInsertedRef.current = true;
    }

    return () => {
      // Cleanup on unmount
      if (window.PagePilotWidget && typeof window.PagePilotWidget.destroy === 'function') {
        window.PagePilotWidget.destroy();
      }
      const el = document.getElementById(scriptId);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      scriptInsertedRef.current = false;
    };
  }, [scriptUrl]);

  // 2. Re-initialize on Route Change
  useEffect(() => {
    if (scriptInsertedRef.current && window.PagePilotWidget) {
      if (typeof window.PagePilotWidget.onRouteChange === 'function') {
        window.PagePilotWidget.onRouteChange(location.pathname);
      } else if (typeof window.PagePilotWidget.init === 'function') {
        window.PagePilotWidget.init();
      }
    }
  }, [location.pathname]);

  return null; // Headless component
};

export default VendorScriptLoader;
