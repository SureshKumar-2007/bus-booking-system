import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Bus, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { signup, login } from '../services/api.js';
import { useAppContext } from '../context/AppContext.jsx';
import './Login.css';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: storeLogin } = useAppContext();
  const isSignUp = searchParams.get('signup') === 'true';
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      if (isSignUp) {
        payload.name = formData.name;
      }

      const response = isSignUp ? await signup(payload) : await login(payload);
      storeLogin(response.user, response.token);
      
      if (response.user?.role === 'admin') {
        localStorage.setItem('admin_token', response.token);
        localStorage.setItem('admin_user', JSON.stringify(response.user));
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-container glass-panel">
        <div className="auth-image-side">
          <div className="auth-overlay">
            <Link to="/" className="auth-logo">
              <Bus size={32} />
              <span>GoBus</span>
            </Link>
            <div className="auth-quote">
              <h2>{isSignUp ? 'Join our community of travelers.' : 'Welcome back!'}</h2>
              <p>Discover the world with comfort and safety.</p>
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <h2 className="auth-title">{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
            <p className="auth-subtitle">
              {isSignUp ? 'Please enter your details to sign up.' : 'Please enter your details to sign in.'}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Suresh kumar"
                      value={formData.name}
                      onChange={handleChange('name')}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="sureshkumar@example.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                  />
                </div>
              </div>

              {!isSignUp && (
                <div className="forgot-password">
                  <a href="#">Forgot password?</a>
                </div>
              )}

              <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>

              {error && <p className="auth-error">{error}</p>}
            </form>

            <div className="auth-switch">
              {isSignUp ? (
                <p>Already have an account? <Link to="/login">Sign In</Link></p>
              ) : (
                <p>Don't have an account? <Link to="/login?signup=true">Sign Up</Link></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
