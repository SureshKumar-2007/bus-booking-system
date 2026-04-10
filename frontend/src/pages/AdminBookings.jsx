import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Search, Trash2 } from 'lucide-react';
import './AdminBookings.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchBookings();
  }, [adminToken, currentPage, search, statusFilter, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminBookings({ page: currentPage, search, status: statusFilter });
      setBookings(data.bookings);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Bookings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.updateAdminBookingStatus(bookingId, { status: newStatus });
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await api.deleteAdminBooking(bookingId);
      fetchBookings();
    } catch (err) {
      setError('Failed to delete booking');
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="admin-bookings">
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="admin-bookings">
      <div className="page-header">
        <Link to="/admin/dashboard" className="back-link">
          <ArrowLeft size={20} /> Back
        </Link>
        <h1>Booking Management</h1>
      </div>

      <div className="filter-section">
        <div className="search-section">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="status-filter"
        >
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="bookings-table-container">
        {bookings.length > 0 ? (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Passenger</th>
                <th>Route</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="booking-id">{booking.bookingId}</td>
                  <td>
                    <div>
                      <p className="passenger-name">{booking.passengerName}</p>
                      <p className="passenger-email">{booking.passengerEmail}</p>
                    </div>
                  </td>
                  <td>{booking.from} → {booking.to}</td>
                  <td>₹{booking.totalAmount}</td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className={`status-select status-${booking.status}`}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(booking._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No bookings found</div>
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
    </div>
  );
};

export default AdminBookings;
