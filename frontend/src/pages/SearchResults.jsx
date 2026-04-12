import { Clock, Star, Filter, ChevronRight } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { searchTrips } from '../services/api.js';
import { useAppContext } from '../context/AppContext.jsx';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedTripId } = useAppContext();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const from = searchParams.get('from') || 'Mumbai';
  const to = searchParams.get('to') || 'Pune';
  const date = searchParams.get('date') || 'Today';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    searchTrips({ from, to })
      .then((payload) => {
        if (!active) return;
        setBuses(payload.results);
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
  }, [from, to]);

  return (
    <div className="search-results-page animate-fade-in">
      <div className="search-summary glass-panel">
        <div className="container summary-container">
          <div className="route-details">
            <h2>{from} <ChevronRight size={20} className="text-secondary" /> {to}</h2>
            <p className="text-muted"><Clock size={14} /> {date} • {loading ? 'Loading...' : `${buses.length} Buses Found`}</p>
          </div>
          <div className="summary-actions">
            <button className="btn btn-outline mobile-only" onClick={() => setShowFilters(true)} style={{ marginRight: '1rem' }}>
              <Filter size={18} /> Filters
            </button>
            <Link to="/" className="btn btn-primary">Modify Search</Link>
          </div>
        </div>
      </div>

      <div className="container results-layout">
        {/* Mobile Overlay */}
        {showFilters && <div className="filter-overlay animate-fade-in" onClick={() => setShowFilters(false)}></div>}

        <div className={`filters-sidebar ${showFilters ? 'active' : ''}`}>
          <div className="filter-header-mobile mobile-only">
            <h3>Filters</h3>
            <button className="filter-close-btn" onClick={() => setShowFilters(false)}><X size={24} /></button>
          </div>
          <h3 className="desktop-only">Filters</h3>

          <div className="filter-group">
            <h4 className="filter-title">Bus Type</h4>
            <label className="checkbox-label"><input type="checkbox" /> AC</label>
            <label className="checkbox-label"><input type="checkbox" /> Non-AC</label>
            <label className="checkbox-label"><input type="checkbox" /> Sleeper</label>
            <label className="checkbox-label"><input type="checkbox" /> Seater</label>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Departure Time</h4>
            <label className="checkbox-label"><input type="checkbox" /> Before 6 AM</label>
            <label className="checkbox-label"><input type="checkbox" /> 6 AM to 12 PM</label>
            <label className="checkbox-label"><input type="checkbox" /> 12 PM to 6 PM</label>
            <label className="checkbox-label"><input type="checkbox" /> After 6 PM</label>
          </div>
          
          <button className="btn btn-primary mobile-only" style={{ width: '100%' }} onClick={() => setShowFilters(false)}>Apply Filters</button>
        </div>

        <div className="bus-list">
          {loading && <p className="loader-text">Loading available routes...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && buses.length === 0 && (
            <p className="empty-state">No buses found for the selected route. Try another search.</p>
          )}

          {buses.map((bus) => (
            <div
              key={bus.id}
              className="bus-card"
              onClick={() => {
                setSelectedTripId(bus.id);
                navigate(`/trip/${bus.id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="bus-card-header">
                <div>
                  <h3 className="operator-name">{bus.operator}</h3>
                  <p className="bus-type">{bus.type}</p>
                </div>
                <div className="bus-rating">
                  <Star size={14} className="star-icon" /> {bus.rating}
                </div>
              </div>

              <div className="bus-timing-row">
                <div className="time-block">
                  <span className="time">{bus.departure}</span>
                  <span className="location">{from}</span>
                </div>
                <div className="duration-block">
                  <span className="duration-line"></span>
                  <span className="duration-text">{bus.duration}</span>
                  <span className="duration-line"></span>
                </div>
                <div className="time-block right-align">
                  <span className="time">{bus.arrival}</span>
                  <span className="location">{to}</span>
                </div>
              </div>

              <div className="bus-card-footer">
                <div className="price-info">
                  <span className="price">{bus.price}</span>
                  <span className="seats-left">{bus.seatsLeft} Seats left</span>
                </div>
                <Link
                  to={`/seats?tripId=${bus.id}`}
                  className="btn btn-primary select-seat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTripId(bus.id);
                  }}
                >
                  Select Seats
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SearchResults;
