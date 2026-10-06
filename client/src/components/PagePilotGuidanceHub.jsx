import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AHDjs from 'ahdjs';
import 'ahdjs/build/css/index.css';
import { PlayCircle, Megaphone, HelpCircle, Compass } from 'lucide-react';

const WORKSPACE_ID = import.meta.env.VITE_PAGEPILOT_WORKSPACE_ID || '6336128a251dcbda38bd8fe1';
const API_HOST = import.meta.env.VITE_PAGEPILOT_API_HOST || 'https://pagepilot.fabbuilder.com';

/**
 * PagePilotGuidanceHub Component
 * Controls for Banners Page, Demos Page, Tooltips, and Page Tours.
 */
export default function PagePilotGuidanceHub({ visitorId = 'anonymous-visitor' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const ahdRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);

  // Trigger PagePilot Tour or Tooltips highlights for given slug
  const triggerHighlights = async (targetSlug = null) => {
    const slugToFetch = targetSlug || location.pathname;
    try {
      if (ahdRef.current && typeof ahdRef.current.stop === 'function') {
        ahdRef.current.stop();
      }

      setIsLoading(true);

      const ahdJs = AHDjs(undefined, {
        applicationId: WORKSPACE_ID,
        apiHost: API_HOST,
        visitorId: visitorId,
        showProgressbar: false,
      });

      ahdRef.current = ahdJs;

      await ahdJs.initializeSiteMap(false);
      await ahdJs.showHighlights(slugToFetch, true);
    } catch (err) {
      console.warn('[PagePilotGuidanceHub] Failed to load highlights for', slugToFetch, err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopHighlights = () => {
    if (ahdRef.current && typeof ahdRef.current.stop === 'function') {
      ahdRef.current.stop();
      ahdRef.current = null;
    }
    setIsLoading(false);
  };

  useEffect(() => {
    return () => stopHighlights();
  }, [location.pathname]);

  const handleTooltipClick = async () => {
    const targetPath = '/about-us';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
      setTimeout(() => {
        triggerHighlights(targetPath);
      }, 600);
    } else {
      triggerHighlights(targetPath);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      {/* 1. Demos Page Action */}
      <button
        onClick={() => navigate('/demos')}
        className="btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          fontSize: '0.85rem',
          borderRadius: '6px',
          cursor: 'pointer',
          background: location.pathname === '/demos' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          color: '#60a5fa'
        }}
        title="Open PagePilot Demos Showcase Page"
      >
        <PlayCircle size={15} />
        <span>Demos</span>
      </button>

      {/* 2. Banners Page Action */}
      <button
        onClick={() => navigate('/banner')}
        className="btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          fontSize: '0.85rem',
          borderRadius: '6px',
          cursor: 'pointer',
          background: location.pathname === '/banner' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(236, 72, 153, 0.12)',
          border: '1px solid rgba(236, 72, 153, 0.35)',
          color: '#f472b6'
        }}
        title="Open PagePilot Banners Showcase Page"
      >
        <Megaphone size={15} />
        <span>Banners</span>
      </button>

      {/* 3. Live Tooltips Trigger (Navigates to /about-us and triggers Tooltips) */}
      <button
        onClick={handleTooltipClick}
        className="btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          fontSize: '0.85rem',
          borderRadius: '6px',
          cursor: 'pointer',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc'
        }}
        title="Go to /about-us and show PagePilot Live Tooltips"
        disabled={isLoading}
      >
        <HelpCircle size={15} />
        <span>{isLoading ? 'Loading...' : 'Tooltips'}</span>
      </button>

      {/* 4. Page Tour Trigger for Current Route */}
      <button
        onClick={() => triggerHighlights(location.pathname)}
        className="btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.85rem',
          fontSize: '0.85rem',
          borderRadius: '6px',
          cursor: 'pointer',
          background: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#60a5fa'
        }}
        title="Start Tour for Current Route"
        disabled={isLoading}
      >
        <Compass size={15} />
        <span>Start Tour</span>
      </button>
    </div>
  );
}
