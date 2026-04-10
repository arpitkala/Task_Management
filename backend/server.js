const express = require("express");
const cors    = require("cors");
const { randomUUID } = require("crypto");

const app  = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ─── In-memory store ───────────────────────────────────────────────────────
let tasks = [];

// ─── Helpers ───────────────────────────────────────────────────────────────
const VALID_PRIORITIES  = ["low", "medium", "high"];
const VALID_LABELS      = ["personal", "work", "shopping", "health"];
const VALID_TYPES       = ["task", "reminder", "event"];
const VALID_RECURRENCES = ["none", "daily", "weekly", "monthly"];

function validate(body, requireTitle = true) {
  const errors = [];
  if (requireTitle && (!body.title || !body.title.trim())) errors.push("Title is required.");
  if (body.priority  && !VALID_PRIORITIES.includes(body.priority))   errors.push("Invalid priority.");
  if (body.label     && !VALID_LABELS.includes(body.label))          errors.push("Invalid label.");
  if (body.type      && !VALID_TYPES.includes(body.type))            errors.push("Invalid type.");
  if (body.recurrence && !VALID_RECURRENCES.includes(body.recurrence)) errors.push("Invalid recurrence.");
  if (body.dueDate && isNaN(Date.parse(body.dueDate)))               errors.push("Invalid dueDate.");
  if (body.reminder && isNaN(Date.parse(body.reminder)))             errors.push("Invalid reminder.");
  return errors;
}

function makeNextRecurrence(task) {
  if (!task.dueDate || task.recurrence === "none") return null;
  const d = new Date(task.dueDate);
  if (task.recurrence === "daily")   d.setDate(d.getDate() + 1);
  if (task.recurrence === "weekly")  d.setDate(d.getDate() + 7);
  if (task.recurrence === "monthly") d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

// ─── Routes ────────────────────────────────────────────────────────────────

// GET /tasks — filter by status, label, type, priority
app.get("/tasks", (req, res) => {
  let result = [...tasks];
  const { status, label, type, priority } = req.query;
  if (status === "active")    result = result.filter(t => !t.completed);
  if (status === "completed") result = result.filter(t => t.completed);
  if (label)    result = result.filter(t => t.label    === label);
  if (type)     result = result.filter(t => t.type     === type);
  if (priority) result = result.filter(t => t.priority === priority);
  res.json(result);
});

// GET /tasks/stats — dashboard data
app.get("/tasks/stats", (req, res) => {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const overdue   = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length;

  const byPriority = { high: 0, medium: 0, low: 0 };
  const byLabel    = { personal: 0, work: 0, shopping: 0, health: 0 };
  const byType     = { task: 0, reminder: 0, event: 0 };

  tasks.forEach(t => {
    if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
    if (byLabel[t.label]       !== undefined) byLabel[t.label]++;
    if (byType[t.type]         !== undefined) byType[t.type]++;
  });

  // Tasks created per day for last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: tasks.filter(t => t.createdAt.slice(0, 10) === key).length });
  }

  res.json({ total, completed, overdue, remaining: total - completed, byPriority, byLabel, byType, days });
});

// POST /tasks
app.post("/tasks", (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const task = {
    id:         randomUUID(),
    title:      req.body.title.trim(),
    completed:  false,
    priority:   req.body.priority   || "medium",
    label:      req.body.label      || "personal",
    type:       req.body.type       || "task",
    recurrence: req.body.recurrence || "none",
    dueDate:    req.body.dueDate    || null,
    reminder:   req.body.reminder   || null,
    notes:      req.body.notes      || "",
    order:      tasks.length,
    createdAt:  new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json(task);
});

// PATCH /tasks/:id
app.patch("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ errors: ["Task not found."] });

  const errors = validate(req.body, false);
  if (errors.length) return res.status(400).json({ errors });

  const fields = ["title","completed","priority","label","type","recurrence","dueDate","reminder","notes"];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      task[f] = f === "title" ? req.body[f].trim() : req.body[f];
    }
  });

  // Auto-generate next occurrence when completing a recurring task
  if (req.body.completed === true && task.recurrence !== "none") {
    const nextDue = makeNextRecurrence(task);
    if (nextDue) {
      const clone = {
        ...task,
        id:        randomUUID(),
        completed: false,
        dueDate:   nextDue,
        order:     tasks.length,
        createdAt: new Date().toISOString(),
      };
      tasks.push(clone);
    }
  }

  res.json(task);
});

// PATCH /tasks/reorder — bulk reorder
app.patch("/tasks/reorder", (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) return res.status(400).json({ errors: ["orderedIds must be an array."] });
  orderedIds.forEach((id, idx) => {
    const t = tasks.find(t => t.id === id);
    if (t) t.order = idx;
  });
  tasks.sort((a, b) => a.order - b.order);
  res.json({ success: true });
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ errors: ["Task not found."] });
  tasks.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`TaskFlow API → http://localhost:${PORT}`));
