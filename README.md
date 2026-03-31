# Smart Expense Splitter 💸

A full-stack expense splitting application that lets you create groups, track shared expenses, and instantly calculate who owes whom — with zero complexity and maximum clarity.

## 🏗️ Architecture

```
smart-expense-splitter/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py             # Application entry, CORS, routers
│   │   ├── config/
│   │   │   └── settings.py     # Pydantic settings (from .env)
│   │   ├── db/
│   │   │   └── database.py     # Motor async MongoDB client
│   │   ├── models/             # MongoDB document models
│   │   │   ├── group.py
│   │   │   └── expense.py
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   │   ├── group.py
│   │   │   ├── expense.py
│   │   │   └── balance.py
│   │   ├── routes/             # API route handlers
│   │   │   ├── groups.py
│   │   │   ├── expenses.py
│   │   │   └── balances.py
│   │   └── services/           # Business logic
│   │       └── balance_service.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/                   # React + Vite + Tailwind frontend
    ├── src/
    │   ├── api/                # Axios API modules
    │   │   ├── client.js
    │   │   ├── groups.js
    │   │   ├── expenses.js
    │   │   └── balances.js
    │   ├── components/         # Reusable UI components
    │   │   ├── Navbar.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── ErrorAlert.jsx
    │   │   └── SuccessAlert.jsx
    │   ├── pages/              # Page-level components
    │   │   ├── Home.jsx
    │   │   ├── CreateGroup.jsx
    │   │   ├── AddExpense.jsx
    │   │   └── ViewBalances.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    └── vite.config.js
```

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | FastAPI (Python 3.11+) |
| Database | MongoDB (Motor async driver) |
| State Management | React Hooks (useState, useEffect) |
| HTTP Client | Axios |
| Deployment | Vercel (frontend) + Render/Fly.io (backend) |

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and set your MONGO_URI

# Run the server
uvicorn app.main:app --reload --port 8000
```

Open: http://localhost:8000/docs (Swagger UI)

### Frontend Setup

```bash
cd frontend

# Install dependencies (already done during scaffold)
npm install

# Configure environment
copy .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api

# Start dev server
npm run dev
```

Open: http://localhost:5173

## 🔌 API Documentation

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/groups/` | Create a new group |
| `GET` | `/api/groups/` | List all groups |
| `GET` | `/api/groups/{id}` | Get a specific group |

**POST /api/groups/**
```json
{
  "name": "Weekend Trip",
  "members": ["Alice", "Bob", "Charlie"]
}
```

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/expenses/` | Add an expense |
| `GET` | `/api/expenses/group/{group_id}` | List group expenses |

**POST /api/expenses/**
```json
{
  "group_id": "64b8f9a2e4b0c3d1f5e6a7b8",
  "description": "Dinner",
  "amount": 1500.0,
  "paid_by": "Alice",
  "participants": ["Alice", "Bob", "Charlie"],
  "split_type": "equal"
}
```

### Balances

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/balances/{group_id}` | Get calculated balances |

**Response:**
```json
{
  "group_id": "...",
  "group_name": "Weekend Trip",
  "members": ["Alice", "Bob", "Charlie"],
  "debts": [
    {
      "from_member": "Bob",
      "to_member": "Alice",
      "amount": 500.0,
      "description": "Bob owes Alice ₹500.00"
    }
  ],
  "total_expenses": 1500.0,
  "is_settled": false
}
```

## 🧠 Balance Calculation Logic

Balances are **never stored** in the database. They are recalculated dynamically on every request.

**Algorithm:**
1. For each expense, compute each person's net balance:
   - **Payer** receives credit for the full amount
   - **Each participant** (including payer) subtracts their equal share
2. Net positive → person is owed money (creditor)
3. Net negative → person owes money (debtor)
4. Apply **greedy min-cash-flow** to minimize the number of transactions

**Example:**
```
Alice pays ₹1500 for [Alice, Bob, Charlie]
  → Alice net: +1500 - 500 = +1000
  → Bob net: -500
  → Charlie net: -500

Result: Bob → Alice ₹500, Charlie → Alice ₹500
```

## 🚢 Deployment

### Backend (Render.com)

1. Push backend to GitHub
2. Create a new **Web Service** on Render
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `MONGO_URI`, `DB_NAME`

### Frontend (Vercel / Netlify)

1. Push frontend to GitHub
2. Import project on Vercel
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy!

## 📄 License

MIT
