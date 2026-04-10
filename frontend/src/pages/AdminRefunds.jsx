import { useState, useEffect } from 'react';
import { Check, X, Clock, DollarSign } from 'lucide-react';
import api from '../services/api';
import './AdminRefunds.css';

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refundStatus, setRefundStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, [page, statusFilter]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        ...(statusFilter && { status: statusFilter })
      });
      const data = await api.getAdminRefunds(query.toString());
      setRefunds(data.refunds);
      setPagination(data.pagination);
    } catch (err) {
      alert('Failed to fetch refunds: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (refund) => {
    setSelectedRefund(refund);
    setRefundStatus(refund.status);
    setNotes(refund.notes || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!refundStatus) {
      alert('Please select a status');
      return;
    }
    try {
      await api.updateAdminRefundStatus(selectedRefund._id, refundStatus, notes);
      alert('Refund status updated successfully');
      setShowModal(false);
      fetchRefunds();
    } catch (err) {
      alert('Failed to update refund: ' + err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Check size={18} className="status-icon approved" />;
      case 'rejected':
        return <X size={18} className="status-icon rejected" />;
      case 'completed':
        return <DollarSign size={18} className="status-icon completed" />;
      default:
        return <Clock size={18} className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4facfe';
      case 'rejected':
        return '#ff6b6b';
      case 'completed':
        return '#26de81';
      default:
        return '#ffa502';
    }
  };

  if (loading && refunds.length === 0) {
    return <div className="refunds-loading">Loading refunds...</div>;
  }

  return (
    <div className="refunds-container">
      <div className="refunds-header">
        <h2>Refund Management</h2>
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="refunds-table-wrapper">
        <table className="refunds-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Passenger</th>
              <th>Trip</th>
              <th>Refund Amount</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => (
              <tr key={refund._id}>
                <td className="booking-id">{refund.bookingId?._id?.toString().slice(-8) || 'N/A'}</td>
                <td>
                  <div className="passenger-info">
                    <p className="name">{refund.userId?.name || 'Unknown'}</p>
                    <p className="email">{refund.userId?.email || 'N/A'}</p>
                  </div>
                </td>
                <td className="trip-info">
                  {refund.tripId?.busNumber || 'N/A'}
                  <br />
                  <small>{refund.tripId?.from || ''} → {refund.tripId?.to || ''}</small>
                </td>
                <td className="amount">₹{refund.refundAmount?.toFixed(2) || '0.00'}</td>
                <td className="status-cell">
                  <div className="status-badge" style={{ borderColor: getStatusColor(refund.status) }}>
                    {getStatusIcon(refund.status)}
                    <span>{refund.status}</span>
                  </div>
                </td>
                <td className="reason">{refund.reason || 'N/A'}</td>
                <td className="date">{new Date(refund.createdAt).toLocaleDateString()}</td>
                <td className="action">
                  <button
                    onClick={() => openModal(refund)}
                    className="btn-update"
                    disabled={refund.status === 'completed'}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {refunds.length === 0 && (
          <div className="no-data">No refunds found</div>
        )}
      </div>

      {/* Pagination */}
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

      {/* Update Modal */}
      {showModal && selectedRefund && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Refund Status</h3>
            <div className="modal-body">
              <p>
                <strong>Passenger:</strong> {selectedRefund.userId?.name}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedRefund.refundAmount?.toFixed(2)}
              </p>
              <p>
                <strong>Reason:</strong> {selectedRefund.reason}
              </p>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={refundStatus}
                  onChange={(e) => setRefundStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add processing notes..."
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="btn-submit"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
