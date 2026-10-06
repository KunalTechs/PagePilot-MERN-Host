import React from 'react';
import { Megaphone, LayoutGrid, Layers, RefreshCw } from 'lucide-react';
import PagePilotBanner from '../components/PagePilotBanner';

/**
 * BannerShowcasePage Component
 * Dedicated page showcasing PagePilot App Banners (Simple, Carousel, Modal, Floater).
 */
export default function BannerShowcasePage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '2rem 2.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <Megaphone size={18} />
          <span>PagePilot App Banners</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          App Banners Showcase
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '700px' }}>
          App banners fetched dynamically from PagePilot by identifier and rendered into matching DOM containers.
        </p>
      </div>

      {/* Banner Slot #1: Guide User Simple Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
              Live Banner: Guide User
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Type: Simple Banner &bull; Identifier: <code>menus</code>
            </span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <RefreshCw size={14} /> Re-fetch
          </button>
        </div>

        {/* PagePilot Banner Container Slot */}
        <div style={{ minHeight: '120px', width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem', overflow: 'hidden' }}>
          <PagePilotBanner identifier="menus" />
        </div>
      </div>

      {/* Banner Slot #2: Carousel Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
              Live Banner: Carousel Showcase
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Type: Carousel &bull; Identifier: <code>Shubh</code>
            </span>
          </div>
        </div>

        {/* PagePilot Carousel Container Slot */}
        <div style={{ minHeight: '120px', width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem', overflow: 'hidden' }}>
          <PagePilotBanner identifier="Shubh" />
        </div>
      </div>
    </div>
  );
}
