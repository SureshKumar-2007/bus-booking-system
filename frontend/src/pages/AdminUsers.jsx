import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Search } from 'lucide-react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [adminToken, currentPage, search, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers({ page: currentPage, search });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-users">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="page-header">
        <Link to="/admin/dashboard" className="back-link">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <h1>User Management</h1>
      </div>

      <div className="search-section">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {error && <div className="error">{error}</div>}

      <div className="users-table-container">
        {users.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No users found</div>
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

export default AdminUsers;
