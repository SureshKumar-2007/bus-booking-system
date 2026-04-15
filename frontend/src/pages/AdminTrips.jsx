import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Search, Plus, Trash2, Edit2 } from 'lucide-react';
import './AdminTrips.css';

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('admin_token');

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAdminTrips({ page: currentPage, search });
      setTrips(data.trips);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load trips');
      console.error('Trips fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchTrips();
  }, [adminToken, navigate, fetchTrips]);

  const handleDelete = async (tripId) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await api.deleteAdminTrip(tripId);
      fetchTrips();
    } catch {
      setError('Failed to delete trip');
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="admin-trips">
        <div className="loading">Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="admin-trips">
      <div className="page-header">
        <Link to="/admin/dashboard" className="back-link">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="header-title">
          <h1>Trip Management</h1>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add Trip
          </button>
        </div>
      </div>

      <div className="search-section">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search by route or bus number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {error && <div className="error">{error}</div>}

      <div className="trips-table-container">
        {trips.length > 0 ? (
          <table className="trips-table">
            <thead>
              <tr>
                <th>Bus Number</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Price</th>
                <th>Seats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id}>
                  <td className="bus-number">{trip.busNumber}</td>
                  <td>{trip.from} → {trip.to}</td>
                  <td>{trip.departure}</td>
                  <td>₹{trip.price}</td>
                  <td>{trip.availableSeats}/{trip.seats}</td>
                  <td>
                    <div className="action-buttons">
                        <button
                            className="edit-btn"
                            onClick={() => setEditingTrip(trip)}
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            className="delete-btn"
                            onClick={() => handleDelete(trip._id)}
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
          <div className="no-data">No trips found</div>
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

      {(showAddModal || editingTrip) && (
        <TripModal
          trip={editingTrip}
          onClose={() => {
            setShowAddModal(false);
            setEditingTrip(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingTrip(null);
            fetchTrips();
          }}
        />
      )}
    </div>
  );
};

const TripModal = ({ trip, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    busNumber: trip?.busNumber || '',
    from: trip?.from || '',
    to: trip?.to || '',
    departureTime: trip?.departureTime ? new Date(trip.departureTime).toISOString().slice(0, 16) : '',
    arrivalTime: trip?.arrivalTime ? new Date(trip.arrivalTime).toISOString().slice(0, 16) : '',
    price: trip?.price || '',
    totalSeats: trip?.seats || 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (trip) {
        await api.updateAdminTrip(trip._id, formData);
      } else {
        await api.createAdminTrip(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{trip ? 'Edit Trip' : 'Add New Trip'}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>

        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label>Bus Number</label>
            <input
                type="text"
                placeholder="Bus Number"
                value={formData.busNumber}
                onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
                required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
                <label>From</label>
                <input
                    type="text"
                    placeholder="From City"
                    value={formData.from}
                    onChange={(e) => setFormData({...formData, from: e.target.value})}
                    required
                />
            </div>
            <div className="form-group">
                <label>To</label>
                <input
                    type="text"
                    placeholder="To City"
                    value={formData.to}
                    onChange={(e) => setFormData({...formData, to: e.target.value})}
                    required
                />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Departure Time</label>
                <input
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                    required
                />
            </div>
            <div className="form-group">
                <label>Arrival Time</label>
                <input
                    type="datetime-local"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                    required
                />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Price (₹)</label>
                <input
                    type="number"
                    placeholder="Trip Price"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                />
            </div>
            <div className="form-group">
                <label>Total Seats</label>
                <input
                    type="number"
                    placeholder="Capacity"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                    required
                />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="submit-btn" style={{ background: '#3498db' }}>
              {loading ? 'Saving...' : (trip ? 'Update Trip' : 'Create Trip')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTrips;

