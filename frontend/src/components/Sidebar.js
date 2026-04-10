import React from "react";

const NAV = [
  { id: "dashboard", icon: "◈", label: "Dashboard"  },
  { id: "tasks",     icon: "☰", label: "All Tasks"  },
  { id: "today",     icon: "◎", label: "Due Today"  },
  { id: "overdue",   icon: "⚠", label: "Overdue"   },
];

export default function Sidebar({ page, setPage, tasks }) {
  const today   = tasks.filter(t => !t.completed && t.dueDate && t.dueDate.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
  const overdue = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;

  const badges = { today, overdue };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Task<span>Flow</span></div>
      <div className="sidebar-tagline">Stay ahead, always.</div>

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {badges[item.id] > 0 && <span className="nav-badge">{badges[item.id]}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        TaskFlow v3.0 · In-memory
      </div>
    </aside>
  );
}
