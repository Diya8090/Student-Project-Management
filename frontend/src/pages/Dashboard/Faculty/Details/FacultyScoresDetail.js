import { Link } from "react-router-dom";
import "./FacultyScoresDetail.css";

const SCORES_DETAIL_LIST = [
  { TaskId: 1, StudentName: "Aarav Patel", StudentId: 101, ProjectTitle: "IoT Smart Home automation", AssignedScore: 30.00, EarnedScore: 26.00, milestone: "Milestone 1" },
  { TaskId: 2, StudentName: "Rohan Gupta", StudentId: 102, ProjectTitle: "IoT Smart Home automation", AssignedScore: 30.00, EarnedScore: 25.00, milestone: "Milestone 1" },
  { TaskId: 3, StudentName: "Neha Sharma", StudentId: 103, ProjectTitle: "E-Commerce Web Portal", AssignedScore: 30.00, EarnedScore: 22.00, milestone: "Milestone 1" },
  { TaskId: 4, StudentName: "Kunal Sen", StudentId: 104, ProjectTitle: "Machine Learning Crop Predictor", AssignedScore: 40.00, EarnedScore: 37.00, milestone: "Presentation" },
  { TaskId: 5, StudentName: "Ishita Roy", StudentId: 105, ProjectTitle: "Machine Learning Crop Predictor", AssignedScore: 40.00, EarnedScore: 38.00, milestone: "Presentation" }
];

function FacultyScoresDetail() {
  return (
    <div className="faculty-scores-detail-container">
      <div className="details-header">
        <Link to="/faculty/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Evaluation Grades Roster</h2>
        <p>Breakdown summary of points recorded for milestones deliverables according to SPM_Task schema.</p>
      </div>

      <div className="details-table-card">
        <table className="details-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Project Topic</th>
              <th>Milestone Stage</th>
              <th>Marks Obtained (EarnedScore)</th>
              <th>Max Score (AssignedScore)</th>
            </tr>
          </thead>
          <tbody>
            {SCORES_DETAIL_LIST.map((s) => (
              <tr key={s.TaskId}>
                <td><strong>{s.StudentName}</strong></td>
                <td>{s.ProjectTitle}</td>
                <td>{s.milestone}</td>
                <td><strong className="cumulative-total-value">{s.EarnedScore}</strong></td>
                <td>{s.AssignedScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacultyScoresDetail;
