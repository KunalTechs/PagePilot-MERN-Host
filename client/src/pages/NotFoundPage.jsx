import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

const NotFoundPage = ({ slug }) => {
  return (
    <div className="state-container glass-panel" style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <div style={{ color: 'var(--accent-purple)', marginBottom: '1rem' }}>
        <FileQuestion size={48} style={{ margin: '0 auto' }} />
      </div>
      <h1 style={{ fontSize: '3rem', color: 'var(--accent-purple)', marginBottom: '0.25rem' }}>404</h1>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        {slug ? (
          <>No published page with slug <code>/{slug}</code> was found in PagePilot.</>
        ) : (
          <>The requested route does not exist.</>
        )}
      </p>
      <Link to="/" className="btn-action">
        <ArrowLeft size={16} /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
