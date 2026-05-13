import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, type PaymentRow } from '../services/admin.service';
import './pages.css';

type StatusFilter = 'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
type MethodFilter = 'ALL' | 'CASH' | 'BANK_TRANSFER' | 'ONLINE';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const statusBadge = (s: PaymentRow['status']) => {
  if (s === 'COMPLETED') return 'badge badge-completed';
  if (s === 'FAILED') return 'badge badge-failed';
  if (s === 'CANCELLED') return 'badge badge-cancelled';
  return 'badge badge-pending';
};

const Payments = () => {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [method, setMethod] = useState<MethodFilter>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      setRows(await adminService.listPayments());
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((p) => {
      if (status !== 'ALL' && p.status !== status) return false;
      if (method !== 'ALL' && p.method !== method) return false;
      if (!q) return true;
      const b = p.booking;
      return (
        p.id.toLowerCase().includes(q) ||
        (p.transactionId ?? '').toLowerCase().includes(q) ||
        (b?.user.fullName.toLowerCase().includes(q) ?? false) ||
        (b?.user.email.toLowerCase().includes(q) ?? false) ||
        (b?.room.title.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, search, status, method]);

  const totals = useMemo(() => {
    let gross = 0, fee = 0;
    for (const p of filtered) {
      if (p.status !== 'COMPLETED') continue;
      gross += p.amount;
      fee += p.platformFee;
    }
    return { gross, fee };
  }, [filtered]);

  return (
    <section>
      <div className="section-head">
        <div>
          <h1>Payment History</h1>
          <p>Every recorded payment, with platform-fee breakdown on completed transactions.</p>
        </div>
        <button className="btn" onClick={load} disabled={loading}>
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>$</div>
          <div>
            <div className="stat-label">Gross paid (filtered)</div>
            <div className="stat-value">{usd(totals.gross)}</div>
            <div className="stat-sub">Sum of COMPLETED payments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>%</div>
          <div>
            <div className="stat-label">Platform revenue (filtered)</div>
            <div className="stat-value">{usd(totals.fee)}</div>
            <div className="stat-sub">Computed from platform fee rate</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="filter-bar">
            <div className="search-wrap">
              <Search size={14} className="search-icon" />
              <input
                className="input input-search"
                placeholder="Search guest, room, transaction…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select value={method} onChange={(e) => setMethod(e.target.value as MethodFilter)}>
              <option value="ALL">All methods</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="cell-muted">{filtered.length} of {rows.length}</div>
        </div>

        {loading ? (
          <div className="loading-row">
            <Loader2 size={16} className="spin" /> Loading payments…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No payments match these filters.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Method</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Platform fee</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-stack">
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      <span className="cell-muted">{new Date(p.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>
                    {p.booking ? (
                      <div className="cell-stack">
                        <strong>{p.booking.user.fullName}</strong>
                        <span className="cell-muted">{p.booking.user.email}</span>
                      </div>
                    ) : <span className="cell-muted">—</span>}
                  </td>
                  <td>
                    {p.booking ? (
                      <div className="cell-stack">
                        <span>{p.booking.room.title}</span>
                        <span className="cell-muted">{p.booking.room.city}</span>
                      </div>
                    ) : <span className="cell-muted">—</span>}
                  </td>
                  <td><span className="badge badge-info">{p.method}</span></td>
                  <td><span className={statusBadge(p.status)}>{p.status}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{usd(p.amount)}</td>
                  <td style={{ textAlign: 'right', color: p.status === 'COMPLETED' ? 'var(--success)' : 'var(--text-muted)' }}>
                    {p.status === 'COMPLETED' ? usd(p.platformFee) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Payments;
