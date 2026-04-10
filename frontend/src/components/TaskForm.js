import React, { useState, useEffect } from "react";
import { PRIORITIES, LABELS, TYPES, RECURRENCES } from "../constants";

const blank = { title: "", notes: "", priority: "medium", label: "personal", type: "task", recurrence: "none", dueDate: "", reminder: "" };

export default function TaskForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(blank);
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(initial ? {
      title:      initial.title,
      notes:      initial.notes      || "",
      priority:   initial.priority   || "medium",
      label:      initial.label      || "personal",
      type:       initial.type       || "task",
      recurrence: initial.recurrence || "none",
      dueDate:    initial.dueDate    ? initial.dueDate.slice(0, 10) : "",
      reminder:   initial.reminder   ? initial.reminder.slice(0, 16) : "",
    } : blank);
    setErr("");
  }, [initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title is required."); return; }
    setBusy(true);
    try {
      await onSave({
        ...form,
        dueDate:  form.dueDate  ? new Date(form.dueDate).toISOString()  : null,
        reminder: form.reminder ? new Date(form.reminder).toISOString() : null,
      });
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial ? "Edit Task" : "New Task"}</span>
          <button className="modal-close btn-icon btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit}>
          {/* Title */}
          <div className="field" style={{ marginBottom: "1rem" }}>
            <label>Title *</label>
            <input className="input" placeholder="What needs to be done?" value={form.title}
              onChange={e => set("title", e.target.value)} autoFocus />
          </div>

          {/* Notes */}
          <div className="field" style={{ marginBottom: "1rem" }}>
            <label>Notes</label>
            <textarea className="textarea" placeholder="Add details..." value={form.notes}
              onChange={e => set("notes", e.target.value)} />
          </div>

          {/* Type */}
          <div className="field" style={{ marginBottom: "1rem" }}>
            <label>Type</label>
            <div className="chip-group">
              {TYPES.map(t => (
                <button key={t.value} type="button"
                  className={`chip ${form.type === t.value ? "active" : ""}`}
                  onClick={() => set("type", t.value)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="field" style={{ marginBottom: "1rem" }}>
            <label>Priority</label>
            <div className="chip-group">
              {PRIORITIES.map(p => (
                <button key={p.value} type="button"
                  className={`chip ${form.priority === p.value ? "active" : ""}`}
                  style={form.priority === p.value ? { background: `${p.color}20`, borderColor: p.color, color: p.color } : {}}
                  onClick={() => set("priority", p.value)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div className="field" style={{ marginBottom: "1rem" }}>
            <label>Label</label>
            <div className="chip-group">
              {LABELS.map(l => (
                <button key={l.value} type="button"
                  className={`chip ${form.label === l.value ? "active" : ""}`}
                  onClick={() => set("label", l.value)}>
                  {l.icon} {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date + Reminder */}
          <div className="modal-grid">
            <div className="field">
              <label>Due Date</label>
              <input className="input" type="date" value={form.dueDate}
                onChange={e => set("dueDate", e.target.value)} />
            </div>
            <div className="field">
              <label>Reminder</label>
              <input className="input" type="datetime-local" value={form.reminder}
                onChange={e => set("reminder", e.target.value)} />
            </div>

            {/* Recurrence */}
            <div className="field full">
              <label>Recurrence</label>
              <select className="select" value={form.recurrence} onChange={e => set("recurrence", e.target.value)}>
                {RECURRENCES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {err && <p style={{ color: "var(--red)", fontSize: "0.83rem", marginTop: "0.75rem" }}>{err}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : initial ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
