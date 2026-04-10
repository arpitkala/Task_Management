import React, { useEffect, useState } from "react";
import { fetchStats } from "../api";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Filler);

const CHART_DEFAULTS = {
  plugins: { legend: { labels: { color: "#5a587a", font: { family: "Instrument Sans", size: 12 } } } },
  scales:  {
    x: { ticks: { color: "#9896b0" }, grid: { color: "rgba(26,26,62,0.05)" } },
    y: { ticks: { color: "#9896b0" }, grid: { color: "rgba(26,26,62,0.05)" }, beginAtZero: true }
  }
};

export default function Dashboard({ tasks }) {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, [tasks]); // refresh when tasks change

  if (loading) return <div className="empty"><div className="spinner" /></div>;
  if (!stats)  return <div className="empty"><p>Could not load stats.</p></div>;

  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Overdue tasks list
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="dashboard">
      {/* KPI cards */}
      <div className="kpi-grid">
        <KpiCard label="Total Tasks"  value={stats.total}     color="var(--indigo)" />
        <KpiCard label="Completed"    value={stats.completed} color="var(--green)" />
        <KpiCard label="Remaining"    value={stats.remaining} color="var(--amber)" />
        <KpiCard label="Overdue"      value={stats.overdue}   color="var(--red)" />
        <KpiCard label="Completion"   value={`${pct}%`}       color="var(--cyan)" wide />
      </div>

      {/* Progress bar */}
      <div className="dash-card">
        <h3 className="dash-card-title">Overall Progress</h3>
        <div className="big-progress-track">
          <div className="big-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-labels">
          <span>{stats.completed} done</span>
          <span>{pct}%</span>
          <span>{stats.remaining} left</span>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="chart-grid-2">
        {/* Tasks activity line */}
        <div className="dash-card">
          <h3 className="dash-card-title">Activity — last 7 days</h3>
          <Line
            data={{
              labels: stats.days.map(d => new Date(d.date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })),
              datasets: [{
                label: "Tasks created",
                data: stats.days.map(d => d.count),
                borderColor: "#1a1a3e",
                backgroundColor: "rgba(26,26,62,0.07)",
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: "#1a1a3e",
              }]
            }}
            options={{ ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } }}
          />
        </div>

        {/* Priority doughnut */}
        <div className="dash-card">
          <h3 className="dash-card-title">By Priority</h3>
          <div style={{ maxWidth: 260, margin: "0 auto" }}>
            <Doughnut
              data={{
                labels: ["High", "Medium", "Low"],
                datasets: [{
                  data: [stats.byPriority.high, stats.byPriority.medium, stats.byPriority.low],
                  backgroundColor: ["#f87171", "#f5a623", "#34d399"],
                  borderColor: "#faf8f4",
                  borderWidth: 3,
                }]
              }}
              options={{ plugins: CHART_DEFAULTS.plugins, cutout: "65%" }}
            />
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="chart-grid-2">
        {/* Label bar */}
        <div className="dash-card">
          <h3 className="dash-card-title">By Label</h3>
          <Bar
            data={{
              labels: ["Personal", "Work", "Shopping", "Health"],
              datasets: [{
                label: "Tasks",
                data: [stats.byLabel.personal, stats.byLabel.work, stats.byLabel.shopping, stats.byLabel.health],
                backgroundColor: ["rgba(108,116,248,0.7)", "rgba(34,211,238,0.7)", "rgba(245,166,35,0.7)", "rgba(52,211,153,0.7)"],
                borderRadius: 6,
              }]
            }}
            options={CHART_DEFAULTS}
          />
        </div>

        {/* Type bar */}
        <div className="dash-card">
          <h3 className="dash-card-title">By Type</h3>
          <Bar
            data={{
              labels: ["Task", "Reminder", "Event"],
              datasets: [{
                label: "Count",
                data: [stats.byType.task, stats.byType.reminder, stats.byType.event],
                backgroundColor: ["rgba(108,116,248,0.7)", "rgba(245,166,35,0.7)", "rgba(52,211,153,0.7)"],
                borderRadius: 6,
              }]
            }}
            options={CHART_DEFAULTS}
          />
        </div>
      </div>

      {/* Overdue table */}
      {overdueTasks.length > 0 && (
        <div className="dash-card">
          <h3 className="dash-card-title" style={{ color: "var(--red)" }}>⚠ Overdue Tasks</h3>
          <table className="overdue-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {overdueTasks.map(t => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                  <td style={{ color: "var(--red)" }}>{new Date(t.dueDate).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${t.label}`}>{t.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color, wide }) {
  return (
    <div className={`kpi-card ${wide ? "kpi-wide" : ""}`} style={{ borderTop: `2px solid ${color}` }}>
      <span className="kpi-value" style={{ color }}>{value}</span>
      <span className="kpi-label">{label}</span>
    </div>
  );
}
