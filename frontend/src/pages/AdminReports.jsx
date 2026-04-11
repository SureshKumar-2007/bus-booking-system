import { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import './AdminReports.css';

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  const handleExportBookings = async () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before end date');
      return;
    }

    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      if (bookingStatus) query.append('status', bookingStatus);

      const response = await fetch(
        `/api/admin/reports/bookings?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookings-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Bookings exported successfully!');
    } catch (err) {
      alert('Failed to export bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reports/trips', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trips-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Trips exported successfully!');
    } catch (err) {
      alert('Failed to export trips: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reports & Export</h2>
        <p>Generate and download reports in CSV format</p>
      </div>

      <div className="reports-grid">
        {/* Bookings Report */}
        <div className="report-card">
          <div className="report-icon">
            <FileText size={40} />
          </div>
          <h3>Bookings Report</h3>
          <p className="report-desc">Export all bookings with filters</p>

          <div className="filter-form">
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={handleExportBookings}
              disabled={loading}
              className="btn-export"
            >
              <Download size={18} />
              {loading ? 'Exporting...' : 'Export Bookings'}
            </button>
          </div>
        </div>

        {/* Trips Report */}
        <div className="report-card">
          <div className="report-icon" style={{ color: '#4facfe' }}>
            <FileText size={40} />
          </div>
          <h3>Trips Report</h3>
          <p className="report-desc">Export all active trips</p>

          <div className="filter-form">
            <p className="info-text">
              This report includes all trips with current availability and pricing information.
            </p>

            <button
              onClick={handleExportTrips}
              disabled={loading}
              className="btn-export"
            >
              <Download size={18} />
              {loading ? 'Exporting...' : 'Export Trips'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Information */}
      <div className="report-info">
        <h3>Report Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Bookings Report Contains</h4>
            <ul>
              <li>Booking ID</li>
              <li>Passenger Name & Email</li>
              <li>Bus Number & Route</li>
              <li>Booking Amount</li>
              <li>Status</li>
              <li>Date</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>Trips Report Contains</h4>
            <ul>
              <li>Bus Number</li>
              <li>Route (From → To)</li>
              <li>Departure & Arrival Time</li>
              <li>Price & Total Seats</li>
              <li>Available Seats</li>
              <li>Operator</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="tips-section">
        <h3>📋 Tips for Reports</h3>
        <ul>
          <li>Reports are generated in CSV format for easy analysis in Excel/Google Sheets</li>
          <li>Date filters apply only to Bookings Report</li>
          <li>Use status filter to focus on specific booking types</li>
          <li>All reports include timestamp of generation</li>
          <li>No sensitive data like passwords is included</li>
        </ul>
      </div>
    </div>
  );
}
