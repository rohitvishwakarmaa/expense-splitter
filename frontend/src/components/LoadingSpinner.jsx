export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      gap: '1rem',
    }}>
      <div className="spinner" />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>{message}</p>
    </div>
  );
}
