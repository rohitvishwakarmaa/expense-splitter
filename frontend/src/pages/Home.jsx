import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGroups } from '../api/groups';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGroups()
      .then((res) => setGroups(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem 3rem',
        animation: 'fadeInUp 0.5s ease',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(99, 120, 255, 0.1)',
          border: '1px solid rgba(99, 120, 255, 0.2)',
          borderRadius: '99px',
          padding: '0.375rem 1rem',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--color-primary-light)',
          marginBottom: '1.5rem',
        }}>
          ⚡ Smart · Fast · Accurate
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #8b9dff 50%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Split Expenses,<br />Not Friendships.
        </h1>
        <p style={{
          fontSize: '1.0625rem',
          color: 'var(--color-text-secondary)',
          maxWidth: '520px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6,
        }}>
          Create groups, log shared expenses, and get instant clarity on who owes whom — with zero drama.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="hero-create-group-btn"
            className="btn-primary"
            onClick={() => navigate('/groups/new')}
            style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
          >
            👥 Create a Group
          </button>
          <button
            id="hero-view-balances-btn"
            className="btn-secondary"
            onClick={() => navigate('/balances')}
            style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
          >
            📊 View Balances
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '3rem' }}>
        {[
          { icon: '👥', title: 'Group Management', desc: 'Create expense groups and manage members easily.', color: '#6378ff' },
          { icon: '💸', title: 'Smart Splitting', desc: 'Equal splits calculated instantly across all participants.', color: '#a78bfa' },
          { icon: '⚖️', title: 'Auto Balances', desc: 'Dynamically computed from expenses — always accurate.', color: '#34d399' },
        ].map(({ icon, title, desc, color }) => (
          <div key={title} className="card" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${color}18`,
              border: `1px solid ${color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '1rem',
            }}>
              {icon}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Groups */}
      {loading ? (
        <LoadingSpinner message="Loading your groups..." />
      ) : groups.length > 0 ? (
        <div>
          <div className="section-title" style={{ marginBottom: '1rem' }}>Your Groups</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {groups.map((group) => (
              <div key={group.id} className="card" style={{ padding: '1.5rem', cursor: 'pointer' }}
                onClick={() => navigate('/balances', { state: { groupId: group.id } })}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(99, 120, 255, 0.15)',
                    border: '1px solid rgba(99, 120, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                  }}>
                    👥
                  </div>
                  <span className="badge badge-primary">{group.members.length} members</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
                  {group.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {group.members.slice(0, 3).join(', ')}{group.members.length > 3 ? ` +${group.members.length - 3} more` : ''}
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    onClick={(e) => { e.stopPropagation(); navigate('/expenses/new', { state: { groupId: group.id, members: group.members } }); }}
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem' }}
                  >
                    + Expense
                  </button>
                  <button
                    className="btn-primary"
                    onClick={(e) => { e.stopPropagation(); navigate('/balances', { state: { groupId: group.id } }); }}
                    style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem' }}
                  >
                    Balances
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
