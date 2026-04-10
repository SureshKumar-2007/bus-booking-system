import { Link } from 'react-router-dom';
import { Bus, Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo text-gradient">
            <Bus size={24} />
            <span>GoBus</span>
          </Link>
          <p className="footer-description">
            Your most trusted partner for bus ticket bookings. We make your journey comfortable and safe.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><Facebook size={20} /></a>
            <a href="#" className="social-icon"><Twitter size={20} /></a>
            <a href="#" className="social-icon"><Instagram size={20} /></a>
          </div>
        </div>
        
        <div className="footer-links-group">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/">Popular Routes</Link></li>
            <li><Link to="/">Offers</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-title">Support</h4>
          <ul className="footer-links">
            <li><Link to="/">FAQ</Link></li>
            <li><Link to="/">Terms & Conditions</Link></li>
            <li><Link to="/">Privacy Policy</Link></li>
            <li><Link to="/">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4 className="footer-title">Contact</h4>
          <p className="contact-item">
            <Mail size={16} /> support@gobus.com
          </p>
          <p className="contact-item">
            1-800-123-4567
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} GoBus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
