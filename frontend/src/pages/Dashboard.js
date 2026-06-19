import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../utils/api';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const CATEGORY_COLORS = {
  Frame: '#4a90e2', Tyre: '#2dce89', 'Gear Set': '#f5a623',
  Seat: '#e8321e', Brakes: '#b464ff', Handlebar: '#5dc8f7',
  Pedal: '#ffb432', Chain: '#b0b0b0', Wheel: '#6fb3e0', Other: '#909090'
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '40px 32px', color: 'var(--text-secondary)' }}>Loading dashboard…</div>
  );

  const s = stats || {};

  return (
    <>
      <div className="page-header">
        <div className="page-title">DASHBOARD</div>
        <div className="page-subtitle">Live overview of parts, pricing and configurations</div>
      </div>

      <div className="page-body">
        {/* Stat row */}
        <div className="stat-grid">
          <div className="stat-card red">
            <div className="stat-label">Total Parts</div>
            <div className="stat-value">{s.totalParts ?? 0}</div>
            <div className="stat-sub">{s.activeParts ?? 0} active</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Configurations</div>
            <div className="stat-value">{s.totalConfigs ?? 0}</div>
            <div className="stat-sub">{s.activeConfigs ?? 0} active</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Part Categories</div>
            <div className="stat-value">{(s.categoryBreakdown || []).length}</div>
            <div className="stat-sub">across all parts</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Top Config Price</div>
            <div className="stat-value" style={{ fontSize: 28, letterSpacing: 0 }}>
              {s.topConfigs?.length ? fmt(s.topConfigs[0].totalPrice) : '—'}
            </div>
            <div className="stat-sub">{s.topConfigs?.[0]?.cycleName || 'no configs yet'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Category breakdown */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Parts by Category</span>
            </div>
            <div className="card-body">
              {(s.categoryBreakdown || []).length === 0 ? (
                <div className="empty-state">
                  <div>No parts added yet.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(s.categoryBreakdown || []).map(cat => (
                    <div key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        background: CATEGORY_COLORS[cat._id] || '#888'
                      }} />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{cat._id}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.count} part{cat.count !== 1 ? 's' : ''}</span>
                      <span className="price" style={{ fontSize: 12 }}>avg {fmt(cat.avgPrice)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top configurations */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Top Configurations by Price</span>
            </div>
            <div className="card-body">
              {(s.topConfigs || []).length === 0 ? (
                <div className="empty-state">
                  <div>No configurations yet.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(s.topConfigs || []).map((cfg, i) => (
                    <div key={cfg._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: i === 0 ? 'var(--hero-amber)' : 'var(--surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                        color: i === 0 ? '#000' : 'var(--text-muted)'
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cfg.cycleName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cfg.targetAudience}</div>
                      </div>
                      <span className="price">{fmt(cfg.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business context callout */}
        <div style={{
          marginTop: 24,
          background: 'rgba(245,166,35,0.06)',
          border: '1px solid rgba(245,166,35,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14
        }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--hero-amber)', marginBottom: 4 }}>
              How the pricing engine works
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              When a salesperson builds a configuration, each part's <strong>current price is snapshotted</strong>.
              If part prices change later, existing configs retain the original price — but you can <strong>recalculate</strong> any
              config to apply the latest prices. Full price history is tracked for every part.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
