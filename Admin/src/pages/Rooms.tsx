import { useEffect, useRef, useState } from 'react';
import { Search, RefreshCcw, Loader2, CheckCircle2, XCircle, Pencil, X, Trash2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, type Room, type RoomImage } from '../services/admin.service';
import './pages.css';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const statusBadge = (s: Room['status']) => {
  if (s === 'APPROVED') return 'badge badge-approved';
  if (s === 'REJECTED') return 'badge badge-rejected';
  return 'badge badge-pending';
};

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const Rooms = () => {
  const [rows, setRows] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [editing, setEditing] = useState<Room | null>(null);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await adminService.searchRooms(
          search.trim(),
          status === 'ALL' ? undefined : status,
        );
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) toast.error('Failed to load rooms');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, status]);

  const refresh = () => {
    setSearch((q) => q);
    // Trigger reload by forcing a status set; cheaper: just call search again.
    (async () => {
      setLoading(true);
      try {
        const data = await adminService.searchRooms(
          search.trim(),
          status === 'ALL' ? undefined : status,
        );
        setRows(data);
      } catch {
        toast.error('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    })();
  };

  const approve = async (r: Room) => {
    try {
      await adminService.approveRoom(r.id);
      toast.success(`Approved "${r.title}"`);
      refresh();
    } catch {
      toast.error('Failed to approve room');
    }
  };

  const reject = async (r: Room) => {
    try {
      await adminService.rejectRoom(r.id);
      toast.success(`Rejected "${r.title}"`);
      refresh();
    } catch {
      toast.error('Failed to reject room');
    }
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <h1>Room Management</h1>
          <p>Approve, reject, and edit property listings. Search is powered by Meilisearch.</p>
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
                placeholder="Search title, city, host, address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="cell-muted">{rows.length} result{rows.length === 1 ? '' : 's'}</div>
        </div>

        {loading ? (
          <div className="loading-row">
            <Loader2 size={16} className="spin" /> Loading rooms…
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-state">No rooms match these filters.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Host</th>
                <th>Location</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-stack">
                      <strong>{r.title}</strong>
                      <span className="cell-muted">ID: {r.id.substring(0, 8)}…</span>
                    </div>
                  </td>
                  <td>{r.host?.fullName ?? <span className="cell-muted">—</span>}</td>
                  <td>{r.city}</td>
                  <td>{usd(Number(r.pricePerNight))} <span className="cell-muted">/ night</span></td>
                  <td><span className={statusBadge(r.status)}>{r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button className="btn" onClick={() => setEditing(r)}>
                        <Pencil size={14} /> Edit
                      </button>
                      {r.status !== 'APPROVED' && (
                        <button className="btn btn-success" onClick={() => approve(r)}>
                          <CheckCircle2 size={14} /> Approve
                        </button>
                      )}
                      {r.status !== 'REJECTED' && (
                        <button className="btn btn-danger" onClick={() => reject(r)}>
                          <XCircle size={14} /> Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <EditRoomModal
          room={editing}
          onClose={() => setEditing(null)}
          onSaved={(u) => {
            setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, ...u } : r)));
            setEditing(null);
          }}
        />
      )}
    </section>
  );
};

const EditRoomModal = ({
  room,
  onClose,
  onSaved,
}: {
  room: Room;
  onClose: () => void;
  onSaved: (r: Room) => void;
}) => {
  const [title, setTitle] = useState(room.title);
  const [description, setDescription] = useState(room.description ?? '');
  const [address, setAddress] = useState(room.address);
  const [city, setCity] = useState(room.city);
  const [pricePerNight, setPricePerNight] = useState(Number(room.pricePerNight));
  const [maxGuests, setMaxGuests] = useState(room.maxGuests);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<RoomImage[]>(room.images ?? []);
  const [imgBusy, setImgBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (room.images) return;
    let cancelled = false;
    (async () => {
      try {
        const full = await adminService.getRoom(room.id);
        if (!cancelled) setImages(full.images ?? []);
      } catch {
        if (!cancelled) toast.error('Failed to load images');
      }
    })();
    return () => { cancelled = true; };
  }, [room.id, room.images]);

  const readFilesAsBase64 = (files: FileList): Promise<string[]> =>
    Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImgBusy(true);
    try {
      const base64s = await readFilesAsBase64(files);
      const created = await adminService.addRoomImages(room.id, base64s);
      setImages((prev) => [...prev, ...created]);
      toast.success(`Added ${created.length} image${created.length === 1 ? '' : 's'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to upload images');
    } finally {
      setImgBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onRemoveImage = async (image: RoomImage) => {
    if (!window.confirm('Remove this image?')) return;
    setImgBusy(true);
    try {
      await adminService.removeRoomImage(room.id, image.id);
      setImages((prev) => prev.filter((i) => i.id !== image.id));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to remove image');
    } finally {
      setImgBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminService.updateRoom(room.id, {
        title: title.trim(),
        description: description.trim() || null,
        address: address.trim(),
        city: city.trim(),
        pricePerNight,
        maxGuests,
      });
      toast.success('Room updated');
      onSaved(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to update room');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal fade-in" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit room — {room.title}</h2>
        </div>
        <form onSubmit={save}>
          <div className="modal-body">
            <div className="field">
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label>Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="field">
                <label>Max guests</label>
                <input type="number" min={1} value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))} required />
              </div>
            </div>
            <div className="field">
              <label>Price per night (USD)</label>
              <input type="number" min={0} step="0.01" value={pricePerNight} onChange={(e) => setPricePerNight(Number(e.target.value))} required />
            </div>

            <div className="field">
              <label>Images ({images.length})</label>
              <div className="image-grid">
                {images.map((img) => (
                  <div key={img.id} className="image-tile">
                    <img src={img.imageUrl} alt="" />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => onRemoveImage(img)}
                      disabled={imgBusy}
                      aria-label="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <label className={`image-upload ${imgBusy ? 'is-busy' : ''}`}>
                  {imgBusy ? <Loader2 size={20} className="spin" /> : <ImagePlus size={20} />}
                  <span>{imgBusy ? 'Working…' : 'Upload'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onUpload}
                    disabled={imgBusy}
                    hidden
                  />
                </label>
              </div>
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

export default Rooms;
