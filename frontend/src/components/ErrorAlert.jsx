export default function ErrorAlert({ message, onDismiss }) {
  return (
    <div style={{
      background: 'rgba(248, 113, 113, 0.08)',
      border: '1px solid rgba(248, 113, 113, 0.25)',
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      animation: 'fadeInUp 0.3s ease',
    }}>
      <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--color-danger)', fontWeight: 500, fontSize: '0.9375rem' }}>
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '0',
            fontSize: '1.1rem',
            lineHeight: 1,
          }}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}
