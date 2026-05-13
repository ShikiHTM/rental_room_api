import { useEffect, useState } from 'react';
import { Users as UsersIcon, Home, DollarSign, RefreshCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, type AdminStats } from '../services/admin.service';
import './pages.css';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

const Dashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setStats(await adminService.getStats());
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <section>
      <div className="section-head">
        <div>
          <h1>Platform overview</h1>
          <p>A live snapshot of activity across the marketplace.</p>
        </div>
        <button className="btn" onClick={load} disabled={loading}>
          <RefreshCcw size={14} />
          Refresh
        </button>
      </div>

      {loading && !stats ? (
        <div className="loading-row card">
          <Loader2 size={18} className="spin" /> Loading stats…
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                <UsersIcon size={22} />
              </div>
              <div>
                <div className="stat-label">Total users</div>
                <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                <div className="stat-sub">All registered accounts</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Home size={22} />
              </div>
              <div>
                <div className="stat-label">Pending rooms</div>
                <div className="stat-value">{stats?.pendingRooms ?? 0}</div>
                <div className="stat-sub">Awaiting approval</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                <DollarSign size={22} />
              </div>
              <div>
                <div className="stat-label">Platform revenue</div>
                <div className="stat-value">{usd(stats?.platformRevenue ?? 0)}</div>
                <div className="stat-sub">
                  Fee {((stats?.platformFeeRate ?? 0) * 100).toFixed(1)}% of {usd(stats?.grossPaid ?? 0)} paid
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Dashboard;
