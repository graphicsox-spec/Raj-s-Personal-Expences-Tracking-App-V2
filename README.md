# Raj's Personal Expense Tracker (V2)

A command-center dashboard for household finances. Built with **React + TypeScript + Vite**, styled with **Tailwind CSS**, charts via **Recharts**, and all data persisted locally in your browser (**localStorage**) — no backend required.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Features

- **Dashboard** — core metrics (income, expenses, savings, credit card balances, mortgage+utilities, remaining budget), spending donut, 6-month income vs expense trend, top spending bars, and budget alerts.
- **Monthly Budget** — set a cap per category; progress bars turn amber at 90% and red when exceeded.
- **Recurring Bills** — track repeating bills; check one off to instantly log it to the ledger (un-check removes it).
- **Credit Cards** — card-style containers showing balance, due date, limit, and utilization.
- **Home Expenses** — capital-expenditure ledger split into Renovations, Furniture & Decor, and Structural Repairs.
- **Annual Expenses** — plan periodic large costs with an auto-computed prorated monthly savings target.

## Architecture

```
src/
├── components/
│   ├── common/        Buttons, Inputs, Modal, Sidebar, Navbar, Card, ProgressBar, AddExpenseModal
│   ├── dashboard/     MetricCard + chart components
│   └── trackers/      The five feature tabs
├── context/
│   └── AppStateContext.tsx   Global state + CRUD + localStorage persistence
├── hooks/
│   └── useAnalytics.ts       All financial calculations
├── types/
│   └── index.ts              Shared interfaces + EXPENSE_CATEGORIES
└── App.tsx                   Shell + routing between tabs
```

State management uses React Context + `useReducer`. The reducer is the only place state mutates; the provider exposes typed CRUD helpers and persists every change to `localStorage`. The app seeds with sample data on first run — clear `localStorage` (key `raj-expense-tracker:v2`) to reset.
