import { useState, useEffect } from 'react';
import { Activity, UserCheck, Trash2, Edit, PlusCircle } from 'lucide-react';
import api from '../services/api';
import './AdminActivityLogs.css';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        ...(actionFilter && { action: actionFilter })
      });
      const data = await api.getAdminActivityLogs(query.toString());
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      alert('Failed to fetch activity logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE_TRIP':
      case 'CREATE_ANNOUNCEMENT':
        return <PlusCircle size={18} className="action-icon create" />;
      case 'UPDATE_TRIP':
      case 'UPDATE_REFUND_STATUS':
      case 'UPDATE_BOOKING_STATUS':
        return <Edit size={18} className="action-icon update" />;
      case 'DELETE_TRIP':
      case 'DELETE_BOOKING':
      case 'DELETE_ANNOUNCEMENT':
        return <Trash2 size={18} className="action-icon delete" />;
      case 'LOGIN':
        return <UserCheck size={18} className="action-icon login" />;
      default:
        return <Activity size={18} className="action-icon" />;
    }
  };

  const getActionColor = (action) => {
    if (action.startsWith('CREATE')) return '#26de81';
    if (action.startsWith('UPDATE')) return '#4facfe';
    if (action.startsWith('DELETE')) return '#ff6b6b';
    return '#667eea';
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (loading && logs.length === 0) {
    return <div className="logs-loading">Loading activity logs...</div>;
  }

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h2>Admin Activity Log</h2>
        <p>Track all administrative operations</p>
      </div>

      <div className="logs-filter">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="action-select"
        >
          <option value="">All Actions</option>
          {uniqueActions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
      </div>

      <div className="logs-list">
        {logs.length === 0 ? (
          <div className="no-logs">No activity logs found</div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="log-item">
              <div className="log-icon" style={{ color: getActionColor(log.action) }}>
                {getActionIcon(log.action)}
              </div>

              <div className="log-details">
                <div className="log-header">
                  <h4 className="log-action">{log.action}</h4>
                  <span className="log-time">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="log-admin">
                  <strong>Admin:</strong> {log.adminEmail}
                </p>

                {log.description && (
                  <p className="log-description">{log.description}</p>
                )}

                <div className="log-meta">
                  {log.resourceType && (
                    <span className="meta-item">
                      <strong>Resource:</strong> {log.resourceType}
                    </span>
                  )}
                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <span className="meta-item">
                      <strong>Changes:</strong> {Object.keys(log.changes).join(', ')}
                    </span>
                  )}
                </div>
              </div>
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

      {/* Stats */}
      <div className="logs-stats">
        <div className="stat-card">
          <span className="stat-label">Total Logs</span>
          <span className="stat-value">{pagination.total}</span>
        </div>
        <div className="stat-card create">
          <span className="stat-label">Create Operations</span>
          <span className="stat-value">
            {logs.filter(l => l.action.startsWith('CREATE')).length}
          </span>
        </div>
        <div className="stat-card update">
          <span className="stat-label">Update Operations</span>
          <span className="stat-value">
            {logs.filter(l => l.action.startsWith('UPDATE')).length}
          </span>
        </div>
        <div className="stat-card delete">
          <span className="stat-label">Delete Operations</span>
          <span className="stat-value">
            {logs.filter(l => l.action.startsWith('DELETE')).length}
          </span>
        </div>
      </div>
    </div>
  );
}
