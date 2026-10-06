import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Eye, Key } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import PagePilotGuidanceHub from './PagePilotGuidanceHub';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { headerMenu } = useMenu();

  const isPreviewMode = location.search.includes('mode=preview');
  const [tokenInput, setTokenInput] = useState(() => sessionStorage.getItem('pvt') || '');

  useEffect(() => {
    sessionStorage.setItem('pvt', tokenInput);
  }, [tokenInput]);

  const togglePreviewMode = () => {
    const params = new URLSearchParams(location.search);
    if (isPreviewMode) {
      params.delete('mode');
    } else {
      params.set('mode', 'preview');
    }
    const searchStr = params.toString() ? `?${params.toString()}` : '';
    navigate(`${location.pathname}${searchStr}`);
  };

  // Normalize dynamic header menu items
  const dynamicItems = Array.isArray(headerMenu)
    ? headerMenu
    : Array.isArray(headerMenu?.items)
    ? headerMenu.items
    : Array.isArray(headerMenu?.links)
    ? headerMenu.links
    : Array.isArray(headerMenu?.configuration)
    ? headerMenu.configuration
    : [];

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Shared Application Header */}
      <header className="navbar glass-panel">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">P</div>
          <span>PagePilot <span className="gradient-text">MERN Host</span></span>
        </Link>

        <nav>
          <ul className="nav-links">
            {dynamicItems.length > 0 ? (
              dynamicItems.map((item, idx) => {
                const label = (item.title || item.label || item.name || item.text || `Item ${idx + 1}`).trim();
                let rawUrl = item.url || item.path || item.href || (item.slug ? `/${item.slug}` : '/');
                if (typeof rawUrl === 'string') {
                  rawUrl = rawUrl.trim();
                  if (!rawUrl.startsWith('/') && !rawUrl.startsWith('http')) {
                    rawUrl = `/${rawUrl}`;
                  }
                }
                const isExternal = typeof rawUrl === 'string' && rawUrl.startsWith('http');

                return (
                  <li key={item._id || item.slug || idx} className="nav-item">
                    {isExternal ? (
                      <a href={rawUrl} target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                    ) : (
                      <Link to={rawUrl} className={location.pathname === rawUrl ? 'active' : ''}>
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })
            ) : (
              /* Clean default menu links */
              <>
                <li className="nav-item">
                  <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/banner" className={location.pathname === '/banner' ? 'active' : ''}>
                    Banners
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/demos" className={location.pathname === '/demos' ? 'active' : ''}>
                    Demos
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <PagePilotGuidanceHub />
          <button
            onClick={togglePreviewMode}
            className={`preview-badge ${isPreviewMode ? 'active' : 'inactive'}`}
            style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
          >
            <Eye size={14} />
            <span>{isPreviewMode ? 'Preview Mode Active' : 'Live Mode'}</span>
          </button>
        </div>
      </header>

      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          borderBottom: '1px solid rgba(244, 63, 94, 0.3)',
          padding: '0.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: '#f43f5e', fontWeight: 600 }}>
            🔒 Draft Preview Mode (`?mode=preview`) - Requires Authorization
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={14} style={{ color: '#8b5cf6' }} />
            <span style={{ color: '#9ca3af' }}>x-preview-token:</span>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter token..."
              style={{
                background: '#1f2937',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                width: '180px'
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Rendered inside MERN Host Layout */}
      <main style={{ flex: 1, width: '100%' }}>
        {children}
      </main>

      {/* Shared Application Footer */}
      <footer style={{
        padding: '1.5rem 2rem',
        borderTop: '1px solid var(--border-glass)',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        PagePilot MERN Integration POC &bull; Shared MERN Host Application Shell
      </footer>
    </div>
  );
};

export default Layout;
