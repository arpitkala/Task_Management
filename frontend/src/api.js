const BASE = "/tasks";

async function handle(res) {
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const msg = data.errors ? data.errors.join(" ") : "Something went wrong.";
    throw new Error(msg);
  }
  return data;
}

const json = (body) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export const fetchTasks  = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE}${q ? "?" + q : ""}`).then(handle);
};
export const fetchStats  = ()          => fetch(`${BASE}/stats`).then(handle);
export const createTask  = (body)      => fetch(BASE, json(body)).then(handle);
export const updateTask  = (id, body)  => fetch(`${BASE}/${id}`, { ...json(body), method: "PATCH" }).then(handle);
export const deleteTask  = (id)        => fetch(`${BASE}/${id}`, { method: "DELETE" }).then(handle);
export const reorderTasks = (ids)      => fetch(`${BASE}/reorder`, { ...json({ orderedIds: ids }), method: "PATCH" }).then(handle);
