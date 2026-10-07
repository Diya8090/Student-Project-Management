import "./StudentProjects.css";

const PROJECT_DETAILS = {
  ProjectId: 1,
  ProjectTitle: "IoT Smart Home automation",
  Description: "A secure and efficient smart home automation gateway using MQTT protocols, integrated mobile dashboard controllers, and low-energy microcontroller modules.",
  FacultyName: "Prof. Sunita Rao",
  FacultyId: 202,
  coGuide: "Dr. Ramesh Kumar",
  StudentName: "Aarav Patel (You)",
  StudentId: 101,
  teamMembers: ["Aarav Patel (You)", "Rohan Gupta"],
  milestones: [
    { name: "Milestone 1: Project Proposal", status: "Approved", date: "2026-02-15" },
    { name: "Milestone 2: System Architecture Design", status: "Under Review", date: "2026-05-10" },
    { name: "Final Presentation: Prototype Demonstration", status: "Pending", date: "Pending" }
  ]
};

function StudentProjects() {
  return (
    <div className="student-projects-container">
      <div className="page-header">
        <h2>My Projects</h2>
        <p>View detail specifications, supervision groups, and milestone completion status for your registered project according to SPM_Project schema.</p>
      </div>

      <div className="project-detail-card">
        <div className="proj-card-header">
          <h3>{PROJECT_DETAILS.ProjectTitle}</h3>
          <span className="proj-status-badge">Active Project</span>
        </div>
        <div className="proj-card-body">
          <p className="proj-desc">{PROJECT_DETAILS.Description}</p>

          <div className="proj-supervisors-grid">
            <div className="supervisor-block">
              <span className="block-label">Primary Faculty Guide</span>
              <p><strong>{PROJECT_DETAILS.FacultyName}</strong></p>
            </div>
            <div className="supervisor-block">
              <span className="block-label">Co-Guide</span>
              <p><strong>{PROJECT_DETAILS.coGuide}</strong></p>
            </div>
          </div>

          <div className="team-members-block">
            <span className="block-label">Project Team Members</span>
            <div className="team-badges-row">
              {PROJECT_DETAILS.teamMembers.map((member, idx) => (
                <span key={idx} className="team-badge">{member}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone tracking timeline card */}
      <div className="project-detail-card milestones-card">
        <div className="proj-card-header">
          <h3>Project Completion Milestones</h3>
        </div>
        <div className="milestones-timeline">
          {PROJECT_DETAILS.milestones.map((m, idx) => (
            <div key={idx} className="timeline-node-item">
              <div className="node-marker-col">
                <span className={`node-marker status-${m.status.toLowerCase().replace(" ", "-")}`}></span>
                {idx < PROJECT_DETAILS.milestones.length - 1 && <span className="timeline-connector-line"></span>}
              </div>
              <div className="node-info-col">
                <strong>{m.name}</strong>
                <span className={`node-status status-text-${m.status.toLowerCase().replace(" ", "-")}`}>
                  {m.status} ({m.date})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentProjects;
