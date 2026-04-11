import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Bus, Shield, Star } from 'lucide-react';
import { getTrip } from '../services/api.js';
import { useAppContext } from '../context/AppContext.jsx';
import './TripDetails.css';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedTripId } = useAppContext();
  const [tripInfo, setTripInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');

    if (!id) {
      setError('Trip not found.');
      setLoading(false);
      return;
    }

    getTrip(id)
      .then((payload) => {
        if (!active) return;
        setTripInfo(payload);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleSelectSeats = () => {
    setSelectedTripId(id);
    navigate(`/seats?tripId=${id}`);
  };

  if (loading) {
    return <div className="trip-details-page animate-fade-in"><div className="container"><p>Loading trip details...</p></div></div>;
  }

  if (error || !tripInfo) {
    return (
      <div className="trip-details-page animate-fade-in">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <p className="error-text">{error || 'Trip not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-details-page animate-fade-in">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back to Results
        </button>

        <div className="trip-header glass-panel">
          <div className="operator-info">
            <div className="operator-title-row">
              <h2 className="operator-name-lg">{tripInfo.operator}</h2>
              <div className="rating-badge-lg">
                <Star size={14} className="star-filled" /> {tripInfo.rating}
                <span className="review-count">({tripInfo.reviews})</span>
              </div>
            </div>
            <p className="bus-type-lg"><Bus size={18} /> {tripInfo.type} | {tripInfo.busNumber}</p>
          </div>
          <div className="trip-price-section">
            <span className="price-label">Starting from</span>
            <h3 className="price-lg">{tripInfo.price}</h3>
          </div>
        </div>

        <div className="trip-info-grid">
          <div className="trip-main-content">
            <section className="info-card">
              <h3 className="section-title"><Clock size={20} className="text-primary" /> Timings & Route Rotation</h3>
              <div className="timeline-container">
                <div className="timeline-point-row">
                  <div className="timeline-time">{tripInfo.departure}</div>
                  <div className="timeline-marker departure-marker"></div>
                  <div className="timeline-details">
                    <h4>Departure: {tripInfo.from}</h4>
                    <ul className="points-list">
                      {tripInfo.boardingPoints.map((pt, i) => <li key={`boarding-${i}`}>{pt}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="timeline-duration-row">
                  <div className="duration-spacer"></div>
                  <div className="timeline-line"></div>
                  <div className="duration-text">{tripInfo.duration}</div>
                </div>
                <div className="timeline-point-row">
                  <div className="timeline-time">{tripInfo.arrival}</div>
                  <div className="timeline-marker arrival-marker"></div>
                  <div className="timeline-details">
                    <h4>Arrival: {tripInfo.to}</h4>
                    <ul className="points-list">
                      {tripInfo.droppingPoints.map((pt, i) => <li key={`dropping-${i}`}>{pt}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="info-card">
              <h3 className="section-title"><Shield size={20} className="text-secondary" /> Policies & Information</h3>
              <ul className="policy-list">
                {tripInfo.policies.map((p, idx) => (
                  <li key={`policy-${idx}`}>{p}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="trip-sidebar">
            <section className="info-card">
              <h3 className="section-title">Amenities Included</h3>
              <div className="amenities-grid">
                {tripInfo.amenities.map((amenity, idx) => (
                  <div key={`amenity-${idx}`} className="amenity-item">
                    <span className="amenity-check">✓</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </section>

            <div className="booking-card glass-panel-accent">
              <h3 className="booking-title">Ready to Book?</h3>
              <p className="booking-desc">Secure your preferred seats before they fill up!</p>
              <button className="btn btn-primary book-now-btn" onClick={handleSelectSeats}>
                Select Seats Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
