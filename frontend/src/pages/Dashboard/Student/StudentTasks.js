import { useState, useEffect } from "react";
import "./StudentTasks.css";

const DEFAULT_SPM_TASKS = [
  { TaskId: 1, AllocationID: 401, TaskTitle: "Establish Database Schema", TaskDescription: "Design SQL table entities and relationships", TaskStatus: 3, PriorityID: 1, AssignedScore: 10.00, EarnedScore: 10.00, ProgressPercentage: 100.00, StartDate: "2026-06-01", DueDate: "2026-06-25", CompletedDate: "2026-06-24", FacultyRemarks: "Exemplary relational structures.", StudentRemarks: "Fully satisfied parameters." },
  { TaskId: 2, AllocationID: 401, TaskTitle: "Build Authentication Modules", TaskDescription: "Implement JWT & BCrypt password hashing", TaskStatus: 2, PriorityID: 1, AssignedScore: 15.00, EarnedScore: 0.00, ProgressPercentage: 65.00, StartDate: "2026-07-01", DueDate: "2026-07-20", CompletedDate: "", FacultyRemarks: "Ensure refresh tokens expire after 7 days.", StudentRemarks: "Drafted controller routes." },
  { TaskId: 3, AllocationID: 401, TaskTitle: "Frontend Component Layout", TaskDescription: "Create React components for Dashboard & Tables", TaskStatus: 2, PriorityID: 2, AssignedScore: 12.00, EarnedScore: 0.00, ProgressPercentage: 40.00, StartDate: "2026-07-05", DueDate: "2026-07-28", CompletedDate: "", FacultyRemarks: "", StudentRemarks: "Sidebar and top bar finished." },
  { TaskId: 4, AllocationID: 401, TaskTitle: "Draft Technical Report PDF", TaskDescription: "Write architecture documentation in LaTeX", TaskStatus: 1, PriorityID: 3, AssignedScore: 10.00, EarnedScore: 0.00, ProgressPercentage: 0.00, StartDate: "2026-07-15", DueDate: "2026-08-05", CompletedDate: "", FacultyRemarks: "", StudentRemarks: "" }
];

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
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("spm_tasks_store");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_SPM_TASKS;
      }
    }
    localStorage.setItem("spm_tasks_store", JSON.stringify(DEFAULT_SPM_TASKS));
    return DEFAULT_SPM_TASKS;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("spm_tasks_store");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {}
      }
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
        <p>Read-only view of project tasks assigned by your faculty guide according to SPM schema.</p>
      </div>

      <div className="tasks-board-card full-width-card">
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
            {tasks.map((task) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentTasks;
