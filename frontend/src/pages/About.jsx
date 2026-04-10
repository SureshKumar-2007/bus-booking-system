import { CheckCircle2, Users, Bus, Globe } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page animate-fade-in">
      <section className="about-hero">
        <div className="container about-hero-content">
          <h1 className="hero-title">About GoBus</h1>
          <p className="hero-subtitle">Connecting people and places with comfort, safety, and affordability since 2010.</p>
        </div>
      </section>

      <section className="mission-section">
        <div className="container mission-container">
          <div className="mission-content">
            <h2 className="section-title" style={{textAlign: 'left', marginBottom: '1rem'}}>Our Mission</h2>
            <p className="mission-text">
              At GoBus, our mission is to revolutionize the way people travel by bus. We believe that booking a ticket should be as simple as sending a text message, and the travel experience should be comfortable and memorable.
            </p>
            <p className="mission-text">
              We partner with the best operators across the country to ensure that every journey you take with us is safe, reliable, and equipped with modern amenities.
            </p>
            <ul className="mission-list">
              <li><CheckCircle2 className="text-primary" size={20} /> Customer-first approach</li>
              <li><CheckCircle2 className="text-primary" size={20} /> Trusted transport partners</li>
              <li><CheckCircle2 className="text-primary" size={20} /> Simple and transparent pricing</li>
            </ul>
          </div>
          <div className="mission-image"></div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <Users size={40} className="stat-icon mx-auto" style={{ marginInline: 'auto' }} />
              <h3>10M+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-card">
              <Bus size={40} className="stat-icon mx-auto" style={{ marginInline: 'auto' }} />
              <h3>5,000+</h3>
              <p>Bus Routes</p>
            </div>
            <div className="stat-card">
              <Globe size={40} className="stat-icon mx-auto" style={{ marginInline: 'auto' }} />
              <h3>200+</h3>
              <p>Cities Covered</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
