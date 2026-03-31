import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getBalances } from '../api/balances';
import { listGroups } from '../api/groups';
import { getExpensesByGroup } from '../api/expenses';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

export default function ViewBalances() {
  const location = useLocation();
  const prefillGroupId = location.state?.groupId || '';

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(prefillGroupId);
  const [balanceData, setBalanceData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listGroups().then((res) => {
      setGroups(res.data);
      if (!prefillGroupId && res.data.length > 0) {
        // don't auto-select, let user choose
      }
    }).catch(() => {});
  }, []);

  const fetchBalances = async (groupId) => {
    if (!groupId) return;
    setLoading(true);
    setError('');
    setBalanceData(null);
    setExpenses([]);

    try {
      const [balRes, expRes] = await Promise.all([
        getBalances(groupId),
        getExpensesByGroup(groupId),
      ]);
      setBalanceData(balRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (e) => {
    const id = e.target.value;
    setSelectedGroupId(id);
    if (id) fetchBalances(id);
    else { setBalanceData(null); setExpenses([]); }
  };

  useEffect(() => {
    if (prefillGroupId) fetchBalances(prefillGroupId);
  }, []);

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title">View Balances</h1>
        <p className="page-subtitle">Dynamically calculated from all expenses — never stored in the database.</p>
      </div>

      {/* Group Selector */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="balance-group-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Select Group
            </label>
            <select
              id="balance-group-select"
              className="form-select"
              value={selectedGroupId}
              onChange={handleGroupChange}
            >
              <option value="">Choose a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.members.length} members)</option>
              ))}
            </select>
          </div>
          {selectedGroupId && (
            <button
              id="refresh-balances-btn"
              className="btn-secondary"
              onClick={() => fetchBalances(selectedGroupId)}
              style={{ marginTop: '1.5rem', whiteSpace: 'nowrap' }}
            >
              🔄 Refresh
            </button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {loading && <LoadingSpinner message="Calculating balances..." />}

      {balanceData && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Group', value: balanceData.group_name, icon: '👥', color: 'var(--color-primary-light)' },
              { label: 'Total Expenses', value: `₹${balanceData.total_expenses.toFixed(2)}`, icon: '💰', color: 'var(--color-warning)' },
              { label: 'Status', value: balanceData.is_settled ? 'All Settled ✅' : `${balanceData.debts.length} Pending`, icon: '⚖️', color: balanceData.is_settled ? 'var(--color-success)' : 'var(--color-danger)' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Debts */}
          <div>
            <div className="section-title">Settlements Required</div>
            {balanceData.is_settled ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                  All Settled Up!
                </h3>
                <p style={{ color: 'var(--color-text-muted)' }}>No outstanding balances in this group.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {balanceData.debts.map((debt, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    {/* From */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(248, 113, 113, 0.15)',
                      border: '1px solid rgba(248, 113, 113, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-danger)',
                      flexShrink: 0,
                    }}>
                      {debt.from_member.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-danger)', minWidth: '80px' }}>
                      {debt.from_member}
                    </div>

                    {/* Arrow + Amount */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        flex: 1,
                        height: '2px',
                        background: 'linear-gradient(90deg, rgba(248,113,113,0.4) 0%, rgba(99,120,255,0.2) 50%, rgba(52,211,153,0.4) 100%)',
                        borderRadius: '2px',
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'var(--color-bg-card)',
                          border: '1px solid rgba(99,120,255,0.3)',
                          borderRadius: '99px',
                          padding: '0.25rem 0.875rem',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--color-text-primary)',
                          whiteSpace: 'nowrap',
                        }}>
                          ₹{debt.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* To */}
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-success)', minWidth: '80px', textAlign: 'right' }}>
                      {debt.to_member}
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(52, 211, 153, 0.15)',
                      border: '1px solid rgba(52, 211, 153, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-success)',
                      flexShrink: 0,
                    }}>
                      {debt.to_member.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense List */}
          {expenses.length > 0 && (
            <div>
              <div className="section-title">Expense History ({expenses.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {expenses.map((exp) => (
                  <div key={exp.id} className="card" style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(99, 120, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}>
                      💸
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                        {exp.description || 'Expense'}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        Paid by <strong style={{ color: 'var(--color-primary-light)' }}>{exp.paid_by}</strong> · {exp.participants.join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                        ₹{exp.amount.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        ₹{(exp.amount / exp.participants.length).toFixed(2)}/each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Net Balance */}
          {balanceData.members.length > 0 && (
            <div>
              <div className="section-title">Members</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {balanceData.members.map((member) => (
                  <div key={member} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '99px',
                    background: 'rgba(99, 120, 255, 0.08)',
                    border: '1px solid rgba(99, 120, 255, 0.15)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(99, 120, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-light)',
                    }}>
                      {member.charAt(0).toUpperCase()}
                    </span>
                    {member}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedGroupId && groups.length === 0 && !loading && (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            No groups yet
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            Create a group first to start tracking expenses.
          </p>
        </div>
      )}
    </div>
  );
}
