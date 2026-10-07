import { Link } from "react-router-dom";
import "./FacultyProjectsDetail.css";

const PROJECTS_DETAIL_LIST = [
  { ProjectId: 1, ProjectTitle: "IoT Smart Home automation", StudentName: "Aarav Patel", StudentId: 101, milestone: "Milestone 2", ProjectStatus: 3 },
  { ProjectId: 2, ProjectTitle: "E-Commerce Web Portal", StudentName: "Neha Sharma", StudentId: 102, milestone: "Milestone 1", ProjectStatus: 1 },
  { ProjectId: 3, ProjectTitle: "Machine Learning Crop Predictor", StudentName: "Kunal Sen", StudentId: 106, milestone: "Final Presentation", ProjectStatus: 2 },
  { ProjectId: 4, ProjectTitle: "Cybersecurity Threat Analyzer", StudentName: "Meera Nair", StudentId: 108, milestone: "Milestone 2", ProjectStatus: 4 }
];

const STATUS_MAP = {
  1: "In Progress",
  2: "Completed",
  3: "Under Review",
  4: "Delayed"
};

function FacultyProjectsDetail() {
  return (
    <div className="faculty-projects-detail-container">
      <div className="details-header">
        <Link to="/faculty/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Assigned Projects Directory</h2>
        <p>Comprehensive list of project groups under your supervision according to SPM schema.</p>
      </div>

      <div className="details-table-card">
        <table className="details-table">
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Assigned Student</th>
              <th>Current Milestone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS_DETAIL_LIST.map((proj) => (
              <tr key={proj.ProjectId}>
                <td><strong>{proj.ProjectTitle}</strong></td>
                <td>{proj.StudentName}</td>
                <td><span className="milestone-pill">{proj.milestone}</span></td>
                <td>
                  <span className={`status-badge-pill status-${STATUS_MAP[proj.ProjectStatus].toLowerCase().replace(" ", "-")}`}>
                    {STATUS_MAP[proj.ProjectStatus]}
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

export default FacultyProjectsDetail;
