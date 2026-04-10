import React, { useState } from "react";
import Sidebar    from "./components/Sidebar";
import TaskList   from "./components/TaskList";
import Dashboard  from "./components/Dashboard";
import TaskForm   from "./components/TaskForm";
import { useTasks } from "./hooks/useTasks";
import "./styles/tasks.css";
import "./styles/dashboard.css";

const PAGE_META = {
  dashboard: { title: "Dashboard",   sub: "Your productivity at a glance" },
  tasks:     { title: "All Tasks",   sub: "Manage, filter, and reorder your tasks" },
  today:     { title: "Due Today",   sub: "Tasks with a due date set for today" },
  overdue:   { title: "Overdue",     sub: "Tasks past their due date" },
};

export default function App() {
  const { tasks, loading, error, setError, add, update, remove, reorder } = useTasks();
  const [page,    setPage]    = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);

  // Derived task sets for special pages
  const todayStr = new Date().toISOString().slice(0, 10);
  const viewTasks = {
    dashboard: tasks,
    tasks:     tasks,
    today:     tasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) === todayStr && !t.completed),
    overdue:   tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed),
  };

  async function handleToggle(task) {
    try { await update(task.id, { completed: !task.completed }); }
    catch (e) { setError(e.message); }
  }
  async function handleDelete(id) {
    try { await remove(id); }
    catch (e) { setError(e.message); }
  }
  async function handleSave(data) {
    if (editing) await update(editing.id, data);
    else         await add(data);
  }

  const meta = PAGE_META[page];

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} tasks={tasks} />

      <main className="main">
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="page-title">{meta.title}</h1>
              <p className="page-sub">{meta.sub}</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
              + New Task
            </button>
          </div>

          {page === "dashboard" ? (
            <Dashboard tasks={tasks} />
          ) : (
            <TaskList
              tasks={viewTasks[page]}
              loading={loading}
              error={error}
              setError={setError}
              onToggle={handleToggle}
              onEdit={t => { setEditing(t); setShowForm(true); }}
              onDelete={handleDelete}
              onReorder={reorder}
              onAdd={() => { setEditing(null); setShowForm(true); }}
            />
          )}
        </div>
      </main>

      {showForm && (
        <TaskForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
