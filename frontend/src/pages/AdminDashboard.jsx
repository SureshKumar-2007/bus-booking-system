import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Users, Bus, BookOpen, TrendingUp, LogOut, BarChart3, DollarSign, FileText, Activity, MessageSquare } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [adminToken, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminDashboard();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('gobus_app_state');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p>Welcome back!</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> Logout
        </button>
      </header>

      {/* Navigation Menu */}
      <nav className="admin-nav">
        <Link to="/admin/dashboard" className="nav-item active">
          Dashboard
        </Link>
        <Link to="/admin/users" className="nav-item">
          Users
        </Link>
        <Link to="/admin/trips" className="nav-item">
          Trips
        </Link>
        <Link to="/admin/bookings" className="nav-item">
          Bookings
        </Link>
        <Link to="/admin/analytics" className="nav-item" title="Advanced Analytics">
          <BarChart3 size={18} /> Analytics
        </Link>
        <Link to="/admin/refunds" className="nav-item" title="Refund Management">
          <DollarSign size={18} /> Refunds
        </Link>
        <Link to="/admin/reports" className="nav-item" title="Export Reports">
          <FileText size={18} /> Reports
        </Link>
        <Link to="/admin/activity-logs" className="nav-item" title="Activity Logs">
          <Activity size={18} /> Logs
        </Link>
        <Link to="/admin/announcements" className="nav-item" title="Announcements">
          <MessageSquare size={18} /> Announcements
        </Link>
      </nav>

      {/* Stats Cards */}
      <section className="stats-section">
        <StatCard
          icon={<Users size={24} />}
          title="Total Users"
          value={dashboardData?.stats.totalUsers || 0}
          color="#3498db"
        />
        <StatCard
          icon={<Bus size={24} />}
          title="Total Trips"
          value={dashboardData?.stats.totalTrips || 0}
          color="#27ae60"
        />
        <StatCard
          icon={<BookOpen size={24} />}
          title="Total Bookings"
          value={dashboardData?.stats.totalBookings || 0}
          color="#e74c3c"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title="Total Revenue"
          value={`₹${dashboardData?.stats.totalRevenue || 0}`}
          color="#f39c12"
        />
      </section>

      {/* Recent Bookings */}
      <section className="recent-section">
        <h2>Recent Bookings</h2>
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Passenger</th>
                <th>Route</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentBookings?.length > 0 ? (
                dashboardData.recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="booking-id">{booking.bookingId}</td>
                    <td>
                      <div>
                        <p className="passenger-name">{booking.passengerName}</p>
                        <p className="passenger-email">{booking.passengerEmail}</p>
                      </div>
                    </td>
                    <td>{booking.route}</td>
                    <td>₹{booking.totalAmount}</td>
                    <td>
                      <span className={`status ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
