import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getParts, createConfiguration } from '../utils/api';

const CATEGORIES = ['Frame', 'Tyre', 'Gear Set', 'Seat', 'Brakes', 'Handlebar', 'Pedal', 'Chain', 'Wheel', 'Other'];
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const catBadgeClass = (cat) => `badge badge-${cat.toLowerCase().replace(' ', '')}`;

export default function ConfigurationBuilder() {
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({ cycleName: '', description: '', targetAudience: 'Adult', createdBy: 'Salesperson' });
  const [filterCat, setFilterCat] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getParts({ isActive: true }).then(r => setParts(r.data.data)).catch(() => {});
  }, []);

  const togglePart = (id) => {
    setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const selectedParts = parts.filter(p => selectedIds.includes(p._id));
  const totalPrice = selectedParts.reduce((sum, p) => sum + p.currentPrice, 0);

  const filteredParts = parts.filter(p => {
    const matchCat = !filterCat || p.category === filterCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmit = async () => {
    if (!form.cycleName.trim()) return toast.error('Give your cycle a name');
    if (selectedIds.length === 0) return toast.error('Select at least one part');
    setSaving(true);
    try {
      await createConfiguration({ ...form, partIds: selectedIds });
      toast.success('Configuration saved!');
      navigate('/configurations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const GST_RATE = 0.18;
  const gst = totalPrice * GST_RATE;
  const totalWithGST = totalPrice + gst;

  return (
    <>
      <div className="page-header">
        <div className="page-title">CONFIGURATION BUILDER</div>
        <div className="page-subtitle">Select parts to build a cycle — prices update in real-time</div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

          {/* LEFT — part selector */}
          <div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Select Parts</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {selectedIds.length} selected
                </span>
              </div>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Search parts…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select className="form-select" style={{ width: 160 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ padding: 16 }}>
                {parts.length === 0 ? (
                  <div className="empty-state">
                    <div>🔧</div>
                    <h3>No parts available</h3>
                    <div>Add parts in the Parts Library first.</div>
                  </div>
                ) : (
                  <div className="part-checkbox-grid">
                    {filteredParts.map(part => (
                      <div
                        key={part._id}
                        className={`part-checkbox-item ${selectedIds.includes(part._id) ? 'selected' : ''}`}
                        onClick={() => togglePart(part._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(part._id)}
                          onChange={() => {}}
                        />
                        <div className="part-info">
                          <div className="part-name-sm">{part.name}</div>
                          <div className="part-cat-sm">{part.category}</div>
                        </div>
                        <div className="part-price-sm">{fmt(part.currentPrice)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — summary + form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Price breakdown */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Price Breakdown</span>
                {selectedParts.length > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedIds([])}
                  >Clear</button>
                )}
              </div>
              <div className="card-body">
                {selectedParts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    Select parts on the left to see pricing
                  </div>
                ) : (
                  <>
                    {selectedParts.map(part => (
                      <div className="breakdown-item" key={part._id}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{part.name}</div>
                          <span className={catBadgeClass(part.category)} style={{ marginTop: 3 }}>{part.category}</span>
                        </div>
                        <span className="price">{fmt(part.currentPrice)}</span>
                      </div>
                    ))}

                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>Subtotal</span>
                        <span className="font-mono">{fmt(totalPrice)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                        <span>GST (18%)</span>
                        <span className="font-mono">{fmt(gst)}</span>
                      </div>
                    </div>

                    <div className="total-row">
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Total (incl. GST)</span>
                      <span className="price-large">{fmt(totalWithGST)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Config details */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Configuration Details</span>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Cycle Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Mountain Pro X"
                    value={form.cycleName}
                    onChange={e => setForm(f => ({ ...f, cycleName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select className="form-select" value={form.targetAudience}
                    onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}>
                    {['Kids', 'Youth', 'Adult', 'Professional'].map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Optional notes about this configuration…"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Created By</label>
                  <input
                    className="form-input"
                    value={form.createdBy}
                    onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))}
                  />
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={handleSubmit}
                  disabled={saving || selectedIds.length === 0}
                >
                  {saving ? 'Saving…' : `Save Configuration · ${fmt(totalPrice)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
