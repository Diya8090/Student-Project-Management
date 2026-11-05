import { useState, useEffect } from "react";
import "./ManageTasks.css";
import { tasksApi, projectsApi, unwrapData } from "../../../services/api";

const STATUS_MAP = {
  1: "Pending",
  2: "In Progress",
  3: "Completed",
  4: "Rejected"
};

const PRIORITY_MAP = {
  1: "High",
  2: "Medium",
  3: "Low"
};

const normalizeTask = (t) => ({
  TaskId: t.taskId ?? t.TaskId,
  AllocationID: t.allocationID ?? t.allocationId ?? t.AllocationID,
  TaskTitle: t.taskTitle ?? t.TaskTitle ?? "",
  TaskDescription: t.taskDescription ?? t.TaskDescription ?? "",
  TaskStatus: t.taskStatus ?? t.TaskStatus ?? 1,
  StatusName: t.statusName ?? t.StatusName ?? STATUS_MAP[t.taskStatus ?? t.TaskStatus] ?? "Pending",
  PriorityID: t.priorityID ?? t.priorityId ?? t.PriorityID ?? 2,
  PriorityName: t.priorityName ?? t.PriorityName ?? PRIORITY_MAP[t.priorityID ?? t.PriorityID] ?? "Medium",
  AssignedScore: Number(t.assignedScore ?? t.AssignedScore ?? 0),
  EarnedScore: Number(t.earnedScore ?? t.EarnedScore ?? 0),
  ProgressPercentage: Number(t.progressPercentage ?? t.ProgressPercentage ?? 0),
  StartDate: t.startDate ? (typeof t.startDate === "string" ? t.startDate.split("T")[0] : t.startDate) : "",
  DueDate: t.dueDate ? (typeof t.dueDate === "string" ? t.dueDate.split("T")[0] : t.dueDate) : "",
  CompletedDate: t.completedDate ? (typeof t.completedDate === "string" ? t.completedDate.split("T")[0] : t.completedDate) : "",
  FacultyRemarks: t.facultyRemarks ?? t.FacultyRemarks ?? "",
  StudentRemarks: t.studentRemarks ?? t.StudentRemarks ?? "",
  IsDeleted: t.isDeleted ?? t.IsDeleted ?? false,
  ProjectName: t.projectTitle ?? t.ProjectTitle ?? t.ProjectName ?? "General Project"
});

function ManageTasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modal forms overlay states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    TaskTitle: "",
    TaskDescription: "",
    AllocationID: 1,
    TaskStatus: 1,
    PriorityID: 2,
    AssignedScore: 10,
    EarnedScore: 0,
    ProgressPercentage: 0,
    StartDate: "",
    DueDate: "",
    CompletedDate: "",
    FacultyRemarks: "",
    StudentRemarks: "",
    IsDeleted: false,
    ProjectName: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksRes, projsRes] = await Promise.all([
        tasksApi.getAll(),
        projectsApi.getAll()
      ]);

      const rawTasks = unwrapData(tasksRes) || [];
      const normalizedTasks = rawTasks.map(normalizeTask);
      setTasks(normalizedTasks);

      const rawProjects = unwrapData(projsRes) || [];
      setProjects(rawProjects);

      localStorage.setItem("spm_tasks_store", JSON.stringify(normalizedTasks));
      window.dispatchEvent(new Event("spm_tasks_updated"));
    } catch (err) {
      console.error("Failed to load tasks/projects:", err);
      setError("Failed to fetch tasks from server. Showing local cache if available.");
      const saved = localStorage.getItem("spm_tasks_store");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (["AllocationID", "TaskStatus", "PriorityID"].includes(name)) {
      parsedValue = parseInt(value, 10) || 0;
    } else if (["AssignedScore", "EarnedScore", "ProgressPercentage"].includes(name)) {
      parsedValue = parseFloat(value) || 0;
    }

    if (name === "AllocationID") {
      const selectedProj = projects.find(
        (p) => (p.projectId || p.ProjectId) === parseInt(value, 10)
      );
      setFormData((prev) => ({
        ...prev,
        AllocationID: parsedValue,
        ProjectName: selectedProj ? (selectedProj.projectTitle || selectedProj.ProjectTitle) : prev.ProjectName
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue
      }));
    }
  };

  const handleOpenAdd = () => {
    const defaultProj = projects[0];
    const defaultProjId = defaultProj ? (defaultProj.projectId || defaultProj.ProjectId) : 1;
    const defaultProjTitle = defaultProj ? (defaultProj.projectTitle || defaultProj.ProjectTitle) : "General Project";

    setFormData({
      TaskTitle: "",
      TaskDescription: "",
      AllocationID: defaultProjId,
      TaskStatus: 1,
      PriorityID: 2,
      AssignedScore: 10,
      EarnedScore: 0,
      ProgressPercentage: 0,
      StartDate: new Date().toISOString().split("T")[0],
      DueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      CompletedDate: "",
      FacultyRemarks: "",
      StudentRemarks: "",
      IsDeleted: false,
      ProjectName: defaultProjTitle
    });
    setModalMode("add");
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setFormData({
      TaskTitle: t.TaskTitle,
      TaskDescription: t.TaskDescription || "",
      AllocationID: t.AllocationID,
      TaskStatus: t.TaskStatus,
      PriorityID: t.PriorityID,
      AssignedScore: t.AssignedScore,
      EarnedScore: t.EarnedScore,
      ProgressPercentage: t.ProgressPercentage,
      StartDate: t.StartDate || "",
      DueDate: t.DueDate || "",
      CompletedDate: t.CompletedDate || "",
      FacultyRemarks: t.FacultyRemarks || "",
      StudentRemarks: t.StudentRemarks || "",
      IsDeleted: t.IsDeleted || false,
      ProjectName: t.ProjectName || ""
    });
    setSelectedId(t.TaskId);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await tasksApi.delete(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Error deleting task: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      allocationID: parseInt(formData.AllocationID, 10) || 1,
      taskTitle: formData.TaskTitle.trim(),
      taskDescription: formData.TaskDescription || "",
      taskStatus: parseInt(formData.TaskStatus, 10) || 1,
      priorityID: parseInt(formData.PriorityID, 10) || 1,
      assignedScore: parseFloat(formData.AssignedScore) || 0,
      earnedScore: formData.EarnedScore !== "" && formData.EarnedScore !== null ? parseFloat(formData.EarnedScore) : 0,
      progressPercentage: parseFloat(formData.ProgressPercentage) || 0,
      startDate: formData.StartDate ? new Date(formData.StartDate).toISOString() : null,
      dueDate: formData.DueDate ? new Date(formData.DueDate).toISOString() : null,
      completedDate: formData.CompletedDate ? new Date(formData.CompletedDate).toISOString() : null,
      facultyRemarks: formData.FacultyRemarks || "",
      studentRemarks: formData.StudentRemarks || "",
      isDeleted: false
    };

    try {
      if (modalMode === "add") {
        await tasksApi.create(payload);
      } else {
        await tasksApi.update(selectedId, payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to save task:", err);
      const errMsg = err.response?.data?.errors
        ? err.response.data.errors.join(", ")
        : err.response?.data?.message || err.message;
      alert("Error saving task: " + errMsg);
    }
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      (t.TaskTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.ProjectName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "All" || t.PriorityID === parseInt(priorityFilter, 10);

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="manage-tasks-container">
      <div className="tasks-page-header">
        <div>
          <h2>Project Tasks Registry</h2>
          <p>Assign project workload goals, set priorities, and view scores connected to live database.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-add-task">
          + Create Task
        </button>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "6px", marginBottom: "15px" }}>{error}</div>}

      <div className="directory-filters">
        <div className="search-box-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks by title or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-status-wrapper">
          <label>Priority Filter:</label>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="1">1 - High</option>
            <option value="2">2 - Medium</option>
            <option value="3">3 - Low</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="tasks-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading tasks from database...</div>
        ) : (
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Project Context</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Progress</th>
                <th>Score (Max)</th>
                <th>Status</th>
                <th className="align-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => (
                  <tr key={t.TaskId}>
                    <td>
                      <span className="task-table-name" title={t.TaskTitle}>{t.TaskTitle}</span>
                    </td>
                    <td>
                      <span className="task-table-project">{t.ProjectName}</span>
                    </td>
                    <td>
                      <span className={`priority-badge p-badge-${(PRIORITY_MAP[t.PriorityID] || "medium").toLowerCase()}`}>
                        {PRIORITY_MAP[t.PriorityID] || "Medium"}
                      </span>
                    </td>
                    <td>
                      <span className="task-table-date">{t.DueDate || "No date"}</span>
                    </td>
                    <td>
                      <div className="task-progress-cell">
                        <span className="progress-text-label">{t.ProgressPercentage}%</span>
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${t.ProgressPercentage}%`,
                              backgroundColor: t.TaskStatus === 2 ? "#10b981" : "#3b82f6"
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="score-val-label">{t.EarnedScore} / {t.AssignedScore}</span>
                    </td>
                    <td>
                      <span className={`status-badge-pill st-pill-${(STATUS_MAP[t.TaskStatus] || "pending").toLowerCase().replace(" ", "")}`}>
                        {STATUS_MAP[t.TaskStatus] || "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="task-action-btns">
                        <button onClick={() => handleOpenEdit(t)} className="btn-table-action btn-table-edit" title="Edit">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(t.TaskId)} className="btn-table-action btn-table-delete" title="Delete">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-records-cell">
                    No tasks match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === "add" ? "Create Project Task" : "Modify Task Parameters"}</h3>
              <button onClick={() => setShowModal(false)} className="btn-close-modal">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  name="TaskTitle"
                  value={formData.TaskTitle}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Task Description</label>
                <textarea
                  name="TaskDescription"
                  value={formData.TaskDescription}
                  onChange={handleInputChange}
                  placeholder="Enter task details"
                  rows="2"
                />
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Project Context</label>
                  <select name="AllocationID" value={formData.AllocationID} onChange={handleInputChange}>
                    {projects.map((p) => {
                      const pId = p.projectId || p.ProjectId;
                      const pTitle = p.projectTitle || p.ProjectTitle;
                      return (
                        <option key={pId} value={pId}>
                          {pTitle}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Allocation ID (Project ID)</label>
                  <input
                    type="number"
                    name="AllocationID"
                    value={formData.AllocationID}
                    onChange={handleInputChange}
                    disabled
                  />
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
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="DueDate"
                    value={formData.DueDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Priority Rank</label>
                  <select name="PriorityID" value={formData.PriorityID} onChange={handleInputChange}>
                    <option value="1">1 - High Priority</option>
                    <option value="2">2 - Medium Priority</option>
                    <option value="3">3 - Low Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="TaskStatus" value={formData.TaskStatus} onChange={handleInputChange}>
                    <option value="1">Pending</option>
                    <option value="2">In Progress</option>
                    <option value="3">Completed</option>
                    <option value="4">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-row-three-group">
                <div className="form-group">
                  <label>Assigned Score (Max)</label>
                  <input
                    type="number"
                    name="AssignedScore"
                    step="0.5"
                    min="0"
                    max="100"
                    value={formData.AssignedScore}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Earned Score (Obtained)</label>
                  <input
                    type="number"
                    name="EarnedScore"
                    step="0.5"
                    min="0"
                    max={formData.AssignedScore || 100}
                    value={formData.EarnedScore}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Progress (%)</label>
                  <input
                    type="number"
                    name="ProgressPercentage"
                    min="0"
                    max="100"
                    value={formData.ProgressPercentage}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Faculty Guide Remarks</label>
                <input
                  type="text"
                  name="FacultyRemarks"
                  value={formData.FacultyRemarks}
                  onChange={handleInputChange}
                  placeholder="Review comments..."
                />
              </div>

              <div className="form-group">
                <label>Student Comments</label>
                <input
                  type="text"
                  name="StudentRemarks"
                  value={formData.StudentRemarks}
                  onChange={handleInputChange}
                  placeholder="Task progress notes..."
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-modal-submit">
                  {modalMode === "add" ? "Create Task" : "Save Changes"}
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

export default ManageTasks;
