import { useEffect, useState } from 'react';
import { Search, RefreshCcw, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, type Booking, type BookingStatus } from '../services/admin.service';
import './pages.css';

type StatusFilter = 'ALL' | BookingStatus;

const statusBadge = (s: BookingStatus) => {
  if (s === 'CONFIRMED') return 'badge badge-approved';
  if (s === 'COMPLETED') return 'badge badge-completed';
  if (s === 'CANCELLED') return 'badge badge-cancelled';
  return 'badge badge-pending';
};

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();

const Bookings = () => {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await adminService.searchBookings(
          search.trim(),
          status === 'ALL' ? undefined : status,
        );
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) toast.error('Failed to load bookings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, status]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await adminService.searchBookings(
        search.trim(),
        status === 'ALL' ? undefined : status,
      );
      setRows(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const setBookingStatus = async (b: Booking, next: BookingStatus, verb: string) => {
    setActing(b.id);
    try {
      await adminService.updateBookingStatus(b.id, next);
      toast.success(`Booking ${verb}`);
      setRows((prev) => prev.map((r) => (r.id === b.id ? { ...r, status: next } : r)));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? `Failed to ${verb} booking`);
    } finally {
      setActing(null);
    }
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <h1>Booking Management</h1>
          <p>Confirm or cancel reservations. Search is powered by Meilisearch.</p>
        </div>
        <button className="btn" onClick={refresh} disabled={loading}>
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="filter-bar">
            <div className="search-wrap">
              <Search size={14} className="search-icon" />
              <input
                className="input input-search"
                placeholder="Search guest, email, room, city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="cell-muted">{rows.length} result{rows.length === 1 ? '' : 's'}</div>
        </div>

        {loading ? (
          <div className="loading-row">
            <Loader2 size={16} className="spin" /> Loading bookings…
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-state">No bookings match these filters.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Stay</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const busy = acting === b.id;
                return (
                  <tr key={b.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{b.userName || '—'}</strong>
                        <span className="cell-muted">{b.userEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <span>{b.roomTitle}</span>
                        <span className="cell-muted">{b.roomCity}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <span>{fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}</span>
                        <span className="cell-muted">Booked {fmtDate(b.createdAt)}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{usd(Number(b.totalPrice))}</td>
                    <td><span className={statusBadge(b.status)}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {b.status === 'PENDING' && (
                          <button
                            className="btn btn-success"
                            disabled={busy}
                            onClick={() => setBookingStatus(b, 'CONFIRMED', 'confirmed')}
                          >
                            <CheckCircle2 size={14} /> Confirm
                          </button>
                        )}
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                          <button
                            className="btn btn-danger"
                            disabled={busy}
                            onClick={() => setBookingStatus(b, 'CANCELLED', 'cancelled')}
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            className="btn"
                            disabled={busy}
                            onClick={() => setBookingStatus(b, 'COMPLETED', 'completed')}
                          >
                            <CheckCircle2 size={14} /> Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Bookings;
