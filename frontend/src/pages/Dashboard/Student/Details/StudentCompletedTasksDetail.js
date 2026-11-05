import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentCompletedTasksDetail.css";
import { tasksApi, unwrapData } from "../../../../services/api";

const PRIORITY_MAP = {
  1: "High",
  2: "Medium",
  3: "Low"
};

function StudentCompletedTasksDetail() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const res = await tasksApi.getAll();
        const rawTasks = unwrapData(res) || [];

        const completed = rawTasks
          .filter(t => (t.taskStatus || t.TaskStatus) === 3 || (t.progressPercentage || t.ProgressPercentage) >= 100)
          .map((t) => ({
            TaskId: t.taskId || t.TaskId,
            TaskTitle: t.taskTitle || t.TaskTitle,
            PriorityID: t.priorityID || t.PriorityID || 2,
            DueDate: t.dueDate ? (typeof t.dueDate === "string" ? t.dueDate.split("T")[0] : t.dueDate) : "Completed",
            CompletedDate: t.completedDate ? (typeof t.completedDate === "string" ? t.completedDate.split("T")[0] : t.completedDate) : "Recently Completed"
          }));

        setTasks(completed);
      } catch (e) {
        console.warn("Could not load completed tasks detail:", e);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  return (
    <div className="student-completed-tasks-detail-container">
      <div className="details-header">
        <Link to="/student/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Completed Tasks Registry</h2>
        <p>Archive directory of completed tasks and workload segments according to live SPM database.</p>
      </div>

      <div className="details-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading completed tasks...</div>
        ) : (
          <table className="details-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Completed Date</th>
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
                    <td>{task.CompletedDate}</td>
                    <td>
                      <span className="status-badge-pill task-status-completed">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No completed tasks recorded yet.
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

export default StudentCompletedTasksDetail;
