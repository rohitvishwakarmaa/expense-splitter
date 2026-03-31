export default function SuccessAlert({ message }) {
  return (
    <div style={{
      background: 'rgba(52, 211, 153, 0.08)',
      border: '1px solid rgba(52, 211, 153, 0.25)',
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      animation: 'fadeInUp 0.3s ease',
    }}>
      <span style={{ fontSize: '1.125rem' }}>✅</span>
      <p style={{ color: 'var(--color-success)', fontWeight: 500, fontSize: '0.9375rem' }}>
        {message}
      </p>
    </div>
  );
}
