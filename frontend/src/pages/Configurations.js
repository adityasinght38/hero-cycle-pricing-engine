import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getConfigurations, deleteConfiguration, recalculateConfiguration } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const catBadgeClass = (cat) => `badge badge-${cat.toLowerCase().replace(' ', '')}`;

function ConfigDetailModal({ config, onClose, onDelete, onRecalculate }) {
  const [recalcResult, setRecalcResult] = useState(null);
  const [recalculating, setRecalculating] = useState(false);

  const GST_RATE = 0.18;
  const base = config.totalPrice;
  const gst = base * GST_RATE;

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await recalculateConfiguration(config._id);
      const r = res.data;
      setRecalcResult({ oldTotal: r.oldTotal, newTotal: r.newTotal, difference: r.difference });
      onRecalculate(r.data);
      toast.success('Prices recalculated with latest rates');
    } catch {
      toast.error('Recalculation failed');
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{config.cycleName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {config.targetAudience} · Created by {config.createdBy} · {fmtDate(config.createdAt)}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {config.description && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {config.description}
            </div>
          )}

          <div style={{ marginBottom: 8 }}>
            <span className="card-title">Parts Breakdown</span>
          </div>

          {config.parts.map(part => (
            <div className="breakdown-item" key={part._id}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{part.partName}</div>
                <span className={catBadgeClass(part.category)} style={{ marginTop: 3 }}>{part.category}</span>
              </div>
              <span className="price">{fmt(part.priceAtTime)}</span>
            </div>
          ))}

          {recalcResult && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: recalcResult.difference > 0 ? 'rgba(232,50,30,0.06)' : 'rgba(45,206,137,0.06)',
              border: `1px solid ${recalcResult.difference > 0 ? 'rgba(232,50,30,0.2)' : 'rgba(45,206,137,0.2)'}`,
              borderRadius: 8, fontSize: 13
            }}>
              Price changed from <strong>{fmt(recalcResult.oldTotal)}</strong> → <strong>{fmt(recalcResult.newTotal)}</strong>
              {' '}(<span style={{ color: recalcResult.difference > 0 ? 'var(--hero-red)' : 'var(--hero-green)' }}>
                {recalcResult.difference > 0 ? '+' : ''}{fmt(recalcResult.difference)}
              </span>)
            </div>
          )}

          <div className="total-row">
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Subtotal</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>+ GST 18% = {fmt(base + gst)}</div>
            </div>
            <span className="price-large">{fmt(base)}</span>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div className="flex gap-2">
            <button className="btn btn-danger btn-sm" onClick={() => { onDelete(config._id); onClose(); }}>
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-secondary" onClick={handleRecalculate} disabled={recalculating}>
              {recalculating ? 'Recalculating…' : '🔄 Recalculate Prices'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Configurations() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getConfigurations()
      .then(r => setConfigs(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this configuration?')) return;
    try {
      await deleteConfiguration(id);
      setConfigs(c => c.filter(x => x._id !== id));
      toast.success('Configuration deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleRecalculate = (updated) => {
    setConfigs(c => c.map(x => x._id === updated._id ? updated : x));
    setSelected(updated);
  };

  const filtered = configs.filter(c =>
    !search || c.cycleName.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      {selected && (
        <ConfigDetailModal
          config={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          onRecalculate={handleRecalculate}
        />
      )}

      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <div className="page-title">CONFIGURATIONS</div>
            <div className="page-subtitle">All saved cycle builds with price snapshots</div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/builder')}>
            + New Configuration
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="flex gap-3 mb-4">
          <input
            className="form-input"
            style={{ maxWidth: 280 }}
            placeholder="Search configurations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
            {filtered.length} config{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card" style={{ padding: '60px 20px' }}>
            <div style={{ fontSize: 32 }}>🚲</div>
            <h3>No configurations yet</h3>
            <div>Build your first cycle configuration using the builder.</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/builder')}>
              Open Builder
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map(config => (
              <div
                key={config._id}
                className="card"
                style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
                onClick={() => setSelected(config)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ padding: '16px 18px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{config.cycleName}</div>
                    <span className={`badge badge-${config.status?.toLowerCase()}`}>{config.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    {config.targetAudience} · {config.parts.length} part{config.parts.length !== 1 ? 's' : ''} · {fmtDate(config.createdAt)}
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                    {config.parts.map(p => (
                      <span key={p._id} className={catBadgeClass(p.category)} style={{ fontSize: 10 }}>{p.partName}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total (excl. GST)</div>
                      <div className="price" style={{ fontSize: 22, fontFamily: 'var(--font-display)', letterSpacing: 1 }}>
                        {fmt(config.totalPrice)}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                      By {config.createdBy}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
