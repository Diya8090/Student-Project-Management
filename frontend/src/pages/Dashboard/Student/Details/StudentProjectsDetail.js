import { Link } from "react-router-dom";
import "./StudentProjectsDetail.css";

const PROJECT_DETAIL_INFO = {
  ProjectId: 1,
  ProjectTitle: "IoT Smart Home automation",
  Description: "A secure and efficient smart home automation gateway using MQTT protocols, integrated mobile dashboard controllers, and low-energy microcontroller modules.",
  FacultyName: "Prof. Sunita Rao",
  FacultyId: 202,
  coGuide: "Dr. Ramesh Kumar",
  StudentName: "Aarav Patel (You)",
  StudentId: 101,
  teamMembers: ["Aarav Patel (You) (#101)", "Rohan Gupta (#102)"],
  milestones: [
    { name: "Milestone 1: Project Proposal", status: "Approved", date: "2026-02-15" },
    { name: "Milestone 2: System Architecture Design", status: "Under Review", date: "2026-05-10" },
    { name: "Final Presentation: Prototype Demonstration", status: "Pending", date: "Pending" }
  ]
};

function StudentProjectsDetail() {
  return (
    <div className="student-projects-detail-container">
      <div className="details-header">
        <Link to="/student/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Project Specification File</h2>
        <p>Active project registrations, milestones, and supervision group profiles according to SPM_Project schema.</p>
      </div>

      <div className="details-card-wrapper">
        <div className="proj-card-header">
          <h3>{PROJECT_DETAIL_INFO.ProjectTitle}</h3>
          <span className="proj-status-badge">Active Status</span>
        </div>
        <div className="proj-card-body">
          <p className="proj-desc">{PROJECT_DETAIL_INFO.Description}</p>

          <div className="proj-supervisors-grid">
            <div className="supervisor-block">
              <span className="block-label">Primary Faculty Guide</span>
              <p><strong>{PROJECT_DETAIL_INFO.FacultyName}</strong></p>
            </div>
            <div className="supervisor-block">
              <span className="block-label">Co-Guide</span>
              <p><strong>{PROJECT_DETAIL_INFO.coGuide}</strong></p>
            </div>
          </div>

          <div className="team-members-block">
            <span className="block-label">Project Team Members</span>
            <div className="team-badges-row">
              {PROJECT_DETAIL_INFO.teamMembers.map((member, idx) => (
                <span key={idx} className="team-badge">{member}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProjectsDetail;
