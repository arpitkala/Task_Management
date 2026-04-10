import React, { useState, useMemo, useRef } from "react";
import TaskItem from "./TaskItem";
import { PRIORITIES, LABELS, TYPES } from "../constants";

export default function TaskList({ tasks, error, loading, setError, onToggle, onEdit, onDelete, onReorder, onAdd }) {
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("all");
  const [priority, setPriority] = useState("all");
  const [label,    setLabel]    = useState("all");
  const [type,     setType]     = useState("all");
  const [sortBy,   setSortBy]   = useState("order"); // order | dueDate | priority | createdAt

  const dragId = useRef(null);
  const overId = useRef(null);

  // ── Filter + sort ────────────────────────────────────────────────────────
  const visible = useMemo(() => {
    let list = [...tasks];
    if (status   === "active")    list = list.filter(t => !t.completed);
    if (status   === "completed") list = list.filter(t => t.completed);
    if (priority !== "all") list = list.filter(t => t.priority === priority);
    if (label    !== "all") list = list.filter(t => t.label    === label);
    if (type     !== "all") list = list.filter(t => t.type     === type);
    if (search.trim()) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.notes || "").toLowerCase().includes(search.toLowerCase()));

    const pOrder = { high: 0, medium: 1, low: 2 };
    if (sortBy === "priority")  list.sort((a, b) => pOrder[a.priority] - pOrder[b.priority]);
    if (sortBy === "dueDate")   list.sort((a, b) => { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate) - new Date(b.dueDate); });
    if (sortBy === "createdAt") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "order")     list.sort((a, b) => a.order - b.order);

    return list;
  }, [tasks, search, status, priority, label, type, sortBy]);

  // ── Drag handlers ────────────────────────────────────────────────────────
  function handleDragStart(e, id) {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }
  function handleDragOver(e, id) {
    overId.current = id;
  }
  function handleDrop(e, id) {
    if (!dragId.current || dragId.current === id) return;
    const ids = visible.map(t => t.id);
    const from = ids.indexOf(dragId.current);
    const to   = ids.indexOf(id);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId.current);
    onReorder(ids);
    dragId.current = null;
  }

  const counts = { all: tasks.length, active: tasks.filter(t => !t.completed).length, completed: tasks.filter(t => t.completed).length };

  return (
    <div className="task-list-page">
      {error && <div className="error-bar">{error}<button onClick={() => setError("")}>✕</button></div>}

      {/* Search + Sort */}
      <div className="list-toolbar">
        <input className="input search-box" placeholder="🔍  Search tasks and notes…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="order">Manual order</option>
          <option value="priority">By priority</option>
          <option value="dueDate">By due date</option>
          <option value="createdAt">Newest first</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="filter-bar">
        {/* Status */}
        <div className="chip-group">
          {["all","active","completed"].map(s => (
            <button key={s} className={`chip ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{ opacity: 0.6, marginLeft: 2 }}>({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>
        <span className="filter-sep" />
        {/* Priority */}
        <div className="chip-group">
          <button className={`chip ${priority === "all" ? "active" : ""}`} onClick={() => setPriority("all")}>All priority</button>
          {PRIORITIES.map(p => (
            <button key={p.value} className={`chip ${priority === p.value ? "active" : ""}`}
              style={priority === p.value ? { background: `${p.color}20`, borderColor: p.color, color: p.color } : {}}
              onClick={() => setPriority(p.value)}>{p.label}</button>
          ))}
        </div>
        <span className="filter-sep" />
        {/* Label */}
        <div className="chip-group">
          <button className={`chip ${label === "all" ? "active" : ""}`} onClick={() => setLabel("all")}>All labels</button>
          {LABELS.map(l => (
            <button key={l.value} className={`chip ${label === l.value ? "active" : ""}`}
              onClick={() => setLabel(l.value)}>{l.icon} {l.label}</button>
          ))}
        </div>
        <span className="filter-sep" />
        {/* Type */}
        <div className="chip-group">
          <button className={`chip ${type === "all" ? "active" : ""}`} onClick={() => setType("all")}>All types</button>
          {TYPES.map(t => (
            <button key={t.value} className={`chip ${type === t.value ? "active" : ""}`}
              onClick={() => setType(t.value)}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="task-card">
        {loading ? (
          <div className="empty"><div className="spinner" /><p style={{ marginTop: "1rem" }}>Loading…</p></div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <h3>{tasks.length === 0 ? "No tasks yet" : "No results"}</h3>
            <p>{tasks.length === 0 ? 'Click "New Task" to get started.' : "Try adjusting your filters."}</p>
          </div>
        ) : (
          <ul className="task-ul">
            {visible.map(task => (
              <TaskItem key={task.id} task={task}
                onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
                onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
