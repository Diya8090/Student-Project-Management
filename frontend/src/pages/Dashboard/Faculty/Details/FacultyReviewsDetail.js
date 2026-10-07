import { Link } from "react-router-dom";
import "./FacultyReviewsDetail.css";

const SUBMISSIONS_DETAIL_LIST = [
  { TaskId: 1, TaskTitle: "Implement Auth Guards", TaskDescription: "Design SQL table entities and relationships", StudentName: "Aarav Patel", StudentId: 101, ProjectTitle: "IoT Smart Home automation", milestone: "Milestone 2", fileName: "M2_Architecture_Draft.pdf", date: "2026-07-08", TaskStatus: 3 },
  { TaskId: 2, TaskTitle: "Integrate Payment Gateway API", TaskDescription: "Connect Stripe hooks callbacks", StudentName: "Neha Sharma", StudentId: 102, ProjectTitle: "E-Commerce Web Portal", milestone: "Milestone 1", fileName: "M1_Wireframes_UI_Mock.pdf", date: "2026-07-07", TaskStatus: 3 },
  { TaskId: 3, TaskTitle: "Verify Inverter Grid Synchronization Data", TaskDescription: "Audit grid sync frequency data", StudentName: "Meera Nair", StudentId: 108, ProjectTitle: "Cybersecurity Threat Analyzer", milestone: "Milestone 2", fileName: "M2_Network_Security_Models.docx", date: "2026-07-06", TaskStatus: 3 }
];

const STATUS_MAP = {
  1: "Pending",
  2: "In Progress",
  3: "Completed",
  4: "Rejected"
};

function FacultyReviewsDetail() {
  return (
    <div className="faculty-reviews-detail-container">
      <div className="details-header">
        <Link to="/faculty/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Pending Submissions Directory</h2>
        <p>List of milestone documents submitted by your students awaiting evaluation according to SPM_Task schema.</p>
      </div>

      <div className="details-table-card">
        <table className="details-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Project Topic</th>
              <th>Task Title</th>
              <th>File Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SUBMISSIONS_DETAIL_LIST.map((sub) => (
              <tr key={sub.TaskId}>
                <td><strong>{sub.StudentName}</strong></td>
                <td>{sub.ProjectTitle}</td>
                <td>{sub.TaskTitle}</td>
                <td><span className="file-name-pill">{sub.fileName}</span></td>
                <td>
                  <span className={`status-badge-pill review-status-${STATUS_MAP[sub.TaskStatus].toLowerCase().replace(" ", "-")}`}>
                    {STATUS_MAP[sub.TaskStatus]}
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

export default FacultyReviewsDetail;
