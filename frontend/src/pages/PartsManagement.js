import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getParts, createPart, updatePart, deletePart, getPartHistory } from '../utils/api';

const CATEGORIES = ['Frame', 'Tyre', 'Gear Set', 'Seat', 'Brakes', 'Handlebar', 'Pedal', 'Chain', 'Wheel', 'Other'];
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const EMPTY_FORM = { name: '', category: 'Tyre', description: '', currentPrice: '', sku: '' };

function PartModal({ part, onClose, onSave }) {
  const [form, setForm] = useState(part ? {
    name: part.name, category: part.category,
    description: part.description || '',
    currentPrice: part.currentPrice, sku: part.sku || ''
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) return toast.error('Part name is required');
    if (!form.currentPrice || Number(form.currentPrice) < 0) return toast.error('Enter a valid price');
    setSaving(true);
    try {
      if (part) {
        const res = await updatePart(part._id, { ...form, currentPrice: Number(form.currentPrice) });
        toast.success('Part updated');
        onSave(res.data.data, 'update');
      } else {
        const res = await createPart({ ...form, currentPrice: Number(form.currentPrice) });
        toast.success('Part added');
        onSave(res.data.data, 'create');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save part');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{part ? 'Edit Part' : 'Add New Part'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Part Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="e.g. Mountain Tyre" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Price (INR) *</label>
              <div className="input-prefix">
                <span className="input-prefix-symbol">₹</span>
                <input className="form-input" name="currentPrice" type="number" min="0"
                  value={form.currentPrice} onChange={handle} placeholder="250" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">SKU (optional)</label>
              <input className="form-input" name="sku" value={form.sku} onChange={handle} placeholder="TYR-MTN-001" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description}
              onChange={handle} placeholder="Brief description of the part…" />
          </div>
          {part && (
            <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
              ⚠️ Changing the price will record the old price in this part's price history.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : (part ? 'Save Changes' : 'Add Part')}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({ partId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getPartHistory(partId).then(r => setData(r.data.data)).catch(() => {});
  }, [partId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Price History — {data?.name || '…'}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!data ? <div style={{ color: 'var(--text-muted)' }}>Loading…</div> : (
            <>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current price: </span>
                <span className="price">{fmt(data.currentPrice)}</span>
              </div>
              {data.priceHistory.length === 0 ? (
                <div className="empty-state"><div>No history recorded yet.</div></div>
              ) : (
                <div className="history-list">
                  {[...data.priceHistory].reverse().map((h, i) => (
                    <div className="history-item" key={i}>
                      <div className="history-dot" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(h.changedAt)}</div>
                        {h.note && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{h.note}</div>}
                      </div>
                      <span className="price">{fmt(h.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function PartsManagement() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [historyPartId, setHistoryPartId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const load = () => {
    setLoading(true);
    getParts().then(r => setParts(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deletePart(id);
      toast.success('Part deleted');
      setParts(p => p.filter(x => x._id !== id));
    } catch {
      toast.error('Failed to delete part');
    }
  };

  const handleSave = (saved, type) => {
    if (type === 'create') setParts(p => [saved, ...p]);
    else setParts(p => p.map(x => x._id === saved._id ? saved : x));
  };

  const filtered = parts.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const catBadgeClass = (cat) => `badge badge-${cat.toLowerCase().replace(' ', '')}`;

  return (
    <>
      {showModal && (
        <PartModal
          part={editPart}
          onClose={() => { setShowModal(false); setEditPart(null); }}
          onSave={handleSave}
        />
      )}
      {historyPartId && (
        <HistoryModal partId={historyPartId} onClose={() => setHistoryPartId(null)} />
      )}

      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <div className="page-title">PARTS LIBRARY</div>
            <div className="page-subtitle">Manage all bicycle components and their prices</div>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditPart(null); setShowModal(true); }}>
            + Add Part
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input
            className="form-input"
            style={{ maxWidth: 260 }}
            placeholder="Search by name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="form-select" style={{ maxWidth: 180 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
            {filtered.length} part{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading parts…</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div>🔧</div>
                <h3>No parts found</h3>
                <div>{parts.length === 0 ? 'Add your first part to get started.' : 'Try adjusting your search or filter.'}</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Part Name</th>
                    <th>Category</th>
                    <th>SKU</th>
                    <th>Current Price</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(part => (
                    <tr key={part._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{part.name}</div>
                        {part.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{part.description}</div>}
                      </td>
                      <td><span className={catBadgeClass(part.category)}>{part.category}</span></td>
                      <td><span className="font-mono text-sm text-muted">{part.sku || '—'}</span></td>
                      <td><span className="price">{fmt(part.currentPrice)}</span></td>
                      <td>
                        <span className={`badge badge-${part.isActive ? 'active' : 'inactive'}`}>
                          {part.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(part.updatedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => setHistoryPartId(part._id)} title="View price history">
                            📈 History
                          </button>
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => { setEditPart(part); setShowModal(true); }}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(part._id, part.name)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
