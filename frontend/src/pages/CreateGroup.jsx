import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../api/groups';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';

export default function CreateGroup() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdGroup, setCreatedGroup] = useState(null);

  const addMember = () => {
    const name = memberInput.trim();
    if (!name) return;
    if (members.includes(name)) {
      setError(`"${name}" is already in the list.`);
      return;
    }
    setMembers((prev) => [...prev, name]);
    setMemberInput('');
    setError('');
  };

  const removeMember = (name) => {
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  const handleMemberKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMember();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Please enter a group name.');
      return;
    }
    if (members.length < 2) {
      setError('Please add at least 2 members.');
      return;
    }

    setLoading(true);
    try {
      const res = await createGroup({ name: groupName.trim(), members });
      setCreatedGroup(res.data);
      setSuccess(`Group "${res.data.name}" created successfully!`);
      setGroupName('');
      setMembers([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Create a Group</h1>
        <p className="page-subtitle">Start a new expense group and add your members.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Group Name */}
            <div className="form-field">
              <label className="form-label" htmlFor="group-name">Group Name</label>
              <input
                id="group-name"
                className="form-input"
                type="text"
                placeholder="e.g. Weekend Trip, Rent Split..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>

            {/* Add Member */}
            <div className="form-field">
              <label className="form-label" htmlFor="member-input">Add Members</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="member-input"
                  className="form-input"
                  type="text"
                  placeholder="Enter member name, press Enter"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={handleMemberKeyDown}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addMember}
                  style={{ whiteSpace: 'nowrap', padding: '0.75rem 1rem' }}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Member List */}
            {members.length > 0 && (
              <div>
                <div className="section-title">Members ({members.length})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {members.map((name) => (
                    <div key={name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '99px',
                      background: 'rgba(99, 120, 255, 0.12)',
                      border: '1px solid rgba(99, 120, 255, 0.2)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--color-primary-light)',
                    }}>
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => removeMember(name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1,
                          padding: '0 0.1rem',
                          fontSize: '1rem',
                        }}
                        aria-label={`Remove ${name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
            {success && <SuccessAlert message={success} />}

            <button id="create-group-btn" type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '🚀 Create Group'}
            </button>
          </form>
        </div>

        {/* Instructions / Success Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {createdGroup ? (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  Group Created!
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                  Share the Group ID to add expenses.
                </p>
              </div>
              <div style={{
                background: 'rgba(52, 211, 153, 0.06)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}>
                <div className="section-title" style={{ marginBottom: '0.5rem', color: 'var(--color-success)' }}>Group ID</div>
                <code style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>
                  {createdGroup.id}
                </code>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  id="go-add-expense-btn"
                  className="btn-primary"
                  onClick={() => navigate('/expenses/new', { state: { groupId: createdGroup.id, members: createdGroup.members } })}
                  style={{ flex: 1 }}
                >
                  💸 Add Expense
                </button>
                <button
                  id="go-view-balances-btn"
                  className="btn-secondary"
                  onClick={() => navigate('/balances', { state: { groupId: createdGroup.id } })}
                  style={{ flex: 1 }}
                >
                  📊 View Balances
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
                💡 How it works
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { step: '1', icon: '👥', title: 'Create a Group', desc: 'Give your group a name and add all the members who will share expenses.' },
                  { step: '2', icon: '💸', title: 'Add Expenses', desc: 'Log each shared expense — who paid, how much, and who participated.' },
                  { step: '3', icon: '📊', title: 'View Balances', desc: 'See a clear summary of who owes whom, auto-calculated from your expenses.' },
                ].map(({ step, icon, title, desc }) => (
                  <div key={step} style={{ display: 'flex', gap: '0.875rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(99, 120, 255, 0.15)',
                      border: '1px solid rgba(99, 120, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '1rem',
                    }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{title}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
