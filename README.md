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

> The CRA proxy forwards `/tasks` API calls to `http://localhost:4000` automatically.

---

## API Reference

| Method | Endpoint          | Description                       | Body / Query                                              |
|--------|-------------------|-----------------------------------|-----------------------------------------------------------|
| GET    | /tasks            | Get all tasks                     | `?status=active\|completed&label=&type=&priority=`        |
| GET    | /tasks/stats      | Dashboard analytics data          | —                                                         |
| POST   | /tasks            | Create a task                     | `{ title, priority, label, type, recurrence, dueDate, reminder, notes }` |
| PATCH  | /tasks/reorder    | Bulk reorder                      | `{ orderedIds: string[] }`                                |
| PATCH  | /tasks/:id        | Update any fields                 | Any subset of task fields                                 |
| DELETE | /tasks/:id        | Delete a task                     | —                                                         |

---

## Task Data Model

| Field       | Type    | Values / Notes                                     |
|-------------|---------|-----------------------------------------------------|
| id          | string  | UUID (auto)                                         |
| title       | string  | Required                                            |
| completed   | boolean | Default: false                                      |
| priority    | string  | `high` \| `medium` \| `low`                        |
| label       | string  | `personal` \| `work` \| `shopping` \| `health`     |
| type        | string  | `task` \| `reminder` \| `event`                    |
| recurrence  | string  | `none` \| `daily` \| `weekly` \| `monthly`         |
| dueDate     | string  | ISO date string (optional)                          |
| reminder    | string  | ISO datetime string (optional)                      |
| notes       | string  | Extra details (optional)                            |
| order       | number  | Manual sort index                                   |
| createdAt   | string  | ISO datetime (auto)                                 |

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

## Design

- Dark theme with slate/indigo/amber palette
- **Syne** display font + **Instrument Sans** body font
- Fixed sidebar navigation with live badges
- Animated modal form (slide-up)
- CSS variables for full theming consistency

---

## Assumptions & Trade-offs

- **In-memory storage** — tasks reset on server restart. To persist: replace `let tasks = []` with a JSON file read/write or SQLite (e.g. `better-sqlite3`).
- **No auth** — out of scope.
- **Recurrence** — handled server-side: completing a recurring task creates a clone with the next due date.
- **Drag & drop** — uses native HTML5 Drag and Drop API (no extra library needed).
- **Charts** — powered by Chart.js via `react-chartjs-2`.
