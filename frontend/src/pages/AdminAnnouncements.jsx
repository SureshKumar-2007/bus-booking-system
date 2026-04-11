import { useState, useEffect } from 'react';
import { AlertCircle, MessageCircle, Plus, Trash2, Info } from 'lucide-react';
import api from '../services/api';
import './AdminAnnouncements.css';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    expiresAt: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAnnouncements(`page=${page}`);
      setAnnouncements(data.announcements);
      setPagination(data.pagination);
    } catch (err) {
      alert('Failed to fetch announcements: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      alert('Title and message are required');
      return;
    }

    try {
      await api.createAdminAnnouncement(formData);
      alert('Announcement created successfully!');
      setFormData({ title: '', message: '', type: 'info', expiresAt: '' });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to create announcement: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.deleteAdminAnnouncement(id);
      alert('Announcement deleted successfully!');
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement: ' + err.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={20} />;
      case 'success':
        return <MessageCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning':
        return '#ff9f43';
      case 'success':
        return '#26de81';
      default:
        return '#4facfe';
    }
  };

  if (loading && announcements.length === 0) {
    return <div className="announcements-loading">Loading announcements...</div>;
  }

  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <div>
          <h2>Announcements</h2>
          <p>Post announcements visible to all users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-create"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Server Maintenance"
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter announcement message..."
                rows={5}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">
              Create Announcement
            </button>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="no-announcements">
            <MessageCircle size={40} />
            <p>No announcements yet. Create one to get started!</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="announcement-card"
              style={{ '--type-color': getTypeColor(announcement.type) }}
            >
              <div className="announcement-icon" style={{ color: getTypeColor(announcement.type) }}>
                {getTypeIcon(announcement.type)}
              </div>

              <div className="announcement-content">
                <div className="announcement-header">
                  <h3>{announcement.title}</h3>
                  <span className="announcement-type">{announcement.type}</span>
                </div>

                <p className="announcement-message">{announcement.message}</p>

                <div className="announcement-meta">
                  <span className="meta-item">
                    By: {announcement.createdBy?.email}
                  </span>
                  <span className="meta-item">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                  {announcement.expiresAt && (
                    <span className="meta-item">
                      Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(announcement._id)}
                className="btn-delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-pagination"
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.currentPage} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="btn-pagination"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
