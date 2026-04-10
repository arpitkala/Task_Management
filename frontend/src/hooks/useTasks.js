import { useState, useEffect, useCallback } from "react";
import { fetchTasks, createTask, updateTask, deleteTask, reorderTasks } from "../api";

export function useTasks() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetchTasks()
      .then(setTasks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add(data) {
    const task = await createTask(data);
    setTasks(prev => [task, ...prev]);
    return task;
  }

  async function update(id, data) {
    const updated = await updateTask(id, data);
    // If a recurring task was completed, a new one may have been generated — reload
    if (data.completed === true) {
      load();
    } else {
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    }
    return updated;
  }

  async function remove(id) {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function reorder(orderedIds) {
    setTasks(prev => {
      const map = Object.fromEntries(prev.map(t => [t.id, t]));
      return orderedIds.map((id, i) => ({ ...map[id], order: i })).filter(Boolean);
    });
    await reorderTasks(orderedIds);
  }

  return { tasks, loading, error, setError, add, update, remove, reorder, reload: load };
}
