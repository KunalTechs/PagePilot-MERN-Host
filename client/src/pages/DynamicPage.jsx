import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import RenderContent from '../components/RenderContent';
import FAQAccordion from '../components/FAQAccordion';
import NotFoundPage from './NotFoundPage';
import { AlertTriangle, Lock, RefreshCw } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

const DynamicPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { setHeaderMenu } = useMenu();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [statusCode, setStatusCode] = useState(200);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const search = location.search || '';
    const isPreview = search.includes('mode=preview');

    const headers = {};
    if (isPreview) {
      const storedToken = sessionStorage.getItem('pvt');
      if (storedToken) {
        headers['x-preview-token'] = storedToken;
      }
    }

    const fetchPageContent = async () => {
      try {
        const cleanSlug = (slug || '').trim();
        const response = await fetch(`${apiUrl}/api/pages/${encodeURIComponent(cleanSlug)}${search}`, {
          headers,
          signal: controller.signal
        });

        const data = await response.json();

        if (!response.ok) {
          setStatusCode(response.status);
          setError(data.error || data.message || 'Failed to fetch page.');
          setPage(null);
          setHeaderMenu(null);
        } else {
          setStatusCode(200);
          const pageObj = data.page || data.data;
          setPage(pageObj);

          if (pageObj) {
            setHeaderMenu(pageObj.headerMenu || null);

            // Update document title dynamically
            const pageTitle = pageObj.metaTitle || pageObj.title || pageObj.name;
            if (pageTitle) {
              document.title = `${pageTitle} | PagePilot MERN`;
            }

            // Update or create meta description tag
            let metaTag = document.querySelector('meta[name="description"]');
            if (!metaTag) {
              metaTag = document.createElement('meta');
              metaTag.name = 'description';
              document.head.appendChild(metaTag);
            }
            if (pageObj.metaDescription) {
              metaTag.content = pageObj.metaDescription;
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // Cancelled on unmount / slug change
        setStatusCode(500);
        setError('Content service unavailable.');
        setPage(null);
        setHeaderMenu(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();

    return () => {
      controller.abort();
    };
  }, [slug, location.search]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="state-container glass-panel">
        <div className="spinner" />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>Loading Page Content...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Connecting to PagePilot service and rendering zero-code layout for <code>/{slug}</code>
        </p>
      </div>
    );
  }

  // 2. Draft Forbidden State (403)
  if (statusCode === 403) {
    return (
      <div className="state-container glass-panel" style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}>
        <div style={{ color: '#f43f5e', marginBottom: '1rem' }}>
          <Lock size={44} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#f43f5e' }}>Draft Preview Protected</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.925rem' }}>
          {error || 'Accessing draft content in preview mode requires a valid x-preview-token header.'}
        </p>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
          Enter the authorization token in the top banner or remove <code>?mode=preview</code> from the URL.
        </p>
      </div>
    );
  }

  // 3. Not Found State (404 / 400)
  if (statusCode === 404 || statusCode === 400) {
    return <NotFoundPage slug={slug} />;
  }

  // 4. Server/Network Error / Connecting State
  if (error || !page) {
    return (
      <div className="state-container glass-panel">
        <div style={{ color: '#60a5fa', marginBottom: '1rem' }}>
          <AlertTriangle size={44} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 600 }}>Connecting to PagePilot Content Service...</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
          Taking a moment to fetch page content. If the backend service is starting up, please click below to reconnect.
        </p>
        <button onClick={() => window.location.reload()} className="btn-action">
          <RefreshCw size={15} /> Reconnect Page
        </button>
      </div>
    );
  }

  // 5. Successful Render State
  return (
    <div className="dynamic-page-wrapper" style={{ paddingBottom: '3rem' }}>
      <RenderContent page={page} />
      <FAQAccordion faqs={page?.faqs} />
    </div>
  );
};

export default DynamicPage;

