import { Link } from "react-router-dom";
import "./StudentCompletedTasksDetail.css";

const COMPLETED_TASKS_LIST = [
  { TaskId: 1, AllocationID: 401, TaskTitle: "Implement Auth Guards", TaskDescription: "Design SQL table entities and relationships", TaskStatus: 2, PriorityID: 1, AssignedScore: 10.00, EarnedScore: 10.00, ProgressPercentage: 100.00, StartDate: "2026-06-01", DueDate: "2026-07-15", CompletedDate: "2026-07-14", FacultyRemarks: "Exemplary implementation.", StudentRemarks: "Fully satisfied parameters." },
  { TaskId: 4, AllocationID: 401, TaskTitle: "Define Milestone 2 deliverables doc", TaskDescription: "Draft LaTeX reports", TaskStatus: 2, PriorityID: 2, AssignedScore: 10.00, EarnedScore: 10.00, ProgressPercentage: 100.00, StartDate: "2026-07-10", DueDate: "2026-07-28", CompletedDate: "2026-07-27", FacultyRemarks: "", StudentRemarks: "" }
];

const PRIORITY_MAP = {
  1: "High",
  2: "Medium",
  3: "Low"
};

function StudentCompletedTasksDetail() {
  return (
    <div className="student-completed-tasks-detail-container">
      <div className="details-header">
        <Link to="/student/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Completed Tasks Registry</h2>
        <p>Archive directory of completed tasks and workload segments according to SPM_Task schema.</p>
      </div>

      <div className="details-table-card">
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
            {COMPLETED_TASKS_LIST.map((task) => (
              <tr key={task.TaskId}>
                <td><strong>{task.TaskTitle}</strong></td>
                <td>
                  <span className={`priority-badge priority-${PRIORITY_MAP[task.PriorityID].toLowerCase()}`}>
                    {PRIORITY_MAP[task.PriorityID]}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentCompletedTasksDetail;
