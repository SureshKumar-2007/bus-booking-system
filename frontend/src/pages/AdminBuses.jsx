import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Search, Plus, Trash2, Edit2, ShieldCheck, ShieldAlert } from 'lucide-react';
import './AdminBuses.css';

const AdminBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('admin_token');

  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAdminBuses({ page: currentPage, search });
      setBuses(data.buses);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load buses');
      console.error('Buses fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchBuses();
  }, [adminToken, navigate, fetchBuses]);

  const handleDelete = async (busId) => {
    if (!window.confirm('Delete this bus? This will remove it from the fleet.')) return;
    try {
      await api.deleteAdminBus(busId);
      fetchBuses();
    } catch (err) {
      setError(err.message || 'Failed to delete bus');
    }
  };

  const handleToggleStatus = async (bus) => {
    try {
        await api.updateAdminBus(bus._id, { isActive: !bus.isActive });
        fetchBuses();
    } catch (err) {
        setError(err.message || 'Failed to update bus status');
    }
  };

  if (loading && buses.length === 0) {
    return (
      <div className="admin-buses">
        <div className="loading">Loading fleet...</div>
      </div>
    );
  }

  return (
    <div className="admin-buses">
      <div className="page-header">
        <Link to="/admin/dashboard" className="back-link">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="header-title">
          <h1>Fleet Management</h1>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add Bus
          </button>
        </div>
      </div>

      <div className="search-section">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search by bus number or operator..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="buses-table-container">
        {buses.length > 0 ? (
          <table className="buses-table">
            <thead>
              <tr>
                <th>Bus Number</th>
                <th>Operator</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Amenities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus._id} className={!bus.isActive ? 'inactive-row' : ''}>
                  <td className="bus-number">{bus.busNumber}</td>
                  <td>{bus.operator}</td>
                  <td><span className="type-badge">{bus.type}</span></td>
                  <td>{bus.capacity} Seats</td>
                  <td>
                    <div className="amenities-list">
                      {bus.amenities?.slice(0, 2).map((a, i) => (
                        <span key={i} className="amenity-tag">{a}</span>
                      ))}
                      {bus.amenities?.length > 2 && <span className="more-tag">+{bus.amenities.length - 2}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${bus.isActive ? 'active' : 'inactive'}`}>
                      {bus.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                        <button 
                            className="icon-btn edit" 
                            onClick={() => setEditingBus(bus)}
                            title="Edit Bus"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button 
                            className={`icon-btn ${bus.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleStatus(bus)}
                            title={bus.isActive ? 'Deactivate Bus' : 'Activate Bus'}
                        >
                            {bus.isActive ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                        </button>
                        <button
                            className="icon-btn delete"
                            onClick={() => handleDelete(bus._id)}
                            title="Delete Bus"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No buses found in fleet</div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={page === currentPage ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {(showAddModal || editingBus) && (
        <BusModal
          bus={editingBus}
          onClose={() => {
            setShowAddModal(false);
            setEditingBus(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingBus(null);
            fetchBuses();
          }}
        />
      )}
    </div>
  );
};

const BusModal = ({ bus, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    busNumber: bus?.busNumber || '',
    operator: bus?.operator || '',
    type: bus?.type || 'AC Sleeper',
    capacity: bus?.capacity || 40,
    amenities: bus?.amenities?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (bus) {
        await api.updateAdminBus(bus._id, payload);
      } else {
        await api.createAdminBus(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save bus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{bus ? 'Edit Bus' : 'Add New Bus'}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-panel">{error}</div>}

          <div className="form-group">
            <label>Bus Number</label>
            <input
              type="text"
              placeholder="e.g. MH 01 AB 1234"
              value={formData.busNumber}
              onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Operator Name</label>
            <input
              type="text"
              placeholder="e.g. Zingbus"
              value={formData.operator}
              onChange={(e) => setFormData({...formData, operator: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Bus Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="AC Sleeper">AC Sleeper</option>
              <option value="AC Semi-Sleeper">AC Semi-Sleeper</option>
              <option value="Non-AC Sleeper">Non-AC Sleeper</option>
              <option value="Volvo Multi-Axle">Volvo Multi-Axle</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Capacity</label>
                <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                required
                />
            </div>
          </div>

          <div className="form-group">
            <label>Amenities (comma separated)</label>
            <input
              type="text"
              placeholder="WiFi, Water, Blanket..."
              value={formData.amenities}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (bus ? 'Update Bus' : 'Add Bus')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBuses;
