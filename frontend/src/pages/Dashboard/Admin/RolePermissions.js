import { useState } from "react";
import "./RolePermissions.css";

const INITIAL_PERMISSIONS_MATRIX = [
  // Category: System configuration
  { id: "sys-backup", category: "System Configuration", label: "Trigger Database Backups", admin: true, faculty: false, student: false },
  { id: "sys-api", category: "System Configuration", label: "Configure API & Keys", admin: true, faculty: false, student: false },
  { id: "sys-logs", category: "System Configuration", label: "View System Event Logs", admin: true, faculty: false, student: false },
  // Category: Project controls
  { id: "proj-propose", category: "Project Operations", label: "Propose New Project Details", admin: true, faculty: true, student: true },
  { id: "proj-delete", category: "Project Operations", label: "Force Delete Project Files", admin: true, faculty: false, student: false },
  { id: "proj-approve", category: "Project Operations", label: "Approve Project Proposal", admin: true, faculty: true, student: false },
  // Category: Grading & evaluations
  { id: "eval-grades", category: "Grading & Evaluation", label: "Submit Evaluation Scores", admin: true, faculty: true, student: false },
  { id: "eval-remarks", category: "Grading & Evaluation", label: "Input Milestone Remarks", admin: true, faculty: true, student: false },
  { id: "eval-view", category: "Grading & Evaluation", label: "View Final Report Sheet", admin: true, faculty: true, student: true }
];

function RolePermissions() {
  const [matrix, setMatrix] = useState(INITIAL_PERMISSIONS_MATRIX);
  const [activeCategory, setActiveCategory] = useState("All");

  const handleToggle = (id, roleKey) => {
    setMatrix(matrix.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [roleKey]: !item[roleKey]
        };
      }
      return item;
    }));
  };

  const categories = ["All", "System Configuration", "Project Operations", "Grading & Evaluation"];

  const filteredMatrix = activeCategory === "All"
    ? matrix
    : matrix.filter(item => item.category === activeCategory);

  return (
    <div className="role-permissions-container">
      <div className="permissions-page-header">
        <div>
          <h2>System Permissions Matrix</h2>
          <p>Configure granular, system-wide access controls side-by-side across all user roles.</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="permissions-tabs-row">
        {categories.map(cat => (
          <button
            key={cat}
            className={`perm-tab-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="matrix-table-card">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="col-desc">Action / Permission Scope</th>
              <th className="col-category">Category</th>
              <th className="col-role">Admin</th>
              <th className="col-role">Faculty</th>
              <th className="col-role">Student</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatrix.map((item) => (
              <tr key={item.id}>
                <td className="col-desc">
                  <span className="permission-matrix-label">{item.label}</span>
                </td>
                <td className="col-category">
                  <span className="category-meta-badge">{item.category}</span>
                </td>
                <td className="col-role">
                  <label className="switch-toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={item.admin}
                      onChange={() => handleToggle(item.id, "admin")}
                    />
                    <span className="slider-round-switch"></span>
                  </label>
                </td>
                <td className="col-role">
                  <label className="switch-toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={item.faculty}
                      onChange={() => handleToggle(item.id, "faculty")}
                    />
                    <span className="slider-round-switch"></span>
                  </label>
                </td>
                <td className="col-role">
                  <label className="switch-toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={item.student}
                      onChange={() => handleToggle(item.id, "student")}
                    />
                    <span className="slider-round-switch"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RolePermissions;
