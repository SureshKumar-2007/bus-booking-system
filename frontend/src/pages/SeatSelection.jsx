import { useEffect, useState } from 'react';
import { Armchair, ChevronRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getSeats } from '../services/api.js';
import { useAppContext } from '../context/AppContext.jsx';
import './SeatSelection.css';

const SeatSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedTripId, selectedSeats, setSelectedSeats, setSelectedTripId } = useAppContext();
  const [trip, setTrip] = useState(null);
  const [seatMap, setSeatMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tripId = searchParams.get('tripId') || selectedTripId;

  useEffect(() => {
    if (!tripId) {
      navigate('/search');
      return;
    }

    setSelectedTripId(tripId);
    if (tripId !== selectedTripId) {
      setSelectedSeats([]);
    }

    let active = true;
    setLoading(true);
    setError('');

    getSeats(tripId)
      .then((payload) => {
        if (!active) return;
        setTrip(payload);
        setSeatMap(payload.seatMap || []);
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
  }, [tripId, selectedTripId, navigate, setSelectedSeats, setSelectedTripId]);

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
      return;
    }

    if (selectedSeats.length >= 6) {
      alert('You can select up to 6 seats max.');
      return;
    }

    setSelectedSeats([...selectedSeats, seatId]);
  };

  const getSeatStatus = (seatId) => {
    if (selectedSeats.includes(seatId)) return 'selected';
    const seat = seatMap.find((item) => item.id === seatId);
    if (seat?.status === 'booked') return 'booked';
    return 'available';
  };

  const renderSeat = (seatId) => {
    const status = getSeatStatus(seatId);
    return (
      <div
        key={seatId}
        className={`seat ${status}`}
        onClick={() => status !== 'booked' && toggleSeat(seatId)}
      >
        <Armchair size={24} />
        <span className="seat-label">{seatId}</span>
      </div>
    );
  };

  const calculateTotal = () => (selectedSeats.length * (trip?.price || 0));

  if (loading) {
    return (
      <div className="seat-selection-page animate-fade-in">
        <div className="container selection-layout">
          <p>Loading seats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seat-selection-page animate-fade-in">
        <div className="container selection-layout">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seat-selection-page animate-fade-in">
      <div className="container selection-layout">
        <div className="bus-layout-card">
          <h2 className="layout-title">Select Your Seats</h2>

          <div className="seat-legend">
            <div className="legend-item"><div className="color-box available"></div> Available</div>
            <div className="legend-item"><div className="color-box selected"></div> Selected</div>
            <div className="legend-item"><div className="color-box booked"></div> Booked</div>
          </div>

          <div className="bus-chassis">
            <div className="steering-wheel">Driver</div>
            <div className="seats-grid">
              {Array.from({ length: 10 }).map((_, rowIndex) => {
                const rowNum = rowIndex + 1;
                return (
                  <div key={rowNum} className="seat-row">
                    <div className="seat-pair">
                      {renderSeat(`${rowNum}A`)}
                      {renderSeat(`${rowNum}B`)}
                    </div>
                    <div className="aisle"></div>
                    <div className="seat-pair">
                      {renderSeat(`${rowNum}C`)}
                      {renderSeat(`${rowNum}D`)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="selection-summary-card">
          <div className="trip-recap">
            <h3>{trip?.operator}</h3>
            <p className="text-muted">{trip?.route} • {trip?.departure}</p>
          </div>

          <div className="summary-details">
            <div className="summary-row">
              <span className="text-muted">Seat No.</span>
              <span className="font-semibold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}</span>
            </div>
            <div className="summary-row">
              <span className="text-muted">Per Seat Price</span>
              <span className="font-semibold">₹{trip?.price}</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total Amount</span>
            <span className="total-price">₹{calculateTotal()}</span>
          </div>

          <button
            className="btn btn-primary checkout-btn"
            disabled={selectedSeats.length === 0}
            onClick={() => navigate(`/checkout?tripId=${tripId}`)}
          >
            Proceed to Checkout <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SeatSelection;
