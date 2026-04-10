# TaskFlow v3

A production-grade full-stack Task Manager with drag & drop, priorities, due dates, recurring tasks, and an analytics dashboard.

---

## Folder Structure

```
taskflow-v3/
├── backend/
│   ├── server.js          ← Express REST API (extended model + stats endpoint)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js                     ← Root: routing, page layout
│   │   ├── api.js                     ← All fetch helpers
│   │   ├── constants.js               ← Labels, types, priorities, formatters
│   │   ├── hooks/
│   │   │   └── useTasks.js            ← All task state & API calls
│   │   ├── components/
│   │   │   ├── Sidebar.js             ← Navigation sidebar
│   │   │   ├── TaskList.js            ← List view with filters, search, sort, drag/drop
│   │   │   ├── TaskItem.js            ← Individual draggable task row
│   │   │   ├── TaskForm.js            ← Add/edit modal form
│   │   │   └── Dashboard.js          ← Analytics with Chart.js
│   │   └── styles/
│   │       ├── global.css             ← Design tokens, reset, shared components
│   │       ├── tasks.css              ← Task list & row styles
│   │       └── dashboard.css         ← KPI cards, charts, table styles
│   └── package.json
└── .gitignore
└── README.md

```

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
npm start         # → http://localhost:4000
# or
npm run dev       # with nodemon hot-reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm start         # → http://localhost:3000
```

---

## Features

### Core
- Create, edit, complete, delete tasks
- Loading state, error handling throughout

### Priority & Labels
- Priority: High / Medium / Low (color-coded)
- Labels: Personal / Work / Shopping / Health
- Type: Task / Reminder / Event

### Due Dates & Recurrence
- Set a due date per task
- Overdue tasks highlighted in red
- Due-soon tasks highlighted in amber
- Recurrence: None / Daily / Weekly / Monthly
  - Completing a recurring task auto-generates the next occurrence

### Drag & Drop
- Drag task rows to reorder manually
- Persisted to backend via PATCH /tasks/reorder

### Filtering & Sorting
- Search by title and notes
- Filter by: status, priority, label, type
- Sort by: manual order, priority, due date, newest first

### Views
- **All Tasks** — full filterable list
- **Due Today** — only tasks due today
- **Overdue** — tasks past due date

### Dashboard (Analytics)
- KPI cards: Total, Completed, Remaining, Overdue, Completion %
- Overall progress bar
- Activity line chart (tasks created, last 7 days)
- Priority doughnut chart
- Label bar chart
- Type bar chart
- Overdue tasks table

---