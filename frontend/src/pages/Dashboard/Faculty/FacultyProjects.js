import { useState } from "react";
import "./FacultyProjects.css";

const INITIAL_PROJECTS = [
  { ProjectId: 1, ProjectTitle: "IoT Smart Home automation", Description: "Building IoT embedded gateway for home appliances", StudentName: "Aarav Patel", StudentId: 101, milestone: "Milestone 2", ProjectStatus: 3 },
  { ProjectId: 2, ProjectTitle: "E-Commerce Web Portal", Description: "React & ASP.NET web app store front", StudentName: "Neha Sharma", StudentId: 102, milestone: "Milestone 1", ProjectStatus: 1 },
  { ProjectId: 3, ProjectTitle: "Machine Learning Crop Predictor", Description: "CNN agricultural yield analysis", StudentName: "Kunal Sen", StudentId: 106, milestone: "Final Presentation", ProjectStatus: 2 },
  { ProjectId: 4, ProjectTitle: "Cybersecurity Threat Analyzer", Description: "Packet packet analyzer dashboard", StudentName: "Meera Nair", StudentId: 108, milestone: "Milestone 2", ProjectStatus: 4 }
];

const STATUS_MAP = {
  1: "In Progress",
  2: "Completed",
  3: "Under Review",
  4: "Delayed"
};

function FacultyProjects() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProj, setSelectedProj] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ProjectStatus: 1,
    milestone: ""
  });

  const handleOpenManage = (proj) => {
    setSelectedProj(proj);
    setFormData({
      ProjectStatus: proj.ProjectStatus,
      milestone: proj.milestone || "Milestone 1"
    });
    setShowModal(true);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setProjects(projects.map(p => p.ProjectId === selectedProj.ProjectId ? {
      ...p,
      ProjectStatus: parseInt(formData.ProjectStatus),
      milestone: formData.milestone
    } : p));
    setShowModal(false);
  };

  return (
    <div className="faculty-projects-container">
      <div className="page-header">
        <h2>Assigned Projects</h2>
        <p>Monitor completion milestones and status tracks for your supervised project groups according to SPM schema.</p>
      </div>

      <div className="projects-table-card">
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
            {projects.map((proj) => (
              <tr key={proj.ProjectId}>
                <td className="proj-title"><strong>{proj.ProjectTitle}</strong></td>
                <td>
                  <span className="student-badge-tag">{proj.StudentName || `Student #${proj.StudentId}`}</span>
                </td>
                <td><span className="milestone-text-val">{proj.milestone}</span></td>
                <td>
                  <span className={`status-badge-pill status-${STATUS_MAP[proj.ProjectStatus]?.toLowerCase().replace(" ", "-")}`}>
                    {STATUS_MAP[proj.ProjectStatus] || "In Progress"}
                  </span>
                </td>
                <td>
                  <button className="btn-table-action" onClick={() => handleOpenManage(proj)}>
                    Manage Project
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  value={selectedProj.StudentName || `Student ID ${selectedProj.StudentId}`}
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
                  onChange={(e) => setFormData({ ...formData, ProjectStatus: parseInt(e.target.value) })}
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
