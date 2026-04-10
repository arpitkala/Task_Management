import React, { useRef } from "react";
import { formatDate, formatDateTime, isOverdue, dueSoonish } from "../constants";

export default function TaskItem({ task, onToggle, onEdit, onDelete, onDragStart, onDragOver, onDrop }) {
  const ref = useRef(null);

  const overdue  = isOverdue(task);
  const soon     = dueSoonish(task);
  const reminder = formatDateTime(task.reminder);
  const due      = formatDate(task.dueDate);

  return (
    <li
      ref={ref}
      className={`task-row ${task.completed ? "task-done" : ""} ${overdue ? "task-overdue" : ""}`}
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onDragOver={e => { e.preventDefault(); onDragOver(e, task.id); }}
      onDrop={e => onDrop(e, task.id)}
    >
      {/* Drag handle */}
      <span className="drag-handle" title="Drag to reorder">⠿</span>

      {/* Checkbox */}
      <button
        className={`check-btn ${task.completed ? "check-done" : ""}`}
        onClick={() => onToggle(task)}
        title={task.completed ? "Mark incomplete" : "Mark complete"}>
        {task.completed && "✓"}
      </button>

      {/* Body */}
      <div className="task-body">
        <div className="task-top-row">
          <span className="task-title">{task.title}</span>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <span className={`badge badge-${task.label}`}>{task.label}</span>
          {task.recurrence !== "none" && (
            <span className="recurrence-tag">↻ {task.recurrence}</span>
          )}
        </div>

        {task.notes && <p className="task-notes">{task.notes}</p>}

        <div className="task-meta-row">
          {due && (
            <span className={`meta-chip ${overdue ? "meta-overdue" : soon ? "meta-soon" : ""}`}>
              📅 {overdue ? "Overdue · " : soon ? "Due soon · " : ""}{due}
            </span>
          )}
          {reminder && <span className="meta-chip">⏰ {reminder}</span>}
          <span className="meta-chip type-chip">
            {task.type === "task" ? "✓" : task.type === "reminder" ? "⏰" : "📅"} {task.type}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="task-row-actions">
        <button className="row-action-btn" onClick={() => onEdit(task)} title="Edit">✎</button>
        <button className="row-action-btn danger" onClick={() => onDelete(task.id)} title="Delete">🗑</button>
      </div>
    </li>
  );
}
