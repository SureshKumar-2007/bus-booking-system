import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, MapPin } from 'lucide-react';
import api from '../services/api';
import './AdminAnalytics.css';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      const data = await api.getAdminAnalytics(query.toString());
      setAnalytics(data);
    } catch (err) {
      alert('Failed to fetch analytics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAnalytics();
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

  if (loading) return <div className="analytics-loading">Loading analytics...</div>;
  if (!analytics) return <div className="analytics-loading">No data available</div>;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Advanced Analytics</h2>
        <div className="filter-section">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
          />
          <button onClick={handleFilter} className="btn-filter">
            <TrendingUp size={18} /> Filter
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: '#667eea' }}>
            <DollarSign />
          </div>
          <div className="kpi-content">
            <h3>Total Bookings</h3>
            <p className="kpi-value">{analytics.totalBookings}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: '#4facfe' }}>
            <AlertCircle />
          </div>
          <div className="kpi-content">
            <h3>Cancellation Rate</h3>
            <p className="kpi-value">{analytics.cancellationRate}%</p>
            <p className="kpi-subtext">({analytics.cancelledBookings} cancelled)</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ color: '#f093fb' }}>
            <MapPin />
          </div>
          <div className="kpi-content">
            <h3>Top Routes</h3>
            <p className="kpi-value">{analytics.topRoutes.length}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Booking Trends */}
        {analytics.bookingTrends && analytics.bookingTrends.length > 0 && (
          <div className="chart-box">
            <h3>Booking Trends (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#667eea"
                  name="Bookings"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#764ba2"
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by Route */}
        {analytics.revenueByRoute && analytics.revenueByRoute.length > 0 && (
          <div className="chart-box">
            <h3>Top 10 Routes by Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueByRoute}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#667eea" name="Revenue (₹)" />
                <Bar dataKey="bookingCount" fill="#4facfe" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Breakdown */}
        {analytics.statusBreakdown && analytics.statusBreakdown.length > 0 && (
          <div className="chart-box">
            <h3>Booking Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusBreakdown}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analytics.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Routes */}
        {analytics.topRoutes && analytics.topRoutes.length > 0 && (
          <div className="chart-box">
            <h3>Top 5 Most Booked Routes</h3>
            <div className="routes-list">
              {analytics.topRoutes.map((route, idx) => (
                <div key={idx} className="route-item">
                  <span className="route-rank">#{idx + 1}</span>
                  <span className="route-name">{route._id}</span>
                  <span className="route-bookings">{route.bookings} bookings</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
