import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'gobus_app_state';

const initialState = {
  user: null,
  token: null,
  selectedTripId: '',
  selectedSeats: [],
  bookingConfirmation: null,
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(initialState.user);
  const [token, setToken] = useState(initialState.token);
  const [selectedTripId, setSelectedTripId] = useState(initialState.selectedTripId);
  const [selectedSeats, setSelectedSeats] = useState(initialState.selectedSeats);
  const [bookingConfirmation, setBookingConfirmation] = useState(initialState.bookingConfirmation);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsed.user || null);
      setToken(parsed.token || null);
      setSelectedTripId(parsed.selectedTripId || '');
      setSelectedSeats(parsed.selectedSeats || []);
      setBookingConfirmation(parsed.bookingConfirmation || null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, token, selectedTripId, selectedSeats, bookingConfirmation }),
    );
  }, [user, token, selectedTripId, selectedSeats, bookingConfirmation]);

  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSelectedTripId('');
    setSelectedSeats([]);
    setBookingConfirmation(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/';
  };

  const value = useMemo(
    () => ({
      user,
      token,
      selectedTripId,
      selectedSeats,
      bookingConfirmation,
      login,
      logout,
      setSelectedTripId,
      setSelectedSeats,
      setBookingConfirmation,
    }),
    [user, token, selectedTripId, selectedSeats, bookingConfirmation],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
