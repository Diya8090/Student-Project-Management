import { Link } from "react-router-dom";
import "./StudentTasksDetail.css";

const TASKS_DETAIL_LIST = [
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

function StudentTasksDetail() {
  return (
    <div className="student-tasks-detail-container">
      <div className="details-header">
        <Link to="/student/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Task Workload Registry</h2>
        <p>Allocated task milestones, dates, and priorities status according to SPM_Task schema.</p>
      </div>

      <div className="details-table-card">
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
            {TASKS_DETAIL_LIST.map((task) => (
              <tr key={task.TaskId}>
                <td><strong>{task.TaskTitle}</strong></td>
                <td>
                  <span className={`priority-badge priority-${PRIORITY_MAP[task.PriorityID].toLowerCase()}`}>
                    {PRIORITY_MAP[task.PriorityID]}
                  </span>
                </td>
                <td>{task.DueDate}</td>
                <td>{task.ProgressPercentage}%</td>
                <td>
                  <span className={`status-badge-pill task-status-${STATUS_MAP[task.TaskStatus].toLowerCase().replace(" ", "-")}`}>
                    {STATUS_MAP[task.TaskStatus]}
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

export default StudentTasksDetail;
