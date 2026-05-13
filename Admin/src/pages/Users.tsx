import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCcw, Loader2, Ban, RotateCcw, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/admin.service';
import { type User } from '../services/auth.service';
import './pages.css';

type RoleFilter = 'ALL' | 'USER' | 'HOST' | 'ADMIN';
type StatusFilter = 'ALL' | 'ACTIVE' | 'BANNED';

const isBanned = (u: User) => !!u.bannedAt && (!u.banExpiresAt || new Date(u.banExpiresAt) > new Date());

const roleBadge = (r: User['role']) => {
  if (r === 'ADMIN') return 'badge badge-admin';
  if (r === 'HOST') return 'badge badge-host';
  return 'badge badge-user';
};

const Users = () => {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [editing, setEditing] = useState<User | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await adminService.getUsers());
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((u) => {
      if (role !== 'ALL' && u.role !== role) return false;
      const banned = isBanned(u);
      if (status === 'ACTIVE' && banned) return false;
      if (status === 'BANNED' && !banned) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [rows, search, role, status]);

  const ban = async (u: User) => {
    const reason = window.prompt(`Ban ${u.fullName}? Provide a reason:`, 'Violated terms of service');
    if (!reason) return;
    try {
      await adminService.banUser(u.id, reason);
      toast.success(`${u.fullName} banned`);
      load();
    } catch {
      toast.error('Failed to ban user');
    }
  };

  const unban = async (u: User) => {
    try {
      await adminService.unbanUser(u.id);
      toast.success(`${u.fullName} unbanned`);
      load();
    } catch {
      toast.error('Failed to unban user');
    }
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <h1>User Management</h1>
          <p>Ban, unban, and edit registered accounts.</p>
        </div>
        <button className="btn" onClick={load} disabled={loading}>
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
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={role} onChange={(e) => setRole(e.target.value as RoleFilter)}>
              <option value="ALL">All roles</option>
              <option value="USER">User</option>
              <option value="HOST">Host</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
          <div className="cell-muted">{filtered.length} of {rows.length}</div>
        </div>

        {loading ? (
          <div className="loading-row">
            <Loader2 size={16} className="spin" /> Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No users match these filters.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const banned = isBanned(u);
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{u.fullName}</strong>
                        <span className="cell-muted">ID: {u.id.substring(0, 8)}…</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phoneNumber || <span className="cell-muted">—</span>}</td>
                    <td><span className={roleBadge(u.role)}>{u.role}</span></td>
                    <td>
                      {banned
                        ? <span className="badge badge-banned" title={u.banReason ?? ''}>Banned</span>
                        : <span className="badge badge-active">Active</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button className="btn" onClick={() => setEditing(u)}>
                          <Pencil size={14} /> Edit
                        </button>
                        {banned ? (
                          <button className="btn btn-success" onClick={() => unban(u)}>
                            <RotateCcw size={14} /> Unban
                          </button>
                        ) : (
                          <button className="btn btn-danger" onClick={() => ban(u)}>
                            <Ban size={14} /> Ban
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

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(u) => {
            setRows((prev) => prev.map((r) => (r.id === u.id ? u : r)));
            setEditing(null);
          }}
        />
      )}
    </section>
  );
};

const EditUserModal = ({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: (u: User) => void;
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '');
  const [role, setRole] = useState<User['role']>(user.role);
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminService.updateUser(user.id, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        role,
      });
      toast.success('User updated');
      onSaved(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit user — {user.email}</h2>
        </div>
        <form onSubmit={save}>
          <div className="modal-body">
            <div className="field">
              <label>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} maxLength={100} />
            </div>
            <div className="field">
              <label>Phone number</label>
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} maxLength={20} placeholder="optional" />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as User['role'])}>
                <option value="USER">User</option>
                <option value="HOST">Host</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose} disabled={saving}>
              <X size={14} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : null}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Users;
