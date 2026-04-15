import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import SearchResults from './pages/SearchResults'
import SeatSelection from './pages/SeatSelection'
import Checkout from './pages/Checkout'
import Ticket from './pages/Ticket'
import TripDetails from './pages/TripDetails'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminTrips from './pages/AdminTrips'
import AdminBookings from './pages/AdminBookings'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminRefunds from './pages/AdminRefunds'
import AdminReports from './pages/AdminReports'
import AdminActivityLogs from './pages/AdminActivityLogs'
import AdminAnnouncements from './pages/AdminAnnouncements'
import AdminBuses from './pages/AdminBuses'
import './App.css'

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/seats" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/trips" element={<AdminTrips />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/refunds" element={<AdminRefunds />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/buses" element={<AdminBuses />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
