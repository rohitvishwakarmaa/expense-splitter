import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { addExpense } from '../api/expenses';
import { getGroup, listGroups } from '../api/groups';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { label: 'Food & Dining', icon: '🍽️' },
  { label: 'Travel', icon: '✈️' },
  { label: 'Accommodation', icon: '🏨' },
  { label: 'Entertainment', icon: '🎬' },
  { label: 'Shopping', icon: '🛍️' },
  { label: 'Utilities', icon: '💡' },
  { label: 'Other', icon: '📦' },
];

export default function AddExpense() {
  const location = useLocation();
  const prefillGroupId = location.state?.groupId || '';
  const prefillMembers = location.state?.members || [];

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const [form, setForm] = useState({
    group_id: prefillGroupId,
    description: '',
    amount: '',
    paid_by: '',
    participants: prefillMembers.length ? [...prefillMembers] : [],
    split_type: 'equal',
    category: 'Other',
  });

  const [groupMembers, setGroupMembers] = useState(prefillMembers);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load all groups for the dropdown
  useEffect(() => {
    listGroups()
      .then((res) => setGroups(res.data))
      .catch(() => {})
      .finally(() => setGroupsLoading(false));
  }, []);

  // Load group members when group changes
  useEffect(() => {
    if (!form.group_id) return;
    setLoadingMembers(true);
    getGroup(form.group_id)
      .then((res) => {
        setGroupMembers(res.data.members);
        setForm((prev) => ({ ...prev, participants: [...res.data.members], paid_by: '' }));
      })
      .catch(() => {})
      .finally(() => setLoadingMembers(false));
  }, [form.group_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleParticipant = (member) => {
    setForm((prev) => {
      const already = prev.participants.includes(member);
      const updated = already
        ? prev.participants.filter((m) => m !== member)
        : [...prev.participants, member];
      return { ...prev, participants: updated };
    });
  };

  const selectAllParticipants = () => {
    setForm((prev) => ({ ...prev, participants: [...groupMembers] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.group_id) { setError('Please select a group.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return; }
    if (!form.paid_by) { setError('Please select who paid.'); return; }
    if (form.participants.length === 0) { setError('Please select at least one participant.'); return; }
    if (!form.participants.includes(form.paid_by)) {
      setError('The payer must be included in the participants list.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        group_id: form.group_id,
        description: form.description || form.category,
        amount: parseFloat(form.amount),
        paid_by: form.paid_by,
        participants: form.participants,
        split_type: 'equal',
      };
      await addExpense(payload);
      const perPerson = (parseFloat(form.amount) / form.participants.length).toFixed(2);
      setSuccess(`Expense of ₹${parseFloat(form.amount).toFixed(2)} added! Each person owes ₹${perPerson}.`);
      setForm((prev) => ({ ...prev, description: '', amount: '', paid_by: '', participants: [...groupMembers] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title">Add an Expense</h1>
        <p className="page-subtitle">Log a shared expense and we'll calculate balances automatically.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Group Selection */}
            <div className="form-field">
              <label className="form-label" htmlFor="group-select">Group</label>
              {groupsLoading ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '0.75rem 0' }}>Loading groups...</div>
              ) : (
                <select
                  id="group-select"
                  className="form-select"
                  name="group_id"
                  value={form.group_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a group...</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Category */}
            <div className="form-field">
              <label className="form-label">Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {CATEGORIES.map(({ label, icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: label }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '99px',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: form.category === label ? 'rgba(99, 120, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                      border: form.category === label ? '1px solid rgba(99, 120, 255, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: form.category === label ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-label" htmlFor="description">Description (optional)</label>
              <input
                id="description"
                className="form-input"
                type="text"
                name="description"
                placeholder="e.g. Dinner at Pizza Hut"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* Amount */}
            <div className="form-field">
              <label className="form-label" htmlFor="amount">Total Amount (₹)</label>
              <input
                id="amount"
                className="form-input"
                type="number"
                name="amount"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Paid By */}
            <div className="form-field">
              <label className="form-label" htmlFor="paid-by">Paid By</label>
              {loadingMembers ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading members...</div>
              ) : (
                <select
                  id="paid-by"
                  className="form-select"
                  name="paid_by"
                  value={form.paid_by}
                  onChange={handleChange}
                  required
                >
                  <option value="">Who paid?</option>
                  {groupMembers.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>

            {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}
            {success && <SuccessAlert message={success} />}

            <button id="add-expense-btn" type="submit" className="btn-primary" disabled={loading || !form.group_id}>
              {loading ? 'Adding...' : '💸 Add Expense'}
            </button>
          </form>
        </div>

        {/* Participants Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>
                Participants ({form.participants.length}/{groupMembers.length})
              </div>
              {groupMembers.length > 0 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={selectAllParticipants}
                  style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
                >
                  Select All
                </button>
              )}
            </div>

            {!form.group_id ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Select a group to see members.
              </p>
            ) : loadingMembers ? (
              <LoadingSpinner message="Loading members..." />
            ) : groupMembers.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No members in this group.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {groupMembers.map((member) => {
                  const isSelected = form.participants.includes(member);
                  return (
                    <label
                      key={member}
                      htmlFor={`participant-${member}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isSelected ? 'rgba(99, 120, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid rgba(99, 120, 255, 0.25)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <input
                        id={`participant-${member}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipant(member)}
                      />
                      <span style={{
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: isSelected ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                      }}>
                        {member}
                      </span>
                      {form.paid_by === member && (
                        <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Payer</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Split Preview */}
          {form.amount && form.participants.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div className="section-title" style={{ marginBottom: '0.75rem' }}>Split Preview</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Each person pays</span>
                <span style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #34d399 0%, #6378ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  ₹{(parseFloat(form.amount || 0) / form.participants.length).toFixed(2)}
                </span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                ₹{parseFloat(form.amount || 0).toFixed(2)} ÷ {form.participants.length} {form.participants.length === 1 ? 'person' : 'people'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
