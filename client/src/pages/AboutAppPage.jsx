import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Zap } from 'lucide-react';

const AboutAppPage = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '20px' }}>
        <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
          Static Route Precedence Proof <span className="gradient-text">(/about-app)</span>
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
          This is a hardcoded React static route defined at <code>/about-app</code> inside <code>App.jsx</code>. 
          Because React Router evaluates explicit static routes before dynamic catch-all routes (<code>/:slug</code>), 
          visiting <code>/about-app</code> renders this component directly without hitting PagePilot API.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <CheckCircle size={18} /> Static Precedence
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Static routes in React Router take priority over dynamic <code>/:slug</code> parameter routes.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Zap size={18} /> Zero Delay
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Renders immediately without making server proxy requests to PagePilot.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/about-us" className="btn-action">
            Test Dynamic PagePilot Route (/about-us) &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutAppPage;
