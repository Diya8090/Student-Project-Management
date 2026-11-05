import { useState, useEffect } from "react";
import "./StudentTasks.css";
import { tasksApi, projectsApi, unwrapData } from "../../../services/api";

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

function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, projsRes] = await Promise.all([
        tasksApi.getAll(),
        projectsApi.getAll()
      ]);

      const rawTasks = unwrapData(tasksRes) || [];
      const rawProjs = unwrapData(projsRes) || [];

      const savedUser = localStorage.getItem("currentUser");
      let studentId = null;
      if (savedUser) {
        try {
          studentId = JSON.parse(savedUser).userId;
        } catch (e) {}
      }

      // Filter tasks by student's projects if available
      const myProjs = studentId && rawProjs.some(p => (p.studentId || p.StudentId) === studentId)
        ? rawProjs.filter(p => (p.studentId || p.StudentId) === studentId)
        : rawProjs;

      const myProjIds = new Set(myProjs.map(p => p.projectId || p.ProjectId));
      const relevant = rawTasks.filter(t => myProjIds.has(t.allocationID || t.AllocationID || t.allocationId));
      const finalTasks = relevant.length > 0 ? relevant : rawTasks;

      const normalized = finalTasks.map((t) => ({
        TaskId: t.taskId || t.TaskId,
        AllocationID: t.allocationID || t.AllocationID || t.allocationId,
        TaskTitle: t.taskTitle || t.TaskTitle,
        TaskDescription: t.taskDescription || t.TaskDescription || "No description provided.",
        TaskStatus: t.taskStatus || t.TaskStatus || 1,
        PriorityID: t.priorityID || t.PriorityID || 2,
        AssignedScore: Number(t.assignedScore || t.AssignedScore || 0),
        EarnedScore: Number(t.earnedScore || t.EarnedScore || 0),
        ProgressPercentage: Number(t.progressPercentage || t.ProgressPercentage || 0),
        DueDate: t.dueDate ? (typeof t.dueDate === "string" ? t.dueDate.split("T")[0] : t.dueDate) : "No due date"
      }));

      setTasks(normalized);
    } catch (err) {
      console.error("Failed to load student tasks:", err);
      const saved = localStorage.getItem("spm_tasks_store");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    const handleStorageChange = () => {
      loadTasks();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("spm_tasks_updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("spm_tasks_updated", handleStorageChange);
    };
  }, []);

  return (
    <div className="student-tasks-container">
      <div className="page-header">
        <h2>My Assigned Tasks</h2>
        <p>Live view of project tasks assigned by your faculty guide according to SPM database schema.</p>
      </div>

      <div className="tasks-board-card full-width-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading assigned tasks...</div>
        ) : (
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Deadline Due</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.TaskId}>
                    <td className="task-name"><strong>{task.TaskTitle}</strong></td>
                    <td>{task.TaskDescription}</td>
                    <td>
                      <span className={`priority-badge-tag priority-${(PRIORITY_MAP[task.PriorityID] || "Medium").toLowerCase()}`}>
                        {PRIORITY_MAP[task.PriorityID] || "Medium"}
                      </span>
                    </td>
                    <td>{task.DueDate}</td>
                    <td>{task.ProgressPercentage}%</td>
                    <td>
                      <span className={`status-badge-pill task-status-${(STATUS_MAP[task.TaskStatus] || "Pending").toLowerCase().replace(" ", "-")}`}>
                        {STATUS_MAP[task.TaskStatus] || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No assigned tasks found.
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

export default StudentTasks;
