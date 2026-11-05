import { useState, useEffect } from "react";
import "./FacultyProjects.css";
import { projectsApi, unwrapData } from "../../../services/api";

const STATUS_MAP = {
  1: "In Progress",
  2: "Completed",
  3: "Under Review",
  4: "Delayed"
};

function FacultyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProj, setSelectedProj] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ProjectStatus: 1,
    milestone: ""
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsApi.getAll();
      const rawProjs = unwrapData(res) || [];

      const savedUser = localStorage.getItem("currentUser");
      let facultyId = null;
      if (savedUser) {
        try {
          facultyId = JSON.parse(savedUser).userId;
        } catch (e) {}
      }

      // Filter for this faculty if available, else show all projects
      const filtered = facultyId && rawProjs.some(p => (p.facultyId || p.FacultyId) === facultyId)
        ? rawProjs.filter(p => (p.facultyId || p.FacultyId) === facultyId)
        : rawProjs;

      const normalized = filtered.map((p) => ({
        ProjectId: p.projectId || p.ProjectId,
        ProjectTitle: p.projectTitle || p.ProjectTitle,
        Description: p.description || p.Description || "",
        StudentName: p.studentName || p.StudentName || `Student #${p.studentId || p.StudentId}`,
        StudentId: p.studentId || p.StudentId,
        FacultyId: p.facultyId || p.FacultyId,
        milestone: p.totalTasks > 0 ? `${p.completedTasks || 0}/${p.totalTasks} Tasks Done` : "Milestone 1",
        ProjectStatus: p.projectStatus || p.ProjectStatus || 1,
        StartDate: p.startDate || p.StartDate,
        EndDate: p.endDate || p.EndDate,
        AssignedDate: p.assignedDate || p.AssignedDate,
        ProgressPercentage: p.progressPercentage || p.ProgressPercentage || 0,
        TotalTasks: p.totalTasks || p.TotalTasks || 0,
        CompletedTasks: p.completedTasks || p.CompletedTasks || 0
      }));

      setProjects(normalized);
    } catch (err) {
      console.error("Failed to load faculty projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenManage = (proj) => {
    setSelectedProj(proj);
    setFormData({
      ProjectStatus: proj.ProjectStatus,
      milestone: proj.milestone || "Milestone 1"
    });
    setShowModal(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedProj) return;

    try {
      const payload = {
        projectTitle: selectedProj.ProjectTitle,
        description: selectedProj.Description || "",
        studentId: selectedProj.StudentId || 1,
        facultyId: selectedProj.FacultyId || 1,
        assignedDate: selectedProj.AssignedDate || new Date().toISOString(),
        isDeleted: false,
        projectStatus: parseInt(formData.ProjectStatus, 10),
        startDate: selectedProj.StartDate || new Date().toISOString(),
        endDate: selectedProj.EndDate || new Date(Date.now() + 90 * 86400000).toISOString(),
        totalTasks: selectedProj.TotalTasks || 0,
        completedTasks: selectedProj.CompletedTasks || 0,
        progressPercentage: selectedProj.ProgressPercentage || 0
      };

      await projectsApi.update(selectedProj.ProjectId, payload);
      setShowModal(false);
      await loadProjects();
    } catch (err) {
      console.error("Failed to update project status:", err);
      alert("Error saving project changes: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="faculty-projects-container">
      <div className="page-header">
        <h2>Assigned Projects</h2>
        <p>Monitor completion milestones and status tracks for your supervised project groups connected to live database.</p>
      </div>

      <div className="projects-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading assigned projects...</div>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Assigned Student</th>
                <th>Current Milestone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((proj) => (
                  <tr key={proj.ProjectId}>
                    <td className="proj-title"><strong>{proj.ProjectTitle}</strong></td>
                    <td>
                      <span className="student-badge-tag">{proj.StudentName}</span>
                    </td>
                    <td><span className="milestone-text-val">{proj.milestone}</span></td>
                    <td>
                      <span className={`status-badge-pill status-${(STATUS_MAP[proj.ProjectStatus] || "in-progress").toLowerCase().replace(" ", "-")}`}>
                        {STATUS_MAP[proj.ProjectStatus] || "In Progress"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-table-action" onClick={() => handleOpenManage(proj)}>
                        Manage Project
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No assigned projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedProj && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Manage Project: {selectedProj.ProjectTitle}</h3>
              <button onClick={() => setShowModal(false)} className="btn-close-modal">×</button>
            </div>
            <form onSubmit={handleSaveChanges} className="modal-form">
              <div className="form-group">
                <label>Assigned Student</label>
                <input
                  type="text"
                  value={selectedProj.StudentName}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Current Milestone Track</label>
                <input
                  type="text"
                  value={formData.milestone}
                  onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
                  placeholder="e.g. Milestone 2, Final Presentation"
                  required
                />
              </div>

              <div className="form-group">
                <label>Project Status</label>
                <select
                  value={formData.ProjectStatus}
                  onChange={(e) => setFormData({ ...formData, ProjectStatus: parseInt(e.target.value, 10) })}
                >
                  <option value="1">1 - In Progress</option>
                  <option value="2">2 - Completed</option>
                  <option value="3">3 - Under Review</option>
                  <option value="4">4 - Delayed</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-modal-submit">Save Changes</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-modal-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyProjects;
