import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import AddExpense from './pages/AddExpense';
import ViewBalances from './pages/ViewBalances';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/groups/new" element={<CreateGroup />} />
            <Route path="/expenses/new" element={<AddExpense />} />
            <Route path="/balances" element={<ViewBalances />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer style={{
          borderTop: '1px solid rgba(99, 120, 255, 0.1)',
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.8125rem',
        }}>
          Smart Expense Splitter — Built with FastAPI + React + MongoDB
        </footer>
      </div>
    </BrowserRouter>
  );
}
