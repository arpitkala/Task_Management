export const PRIORITIES = [
  { value: "high",   label: "High",   color: "#f87171" },
  { value: "medium", label: "Medium", color: "#f5a623" },
  { value: "low",    label: "Low",    color: "#34d399" },
];

export const LABELS = [
  { value: "personal", label: "Personal", icon: "👤" },
  { value: "work",     label: "Work",     icon: "💼" },
  { value: "shopping", label: "Shopping", icon: "🛒" },
  { value: "health",   label: "Health",   icon: "❤️" },
];

export const TYPES = [
  { value: "task",     label: "Task",     icon: "✓"  },
  { value: "reminder", label: "Reminder", icon: "⏰" },
  { value: "event",    label: "Event",    icon: "📅" },
];

export const RECURRENCES = [
  { value: "none",    label: "No recurrence" },
  { value: "daily",   label: "Daily"         },
  { value: "weekly",  label: "Weekly"        },
  { value: "monthly", label: "Monthly"       },
];

export function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function isOverdue(task) {
  return task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
}

export function dueSoonish(task) {
  if (!task.dueDate || task.completed) return false;
  const diff = new Date(task.dueDate) - new Date();
  return diff > 0 && diff < 86400000 * 2; // within 2 days
}
