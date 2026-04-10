import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTrip, createBooking } from '../services/api.js';
import { useAppContext } from '../context/AppContext.jsx';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedSeats, token, setBookingConfirmation } = useAppContext();
  const [trip, setTrip] = useState(null);
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [passenger, setPassenger] = useState({ name: '', age: '', gender: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const tripId = searchParams.get('tripId');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!tripId || selectedSeats.length === 0) {
      navigate('/seats');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    getTrip(tripId)
      .then((payload) => {
        if (!active) return;
        setTrip(payload);
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
  }, [navigate, token, tripId, selectedSeats]);

  const handleContactChange = (field) => (event) => {
    setContact((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePassengerChange = (field) => (event) => {
    setPassenger((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const effectivePrice = typeof trip?.rawPrice === 'number'
    ? trip.rawPrice
    : typeof trip?.price === 'string'
      ? Number(trip.price.replace(/[^0-9.-]+/g, ''))
      : trip?.price || 0;

  const handlePayment = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const bookingPayload = {
        tripId,
        seats: selectedSeats,
        contact: {
          email: contact.email,
          phone: contact.phone,
        },
        passengers: {
          count: selectedSeats.length,
          details: [{ ...passenger }],
        },
      };

      const response = await createBooking(bookingPayload, token);
      setBookingConfirmation(response.booking);
      navigate('/ticket');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page animate-fade-in">
        <div className="container checkout-layout">
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page animate-fade-in">
        <div className="container checkout-layout">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page animate-fade-in">
      <div className="container checkout-layout">

        <div className="checkout-form-container">
          <h2 className="checkout-title">Passenger Details</h2>
          <form className="passenger-form" onSubmit={handlePayment}>

            <div className="form-section glass-panel">
              <h3>Contact Information</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={contact.email}
                    onChange={handleContactChange('email')}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+91 98765 43210"
                    value={contact.phone}
                    onChange={handleContactChange('phone')}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section glass-panel mt-4">
              <h3 style={{ marginTop: '2rem' }}>Passenger 1 (Seat {selectedSeats[0]})</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Name"
                    value={passenger.name}
                    onChange={handlePassengerChange('name')}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Age</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Age"
                    min="1"
                    max="100"
                    value={passenger.age}
                    onChange={handlePassengerChange('age')}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Gender</label>
                  <select
                    className="input-field"
                    value={passenger.gender}
                    onChange={handlePassengerChange('gender')}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="checkout-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/seats')}>
                Back to Seats
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Processing...' : 'Pay Securely'} <ChevronRight size={18} />
              </button>
            </div>

            {error && <p className="error-text">{error}</p>}
          </form>
        </div>

        <div className="checkout-summary-card">
          <div className="trip-recap">
            <h3>Booking Summary</h3>
          </div>

          <div className="summary-details">
            <div className="summary-row">
              <span className="text-muted">Route</span>
              <span className="font-semibold">{trip?.from} to {trip?.to}</span>
            </div>
            <div className="summary-row">
              <span className="text-muted">Bus Operator</span>
              <span className="font-semibold">{trip?.operator}</span>
            </div>
            <div className="summary-row">
              <span className="text-muted">Selected Seats</span>
              <span className="font-semibold">{selectedSeats.join(', ')}</span>
            </div>
          </div>

          <div className="fare-breakdown">
            <div className="summary-row">
              <span className="text-muted">Base Fare</span>
              <span>₹{effectivePrice * selectedSeats.length}</span>
            </div>
            <div className="summary-row">
              <span className="text-muted">Taxes & Fees</span>
              <span>₹45</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total Payable</span>
            <span className="total-price">₹{effectivePrice * selectedSeats.length + 45}</span>
          </div>

          <div className="secure-badge">
            <ShieldCheck size={24} className="text-green-500" />
            <span style={{ color: '#10b981' }}>100% Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Checkout;
