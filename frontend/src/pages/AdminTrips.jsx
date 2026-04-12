import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Search, Plus, Trash2 } from 'lucide-react';
import './AdminTrips.css';

const AdminTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
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
                <th>Action</th>
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
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(trip._id)}
                    >
                      <Trash2 size={16} />
                    </button>
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

      {showAddModal && (
        <AddTripModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTrips();
          }}
        />
      )}
    </div>
  );
};

const AddTripModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    busNumber: '',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createAdminTrip(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Trip</h2>
        <button className="close-btn" onClick={onClose}>✕</button>

        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}

          <input
            type="text"
            placeholder="Bus Number"
            value={formData.busNumber}
            onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="From"
            value={formData.from}
            onChange={(e) => setFormData({...formData, from: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="To"
            value={formData.to}
            onChange={(e) => setFormData({...formData, to: e.target.value})}
            required
          />
          <input
            type="datetime-local"
            value={formData.departureTime}
            onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
            required
          />
          <input
            type="datetime-local"
            value={formData.arrivalTime}
            onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Total Seats"
            value={formData.totalSeats}
            onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
            required
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTrips;
