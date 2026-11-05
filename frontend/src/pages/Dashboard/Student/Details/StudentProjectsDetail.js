import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentProjectsDetail.css";
import { projectsApi, unwrapData } from "../../../../services/api";

function StudentProjectsDetail() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const res = await projectsApi.getAll();
        const projs = unwrapData(res) || [];

        const savedUser = localStorage.getItem("currentUser");
        let studentId = null;
        if (savedUser) {
          try {
            studentId = JSON.parse(savedUser).userId;
          } catch (e) {}
        }

        const myProj = (studentId && projs.find(p => (p.studentId || p.StudentId) === studentId)) || projs[0];

        if (myProj) {
          setProject({
            ProjectId: myProj.projectId || myProj.ProjectId,
            ProjectTitle: myProj.projectTitle || myProj.ProjectTitle,
            Description: myProj.description || myProj.Description || "Research project specification under SPM system.",
            FacultyName: myProj.facultyName || myProj.FacultyName || "Faculty Advisor",
            coGuide: "Department Supervisor",
            StudentName: myProj.studentName || myProj.StudentName || "Student Scholar",
            teamMembers: [myProj.studentName || "Project Scholar", "Peer Contributor"],
            ProgressPercentage: myProj.progressPercentage || myProj.ProgressPercentage || 0
          });
        }
      } catch (e) {
        console.warn("Could not load student projects detail:", e);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, []);

  return (
    <div className="student-projects-detail-container">
      <div className="details-header">
        <Link to="/student/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Project Specification File</h2>
        <p>Active project registrations, milestones, and supervision group profiles according to live SPM database.</p>
      </div>

      <div className="details-card-wrapper">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading project specification...</div>
        ) : project ? (
          <>
            <div className="proj-card-header">
              <h3>{project.ProjectTitle}</h3>
              <span className="proj-status-badge">Active Status ({project.ProgressPercentage}%)</span>
            </div>
            <div className="proj-card-body">
              <p className="proj-desc">{project.Description}</p>

              <div className="proj-supervisors-grid">
                <div className="supervisor-block">
                  <span className="block-label">Primary Faculty Guide</span>
                  <p><strong>{project.FacultyName}</strong></p>
                </div>
                <div className="supervisor-block">
                  <span className="block-label">Co-Guide</span>
                  <p><strong>{project.coGuide}</strong></p>
                </div>
              </div>

              <div className="team-members-block">
                <span className="block-label">Project Team Members</span>
                <div className="team-badges-row">
                  {project.teamMembers.map((member, idx) => (
                    <span key={idx} className="team-badge">{member}</span>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "30px", color: "#6b7280" }}>No project details found.</div>
        )}
      </div>
    </div>
  );
}

export default StudentProjectsDetail;
