import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FacultyProjectsDetail.css";
import { projectsApi, unwrapData } from "../../../../services/api";

const STATUS_MAP = {
  1: "In Progress",
  2: "Completed",
  3: "Under Review",
  4: "Delayed"
};

function FacultyProjectsDetail() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const res = await projectsApi.getAll();
        const rawProjs = unwrapData(res) || [];

        const normalized = rawProjs.map((p) => ({
          ProjectId: p.projectId || p.ProjectId,
          ProjectTitle: p.projectTitle || p.ProjectTitle,
          StudentName: p.studentName || p.StudentName || `Student #${p.studentId || p.StudentId}`,
          milestone: p.totalTasks > 0 ? `${p.completedTasks || 0} / ${p.totalTasks} Tasks Done` : "Milestone 1 Active",
          ProjectStatus: p.projectStatus || p.ProjectStatus || 1
        }));

        setProjects(normalized);
      } catch (e) {
        console.warn("Could not load faculty projects detail:", e);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <div className="faculty-projects-detail-container">
      <div className="details-header">
        <Link to="/faculty/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Assigned Projects Directory</h2>
        <p>Comprehensive list of project groups under your supervision according to live SPM database.</p>
      </div>

      <div className="details-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading assigned projects...</div>
        ) : (
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
              {projects.length > 0 ? (
                projects.map((proj) => (
                  <tr key={proj.ProjectId}>
                    <td><strong>{proj.ProjectTitle}</strong></td>
                    <td>{proj.StudentName}</td>
                    <td><span className="milestone-pill">{proj.milestone}</span></td>
                    <td>
                      <span className={`status-badge-pill status-${(STATUS_MAP[proj.ProjectStatus] || "in-progress").toLowerCase().replace(" ", "-")}`}>
                        {STATUS_MAP[proj.ProjectStatus] || "In Progress"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No assigned projects found.
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

export default FacultyProjectsDetail;
