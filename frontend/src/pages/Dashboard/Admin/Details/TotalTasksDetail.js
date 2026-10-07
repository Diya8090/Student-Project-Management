import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TotalTasksDetail.css";

const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

const STATUS_MAP = {
  1: "Pending",
  2: "In Progress",
  3: "Completed",
  4: "Rejected"
};

const PRIORITY_MAP = {
  1: "High",
  2: "Medium",
  3: "Low"
};

function TotalTasksDetail() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${PRIMARY_API_BASE}${endpoint}`, options);
      return res;
    } catch {
      const res = await fetch(`${FALLBACK_API_BASE}${endpoint}`, options);
      return res;
    }
  }, []);

  useEffect(() => {
    fetchApi("/Task")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching tasks in detail view:", err);
        setLoading(false);
      });
  }, [fetchApi]);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.TaskTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.ProjectName || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === "All" || t.PriorityID === parseInt(priorityFilter);

    return matchesSearch && matchesPriority;
  });

  // Calculate totals
  const total = tasks.length;
  const high = tasks.filter(t => t.PriorityID === 1).length;
  const medium = tasks.filter(t => t.PriorityID === 2).length;
  const low = tasks.filter(t => t.PriorityID === 3).length;

  return (
    <div className="tasks-detail-container">
      <div className="detail-navigation-bar">
        <Link to="/admin/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="detail-page-header">
        <h2>System Task Board</h2>
        <p>Unified directory of all milestone tasks, priority markers, target deadlines, and progress according to SPM schema.</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-stats-cards">
        <div className="stat-summary-card">
          <span className="summary-title">Total Tasks</span>
          <span className="summary-value">{total}</span>
        </div>
        <div className="stat-summary-card high-border">
          <span className="summary-title">High Priority</span>
          <span className="summary-value">{high}</span>
        </div>
        <div className="stat-summary-card medium-border">
          <span className="summary-title">Medium Priority</span>
          <span className="summary-value">{medium}</span>
        </div>
        <div className="stat-summary-card low-border">
          <span className="summary-title">Low Priority</span>
          <span className="summary-value">{low}</span>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="directory-filters">
        <div className="search-box-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks name or project titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="1">1 - High</option>
            <option value="2">2 - Medium</option>
            <option value="3">3 - Low</option>
          </select>
        </div>
      </div>

      <div className="details-table-card">
        <table className="details-table">
          <thead>
            <tr>
              <th>Task Details</th>
              <th>Related Project</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Progress</th>
              <th>Score (Max)</th>
              <th>Task Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(t => {
                const tId = t.taskId || t.TaskId || t.id;
                const title = t.taskTitle || t.TaskTitle || "Milestone Task";
                const projName = t.projectTitle || t.ProjectTitle || t.projectName || t.ProjectName || "SPM Project";
                const dueDate = t.dueDate ? String(t.dueDate).split("T")[0] : "No date";
                const priorityId = t.priorityID ?? t.PriorityID ?? 2;
                const priorityName = t.priorityName || t.PriorityName || PRIORITY_MAP[priorityId] || "Medium";
                const pClass = priorityName.toLowerCase();
                const progress = t.progressPercentage ?? t.ProgressPercentage ?? 50;
                const earned = t.earnedScore ?? t.EarnedScore ?? 0;
                const assigned = t.assignedScore ?? t.AssignedScore ?? 10;
                const st = t.taskStatus ?? t.TaskStatus ?? 1;
                const stName = t.statusName || t.StatusName || STATUS_MAP[st] || "In Progress";
                const stClass = stName.toLowerCase().replace(/\s+/g, "");

                return (
                  <tr key={tId}>
                    <td>
                      <span className="task-table-name" title={title}>{title}</span>
                    </td>
                    <td>
                      <span className="task-table-project">{projName}</span>
                    </td>
                    <td>
                      <span className="task-table-deadline">{dueDate}</span>
                    </td>
                    <td>
                      <span className={`priority-badge p-badge-${pClass}`}>
                        {priorityName}
                      </span>
                    </td>
                    <td>
                      <div className="progress-bar-track" style={{ width: "80px", display: "inline-block", marginRight: "8px" }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: st === 2 || stName.toLowerCase().includes("completed") ? "#10b981" : "#3b82f6",
                            height: "6px",
                            borderRadius: "4px"
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: "12px" }}>{progress}%</span>
                    </td>
                    <td>
                      {earned} / {assigned}
                    </td>
                    <td>
                      <span className={`task-status-pill ts-pill-${stClass}`}>
                        {stName}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-records-cell">
                  No tasks match your filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TotalTasksDetail;
