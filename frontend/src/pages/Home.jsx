import { MapPin, Calendar, Users, Search, Shield, Clock, Award } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1 Passenger'
  });

  const handleSearch = () => {
    if (!searchData.from || !searchData.to) {
      alert("Please enter both 'From' and 'To' locations to search.");
      return;
    }
    navigate(`/search?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`);
  };
  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title">Your Journey Starts Here</h1>
          <p className="hero-subtitle">Book bus tickets easily, quickly, and securely to over 5,000 destinations.</p>
          
          <div className="search-widget glass-panel">
            <div className="search-grid">
              <div className="input-group">
                <label className="input-label"><MapPin size={16} /> From</label>
                <input type="text" className="input-field" placeholder="Leaving from..." value={searchData.from} onChange={(e) => setSearchData({...searchData, from: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label"><MapPin size={16} /> To</label>
                <input type="text" className="input-field" placeholder="Going to..." value={searchData.to} onChange={(e) => setSearchData({...searchData, to: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label"><Calendar size={16} /> Date</label>
                <input type="date" className="input-field" value={searchData.date} onChange={(e) => setSearchData({...searchData, date: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label"><Users size={16} /> Passengers</label>
                <select className="input-field" value={searchData.passengers} onChange={(e) => setSearchData({...searchData, passengers: e.target.value})}>
                  <option>1 Passenger</option>
                  <option>2 Passengers</option>
                  <option>3 Passengers</option>
                  <option>4+ Passengers</option>
                </select>
              </div>
              <div className="search-button-container">
                <button className="btn btn-primary search-btn" onClick={handleSearch}>
                  <Search size={20} /> Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="popular-routes">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Routes</h2>
            <p className="section-subtitle">Discover our most traveled destinations</p>
          </div>
          
          <div className="routes-grid">
            {[
              { id: '1', from: 'Mumbai', to: 'Pune', price: '₹450', img: '/images/mumbai.png' },
              { id: '2', from: 'Delhi', to: 'Jaipur', price: '₹600', img: '/images/jaipur.png' },
              { id: '3', from: 'Bangalore', to: 'Chennai', price: '₹850', img: '/images/chennai.png' },
              { id: '4', from: 'Hyderabad', to: 'Vijayawada', price: '₹500', img: '/images/hyderabad.png' }
            ].map((route, i) => (
              <div className="route-card" key={i} onClick={() => navigate(`/trip/${route.id}`)} style={{ cursor: 'pointer' }}>
                <div className="route-img" style={{ backgroundImage: `url(${route.img})` }}></div>
                <div className="route-info">
                  <div className="route-locations">
                    <span className="location">{route.from}</span>
                    <span className="arrow">→</span>
                    <span className="location">{route.to}</span>
                  </div>
                  <div className="route-price-row">
                    <span className="price-label">Starting from</span>
                    <span className="price">{route.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose GoBus?</h2>
            <p className="section-subtitle">We provide the best booking experience</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Shield size={32} /></div>
              <h3>Secure Booking</h3>
              <p>Your payment information is encrypted and completely secure with us.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Clock size={32} /></div>
              <h3>24/7 Support</h3>
              <p>Our dedicated customer service team is always available to help you via chat, phone, or email.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Award size={32} /></div>
              <h3>Best Prices</h3>
              <p>We guarantee the most competitive prices across all our exclusive bus routes and partners.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
