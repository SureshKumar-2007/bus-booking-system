import { Link, useLocation } from 'react-router-dom';
import { Bus, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAppContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled glass-panel' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo text-gradient">
          <Bus size={28} />
          <span>GoBus</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="navbar-links desktop-only">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About Us</Link>
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>Admin Panel</Link>
          )}
        </nav>

        <div className="navbar-actions desktop-only">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name}</span>
              <button className="btn btn-outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Sign In</Link>
              <Link to="/login?signup=true" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle mobile-only" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu animate-fade-in">
          <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/about" className="mobile-link" onClick={() => setIsMenuOpen(false)}>About Us</Link>
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
          )}
          {user ? (
            <button className="mobile-link btn btn-outline" onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              <Link to="/login?signup=true" className="mobile-link btn btn-primary" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
