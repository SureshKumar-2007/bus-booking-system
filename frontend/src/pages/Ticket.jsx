import { useEffect, useRef } from 'react';
import { CheckCircle, Download, Share2, Printer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Ticket.css';

const Ticket = () => {
  const navigate = useNavigate();
  const { bookingConfirmation } = useAppContext();
  const ticketRef = useRef(null);

  useEffect(() => {
    if (!bookingConfirmation) {
      navigate('/');
    }
  }, [bookingConfirmation, navigate]);

  if (!bookingConfirmation) {
    return null;
  }

  const passenger = bookingConfirmation.passengers?.details?.[0] || {};
  const routeText = bookingConfirmation.summary?.route || 'Route unavailable';

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Ticket_${bookingConfirmation.pnr}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Bus Ticket',
        text: `My booking for ${bookingConfirmation.summary?.operator} is confirmed. PNR: ${bookingConfirmation.pnr}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this browser. You can copy the URL instead.');
    }
  };

  return (
    <div className="ticket-page animate-fade-in">
      <div className="container">
        <div className="success-header no-print">
          <CheckCircle size={64} className="success-icon mx-auto" style={{ margin: '0 auto 1rem' }} />
          <h2>Booking Confirmed!</h2>
          <p>Your ticket has been sent to your email and SMS.</p>
        </div>

        <div className="ticket-card glass-panel" ref={ticketRef}>
          <div className="ticket-header">
            <div className="pnr-block">
              <span className="text-muted" style={{ color: 'rgba(255,255,255,0.7)' }}>PNR No.</span>
              <span className="pnr-number">{bookingConfirmation.pnr}</span>
            </div>
            <div className="status-badge confirmed">Confirmed</div>
          </div>

          <div className="ticket-body">
            <div className="ticket-route-info">
              <h3 className="operator-name">{bookingConfirmation.summary?.operator}</h3>

              <div className="journey-timeline">
                <div className="timeline-point">
                  <div className="dot"></div>
                  <div className="point-details">
                    <span className="time">{bookingConfirmation.summary?.departure}</span>
                    <span className="date">{new Date(bookingConfirmation.createdAt).toLocaleDateString()}</span>
                    <span className="city">{routeText}</span>
                  </div>
                </div>
                <div className="timeline-line"></div>
                <div className="timeline-point">
                  <div className="dot"></div>
                  <div className="point-details">
                    <span className="time">{bookingConfirmation.summary?.arrival}</span>
                    <span className="date">{new Date(bookingConfirmation.createdAt).toLocaleDateString()}</span>
                    <span className="city">{routeText}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-passenger-info border-left">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Passenger</span>
                  <span className="value">{passenger.name || bookingConfirmation.contact?.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Seat Number</span>
                  <span className="value">{bookingConfirmation.seats.join(', ')}</span>
                </div>
                <div className="info-item">
                  <span className="label">Total Fare</span>
                  <span className="value">₹{bookingConfirmation.totalFare + 45}</span>
                </div>
                <div className="info-item">
                  <span className="label">Boarding Point</span>
                  <span className="value">{bookingConfirmation.summary?.boardingPoint || bookingConfirmation.summary?.route}</span>
                </div>
              </div>

              <div className="qr-code-placeholder">
                <div className="mock-qr">
                  <div className="qr-squares"></div>
                </div>
                <span className="qr-text" style={{ marginTop: '0.5rem', display: 'block' }}>Scan for boarding</span>
              </div>
            </div>
          </div>

          <div className="ticket-footer no-print">
            <button className="btn btn-primary" onClick={handleDownloadPDF}><Download size={18} /> Download PDF</button>
            <button className="btn btn-outline" onClick={handlePrint}><Printer size={18} /> Print</button>
            <button className="btn btn-outline" onClick={handleShare}><Share2 size={18} /> Share</button>
          </div>
        </div>

        <div className="back-home-container no-print" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
