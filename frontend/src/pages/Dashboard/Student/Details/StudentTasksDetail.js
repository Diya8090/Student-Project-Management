import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentTasksDetail.css";
import { tasksApi, unwrapData } from "../../../../services/api";

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

function StudentTasksDetail() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const res = await tasksApi.getAll();
        const rawTasks = unwrapData(res) || [];

        const normalized = rawTasks.map((t) => ({
          TaskId: t.taskId || t.TaskId,
          TaskTitle: t.taskTitle || t.TaskTitle,
          PriorityID: t.priorityID || t.PriorityID || 2,
          DueDate: t.dueDate ? (typeof t.dueDate === "string" ? t.dueDate.split("T")[0] : t.dueDate) : "No date",
          ProgressPercentage: Number(t.progressPercentage || t.ProgressPercentage || 0),
          TaskStatus: t.taskStatus || t.TaskStatus || 1
        }));

        setTasks(normalized);
      } catch (e) {
        console.warn("Could not load student tasks detail:", e);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  return (
    <div className="student-tasks-detail-container">
      <div className="details-header">
        <Link to="/student/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Task Workload Registry</h2>
        <p>Allocated task milestones, dates, and priorities status according to live SPM database.</p>
      </div>

      <div className="details-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading task registry...</div>
        ) : (
          <table className="details-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.TaskId}>
                    <td><strong>{task.TaskTitle}</strong></td>
                    <td>
                      <span className={`priority-badge priority-${(PRIORITY_MAP[task.PriorityID] || "medium").toLowerCase()}`}>
                        {PRIORITY_MAP[task.PriorityID] || "Medium"}
                      </span>
                    </td>
                    <td>{task.DueDate}</td>
                    <td>{task.ProgressPercentage}%</td>
                    <td>
                      <span className={`status-badge-pill task-status-${(STATUS_MAP[task.TaskStatus] || "pending").toLowerCase().replace(" ", "-")}`}>
                        {STATUS_MAP[task.TaskStatus] || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No tasks assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentTasksDetail;
