import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend Error caught by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#f8fafc'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '10px' }}>Something went wrong</h1>
          <p style={{ color: '#64748b', maxWidth: '500px' }}>
            The application encountered an unexpected error. This might be due to a deployment sync issue or a temporary glitch.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reload Application
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: '20px',
              padding: '15px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              fontSize: '12px',
              textAlign: 'left',
              overflow: 'auto',
              maxWidth: '90%'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
