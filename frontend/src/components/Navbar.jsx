import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/groups/new', label: 'Create Group', icon: '👥' },
  { to: '/expenses/new', label: 'Add Expense', icon: '💸' },
  { to: '/balances', label: 'View Balances', icon: '📊' },
];

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={{
      borderBottom: '1px solid rgba(99, 120, 255, 0.15)',
      backdropFilter: 'blur(12px)',
      background: 'rgba(13, 15, 26, 0.85)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6378ff 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(99, 120, 255, 0.35)',
            }}>
              ⚖️
            </div>
            <span style={{
              fontWeight: 700,
              fontSize: '1.0625rem',
              background: 'linear-gradient(135deg, #f1f5f9 0%, #8b9dff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              SplitWise
            </span>
          </button>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: isActive ? 'rgba(99, 120, 255, 0.15)' : 'transparent',
                  color: isActive ? '#8b9dff' : '#94a3b8',
                  border: isActive ? '1px solid rgba(99, 120, 255, 0.25)' : '1px solid transparent',
                })}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
