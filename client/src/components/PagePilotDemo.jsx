import React, { useEffect, useRef, useState } from 'react';

const WORKSPACE_ID = import.meta.env.VITE_PAGEPILOT_WORKSPACE_ID || '6336128a251dcbda38bd8fe1';
const DEMO_VIEWER_HOST = 'https://pagepilot-demo-viewer-prod.web.app';

/**
 * PagePilotDemo Component
 * Embeds a PagePilot interactive demo slideshow via a responsive iframe based on the official embed code.
 * Handles PP_REQUEST_QUERY_PARAMS and PP_QUERY_PARAMS messaging and DEMO_STATUS event.
 */
export default function PagePilotDemo({
  demoId = '6abfe7886aff17c1c69b629b',
  workspaceId = WORKSPACE_ID,
  style = {}
}) {
  const iframeRef = useRef(null);
  const [status, setStatus] = useState(null); // null | 'live' | 'draft'

  useEffect(() => {
    function postQueryParams() {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            {
              source: 'pagepilot-demo-embed',
              type: 'PP_QUERY_PARAMS',
              search: window.location.search
            },
            DEMO_VIEWER_HOST
          );
        } catch (e) {
          // Ignore cross-origin error
        }
      }
    }

    function handleMessage(event) {
      const msg = event.data;
      if (!msg || msg.source !== 'pagepilot-demo-viewer') return;

      if (msg.type === 'DEMO_STATUS') {
        setStatus(msg.status);
      } else if (msg.type === 'PP_REQUEST_QUERY_PARAMS') {
        postQueryParams();
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (status === 'draft') return null;

  if (!demoId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px' }}>
        Please provide a valid PagePilot Demo ID (did) from your PagePilot Admin panel.
      </div>
    );
  }

  // Exact PagePilot embed URL format with workspaceId and demoId
  const iframeSrc = `${DEMO_VIEWER_HOST}//?tid=${encodeURIComponent(workspaceId)}&did=${encodeURIComponent(demoId)}&type=demo&status=live`;

  return (
    <div
      className="pagepilot-demo-embed"
      style={{
        position: 'relative',
        paddingBottom: 'calc(54.75% + 25px)',
        width: '100%',
        height: 0,
        marginTop: '1rem',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0px 0px 18px rgba(26, 19, 72, 0.25)',
        border: '1px solid rgba(63, 95, 172, 0.35)',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <iframe
        ref={iframeRef}
        loading="lazy"
        src={iframeSrc}
        title="PagePilot Interactive Presentation Demo"
        allow="fullscreen"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}
