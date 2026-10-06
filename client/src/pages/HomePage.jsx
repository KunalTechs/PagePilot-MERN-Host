import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, ShieldCheck, Cpu, ArrowRight, ExternalLink, Globe } from 'lucide-react';
import PagePilotBanner from '../components/PagePilotBanner';

const HomePage = () => {
  const [testSlug, setTestSlug] = useState('about-us');

  return (
    <div style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 1.5rem' }}>
      {/* Hero Banner */}
      <div className="glass-panel" style={{ borderRadius: '24px', padding: '3.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Globe size={14} /> PagePilot dynamic MERN proxy POC
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.75rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          Dynamic PagePilot Routing <br />
          <span className="gradient-text">Zero Code Change Per Page</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto 2rem auto' }}>
          Integrates no-code pages created in PagePilot directly into your MERN application. 
          Visiting <code>/<span style={{ color: '#60a5fa' }}>slug</span></code> fetches and renders the PagePilot HTML seamlessly on your domain inside a secure Shadow DOM container.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/about-us" className="btn-action">
            View Live Page (/about-us) <ArrowRight size={16} />
          </Link>
          <a 
            href="https://pagepilot.fabbuilder.com" 
            target="_blank" 
            rel="noreferrer" 
            className="btn-action" 
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}
          >
            PagePilot Builder <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '1rem' }}>
            <Cpu size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Dynamic Catch-All Router</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            React Router captures <code>/:slug</code> dynamically. Any new page created in PagePilot automatically resolves without touching application code.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '1rem' }}>
            <Code size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Shadow DOM + DOMPurify</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Encapsulates CSS styles in a Shadow DOM root to avoid style leakage. Sanitized on server and client with DOMPurify against XSS attacks.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem' }}>
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Production Security</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Protected draft preview mode (<code>?mode=preview</code>), input slug sanitization, Express rate limiting, and CORS whitelist protection.
          </p>
        </div>
      </div>

      {/* Quick Test Bench */}
      <div className="glass-panel" style={{ marginTop: '2.5rem', padding: '2rem', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
          Test Dynamic Route Resolution
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1rem' }}>
          Type any page slug below to test route resolution against your Express proxy backend:
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px' }}>
          <input
            type="text"
            value={testSlug}
            onChange={(e) => setTestSlug(e.target.value)}
            placeholder="e.g. about-us"
            style={{
              flex: 1,
              background: '#1f2937',
              border: '1px solid var(--border-glass)',
              color: '#fff',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.95rem'
            }}
          />
          <Link to={`/${testSlug}`} className="btn-action" style={{ marginTop: 0 }}>
            Navigate to /{testSlug}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
