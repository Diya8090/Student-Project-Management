import { useState, useEffect, useCallback } from "react";
import "./ManageProjects.css";

const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

const STATUS_MAP = {
  1: "In Progress",
  2: "Completed",
  3: "Under Review",
  4: "Delayed"
};

function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal forms overlay states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    ProjectTitle: "",
    Description: "",
    StudentId: "",
    FacultyId: "",
    AssignedDate: new Date().toISOString().split("T")[0],
    IsDeleted: false,
    StartDate: new Date().toISOString().split("T")[0],
    EndDate: new Date().toISOString().split("T")[0],
    ProjectStatus: 1,
    TotalTasks: 10,
    CompletedTasks: 0,
    ProgressPercentage: 0
  });

  // Reusable API Fetch Helper with Fallback
  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${PRIMARY_API_BASE}${endpoint}`, options);
      return res;
    } catch {
      const res = await fetch(`${FALLBACK_API_BASE}${endpoint}`, options);
      return res;
    }
  }, []);

  // Fetch Projects and Users (Students + Faculty) from API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Projects
      const projRes = await fetchApi("/Project");
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(Array.isArray(data) ? data : []);
      }

      // 2. Fetch Users to populate Student & Faculty dropdowns
      const userRes = await fetchApi("/User");
      if (userRes.ok) {
        const users = await userRes.json();
        if (Array.isArray(users)) {
          const stds = users.filter(
            (u) =>
              u.roleId === 3 ||
              (u.role && u.role.toLowerCase() === "student") ||
              (u.Role && u.Role.toLowerCase() === "student")
          );
          const facs = users.filter(
            (u) =>
              u.roleId === 2 ||
              (u.role && u.role.toLowerCase() === "faculty") ||
              (u.Role && u.Role.toLowerCase() === "faculty")
          );
          setStudentsList(stds);
          setFacultyList(facs);
        }
      }
    } catch (err) {
      console.error("Error loading projects data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["StudentId", "FacultyId", "ProjectStatus", "TotalTasks", "CompletedTasks"];
    
    let parsedVal = value;
    if (numericFields.includes(name)) {
      parsedVal = parseInt(value, 10) || 0;
    } else if (name === "ProgressPercentage") {
      parsedVal = parseFloat(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedVal,
    }));
  };

  const handleOpenAdd = () => {
    const defaultStudentId = studentsList.length > 0 ? (studentsList[0].userId || studentsList[0].UserId || studentsList[0].id) : "";
    const defaultFacultyId = facultyList.length > 0 ? (facultyList[0].userId || facultyList[0].UserId || facultyList[0].id) : "";

    setFormData({
      ProjectTitle: "",
      Description: "",
      StudentId: defaultStudentId,
      FacultyId: defaultFacultyId,
      AssignedDate: new Date().toISOString().split("T")[0],
      IsDeleted: false,
      StartDate: new Date().toISOString().split("T")[0],
      EndDate: new Date().toISOString().split("T")[0],
      ProjectStatus: 1,
      TotalTasks: 10,
      CompletedTasks: 0,
      ProgressPercentage: 0
    });
    setModalMode("add");
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    const pId = p.projectId || p.ProjectId;
    const stDate = p.startDate ? String(p.startDate).split("T")[0] : new Date().toISOString().split("T")[0];
    const enDate = p.endDate ? String(p.endDate).split("T")[0] : new Date().toISOString().split("T")[0];
    const asDate = p.assignedDate ? String(p.assignedDate).split("T")[0] : new Date().toISOString().split("T")[0];

    setFormData({
      ProjectTitle: p.projectTitle || p.ProjectTitle || "",
      Description: p.description || p.Description || "",
      StudentId: p.studentId || p.StudentId || "",
      FacultyId: p.facultyId || p.FacultyId || "",
      AssignedDate: asDate,
      IsDeleted: p.isDeleted || p.IsDeleted || false,
      StartDate: stDate,
      EndDate: enDate,
      ProjectStatus: p.projectStatus ?? p.ProjectStatus ?? 1,
      TotalTasks: p.totalTasks ?? p.TotalTasks ?? 10,
      CompletedTasks: p.completedTasks ?? p.CompletedTasks ?? 0,
      ProgressPercentage: p.progressPercentage ?? p.ProgressPercentage ?? 0
    });
    setSelectedId(pId);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetchApi(`/Project/${id}`, {
        method: "DELETE"
      });

      if (res.ok || res.status === 204) {
        alert("Project deleted successfully.");
        loadData();
      } else {
        alert("Failed to delete project from server.");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Network error while attempting to delete project.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const titleClean = formData.ProjectTitle.trim();
    if (!titleClean) {
      alert("Please enter a valid project title.");
      return;
    }

    // Duplicate title check
    const projectExists = projects.some((p) => {
      const pId = p.projectId || p.ProjectId;
      const pTitle = p.projectTitle || p.ProjectTitle || "";
      return (
        pTitle.toLowerCase() === titleClean.toLowerCase() &&
        (modalMode === "add" || pId !== selectedId)
      );
    });

    if (projectExists) {
      alert(`Error: A project with the title "${titleClean}" already exists.`);
      return;
    }

    const calculatedPercentage = formData.TotalTasks > 0 
      ? Math.round((formData.CompletedTasks / formData.TotalTasks) * 10000) / 100
      : 0;

    const payload = {
      projectTitle: titleClean,
      description: formData.Description || "",
      studentId: parseInt(formData.StudentId, 10) || 0,
      facultyId: parseInt(formData.FacultyId, 10) || 0,
      assignedDate: formData.AssignedDate ? new Date(formData.AssignedDate).toISOString() : new Date().toISOString(),
      isDeleted: formData.IsDeleted || false,
      projectStatus: parseInt(formData.ProjectStatus, 10) || 1,
      startDate: formData.StartDate ? new Date(formData.StartDate).toISOString() : new Date().toISOString(),
      endDate: formData.EndDate ? new Date(formData.EndDate).toISOString() : new Date().toISOString(),
      totalTasks: parseInt(formData.TotalTasks, 10) || 0,
      completedTasks: parseInt(formData.CompletedTasks, 10) || 0,
      progressPercentage: calculatedPercentage
    };

    try {
      if (modalMode === "add") {
        const res = await fetchApi("/Project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert("Project registered successfully!");
          setShowModal(false);
          loadData();
        } else {
          const errData = await res.json().catch(() => null);
          alert(`Failed to add project: ${errData?.message || "Server Error"}`);
        }
      } else {
        // Edit Mode
        const res = await fetchApi(`/Project/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok || res.status === 204) {
          alert("Project updated successfully!");
          setShowModal(false);
          loadData();
        } else {
          const errData = await res.json().catch(() => null);
          alert(`Failed to update project: ${errData?.message || "Server Error"}`);
        }
      }
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Network error occurred while saving project.");
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const title = p.projectTitle || p.ProjectTitle || "";
    const student = p.studentName || p.StudentName || "";
    const faculty = p.facultyName || p.FacultyName || "";
    const st = p.projectStatus ?? p.ProjectStatus ?? 1;

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || st === parseInt(statusFilter, 10);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="manage-projects-container">
      <div className="projects-page-header">
        <div>
          <h2>Academic Projects Register</h2>
          <p>Register projects, assign guides, adjust completion status and milestone progress connected to SPM Database.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-add-project">
          + Register Project
        </button>
      </div>

      <div className="directory-filters">
        <div className="search-box-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by project title, student, or guide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-status-wrapper">
          <label>Status Filter:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="1">1 - In Progress</option>
            <option value="2">2 - Completed</option>
            <option value="3">3 - Under Review</option>
            <option value="4">4 - Delayed</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="projects-table-card">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Student Name</th>
              <th>Guide Name</th>
              <th>Dates Target</th>
              <th>Progress</th>
              <th>Status</th>
              <th className="align-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="no-records-cell">
                  Loading projects from backend API...
                </td>
              </tr>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((p) => {
                const pId = p.projectId || p.ProjectId;
                const title = p.projectTitle || p.ProjectTitle || "Academic Project";
                const studentName = p.studentName || p.StudentName || "Assigned Student";
                const facultyName = p.facultyName || p.FacultyName || "Faculty Guide";
                const startDate = p.startDate ? String(p.startDate).split("T")[0] : "";
                const endDate = p.endDate ? String(p.endDate).split("T")[0] : "";
                const progress = p.progressPercentage ?? p.ProgressPercentage ?? 0;
                const completedTasks = p.completedTasks ?? p.CompletedTasks ?? 0;
                const totalTasks = p.totalTasks ?? p.TotalTasks ?? 0;
                const st = p.projectStatus ?? p.ProjectStatus ?? 1;
                const stName = p.statusName || p.StatusName || STATUS_MAP[st] || "In Progress";
                const stClass = stName.toLowerCase().replace(/\s+/g, "");

                return (
                  <tr key={pId}>
                    <td>
                      <span className="project-table-title" title={title}>{title}</span>
                    </td>
                    <td>
                      <span className="student-badge-pill-item">
                        {studentName}
                      </span>
                    </td>
                    <td>
                      <span className="project-table-guide">{facultyName}</span>
                    </td>
                    <td>
                      <span className="project-table-date">{startDate} to {endDate}</span>
                    </td>
                    <td>
                      <div className="project-progress-cell">
                        <span className="progress-text-label">{progress}%</span>
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: st === 2 ? "#10b981" : st === 4 ? "#dc2626" : "#3b82f6"
                            }}
                          ></div>
                        </div>
                        <span className="tasks-completed-note">({completedTasks}/{totalTasks} Tasks)</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge-pill st-pill-${stClass}`}>
                        {stName}
                      </span>
                    </td>
                    <td>
                      <div className="project-action-btns">
                        <button onClick={() => handleOpenEdit(p)} className="btn-table-action btn-table-edit" title="Edit">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(pId)} className="btn-table-action btn-table-delete" title="Delete">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-records-cell">
                  No projects match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === "add" ? "Register Academic Project" : "Modify Project Details"}</h3>
              <button onClick={() => setShowModal(false)} className="btn-close-modal">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  name="ProjectTitle"
                  value={formData.ProjectTitle}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  rows="2"
                />
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Assigned Student</label>
                  <select name="StudentId" value={formData.StudentId} onChange={handleInputChange} required>
                    <option value="">-- Select Student --</option>
                    {studentsList.map((s) => {
                      const sId = s.userId || s.UserId || s.id;
                      const sName = s.fullName || s.FullName || "Student";
                      return (
                        <option key={sId} value={sId}>
                          {sName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned Guide (Faculty)</label>
                  <select name="FacultyId" value={formData.FacultyId} onChange={handleInputChange} required>
                    <option value="">-- Select Faculty Guide --</option>
                    {facultyList.map((f) => {
                      const fId = f.userId || f.UserId || f.id;
                      const fName = f.fullName || f.FullName || "Faculty Guide";
                      return (
                        <option key={fId} value={fId}>
                          {fName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="StartDate"
                    value={formData.StartDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="EndDate"
                    value={formData.EndDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Project Status Code</label>
                  <select name="ProjectStatus" value={formData.ProjectStatus} onChange={handleInputChange}>
                    <option value="1">1 - In Progress</option>
                    <option value="2">2 - Completed</option>
                    <option value="3">3 - Under Review</option>
                    <option value="4">4 - Delayed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Completed Tasks</label>
                  <input
                    type="number"
                    name="CompletedTasks"
                    min="0"
                    max={formData.TotalTasks}
                    value={formData.CompletedTasks}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Total Tasks</label>
                  <input
                    type="number"
                    name="TotalTasks"
                    min="1"
                    value={formData.TotalTasks}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-modal-submit">
                  {modalMode === "add" ? "Register Project" : "Save Changes"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-modal-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageProjects;
