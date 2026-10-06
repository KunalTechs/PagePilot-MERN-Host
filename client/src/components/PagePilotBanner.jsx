import React, { useEffect, useRef } from 'react';
import AHDjs from 'ahdjs';
import 'ahdjs/build/css/index.css';

const WORKSPACE_ID = import.meta.env.VITE_PAGEPILOT_WORKSPACE_ID || '6336128a251dcbda38bd8fe1';
const API_HOST = import.meta.env.VITE_PAGEPILOT_API_HOST || 'https://pagepilot.fabbuilder.com';

/**
 * Get or create a persistent Visitor ID for PagePilot tracking
 */
function getVisitorId() {
  let vId = localStorage.getItem('pagepilot_visitor_id');
  if (!vId) {
    vId = 'visitor_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('pagepilot_visitor_id', vId);
  }
  return vId;
}

/**
 * PagePilotBanner Component
 * Renders any PagePilot App Banner (Simple, Carousel, Modal, Floater) by identifier.
 * Injecting content directly into <div id={identifier} />.
 * 
 * @param {Object} props
 * @param {string} props.identifier - Matching banner identifier configured in PagePilot Admin
 * @param {boolean} [props.refetch=true] - Force refetch instead of using cached copy
 * @param {Object} [props.style] - Optional CSS styles for container wrapper
 */
export default function PagePilotBanner({ identifier = 'FAB_BANNER_TYPE_SIMPLE', refetch = true, style = {} }) {
  const ahdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const renderBanner = async () => {
      try {
        if (!identifier) return;

        const visitorId = getVisitorId();

        const ahdJs = AHDjs(undefined, {
          applicationId: WORKSPACE_ID,
          apiHost: API_HOST,
          visitorId: visitorId,
          showProgressbar: false,
        });

        ahdRef.current = ahdJs;

        await ahdJs.initializeSiteMap(false);
        if (!cancelled) {
          await ahdJs.renderAppBanner(identifier, refetch);
        }
      } catch (err) {
        console.warn(`[PagePilotBanner] Failed to render banner '${identifier}':`, err);
      }
    };

    renderBanner();

    return () => {
      cancelled = true;
      if (ahdRef.current && typeof ahdRef.current.stop === 'function') {
        ahdRef.current.stop();
      }
    };
  }, [identifier, refetch]);

  return (
    <div
      id={identifier}
      className="pagepilot-banner-slot"
      style={{ width: '100%', minHeight: '1px', ...style }}
    />
  );
}
