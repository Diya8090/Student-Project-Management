import { useState } from "react";
import "./ManageTasks.css";

const INITIAL_TASKS = [
  { TaskId: 1, AllocationID: 401, TaskTitle: "Establish Database Schema", TaskDescription: "Design SQL table entities and relationships", TaskStatus: 3, PriorityID: 1, AssignedScore: 10.00, EarnedScore: 10.00, ProgressPercentage: 100.00, StartDate: "2026-06-01", DueDate: "2026-06-25", CompletedDate: "2026-06-24", FacultyRemarks: "Exemplary relational structures.", StudentRemarks: "Fully satisfied parameters.", IsDeleted: false, ProjectName: "Student Project Management System" },
  { TaskId: 2, AllocationID: 401, TaskTitle: "Integrate Payment Gateway API", TaskDescription: "Connect Stripe hooks callbacks", TaskStatus: 2, PriorityID: 1, AssignedScore: 15.00, EarnedScore: 0.00, ProgressPercentage: 45.00, StartDate: "2026-07-01", DueDate: "2026-07-15", CompletedDate: "", FacultyRemarks: "", StudentRemarks: "Need assistance with testing webhooks locally.", IsDeleted: false, ProjectName: "E-Commerce Web Application" },
  { TaskId: 3, AllocationID: 402, TaskTitle: "Procure Soil Moisture Sensor Hardware", TaskDescription: "Buy low-power sensor modules", TaskStatus: 3, PriorityID: 2, AssignedScore: 8.00, EarnedScore: 8.00, ProgressPercentage: 100.00, StartDate: "2026-05-01", DueDate: "2026-05-10", CompletedDate: "2026-05-09", FacultyRemarks: "Standard equipment certified.", StudentRemarks: "Delivered.", IsDeleted: false, ProjectName: "IoT Smart Agriculture System" },
  { TaskId: 4, AllocationID: 403, TaskTitle: "Train AI CNN Image Classification Model", TaskDescription: "Fit CNN over dataset", TaskStatus: 2, PriorityID: 1, AssignedScore: 20.00, EarnedScore: 0.00, ProgressPercentage: 30.00, StartDate: "2026-06-10", DueDate: "2026-07-28", CompletedDate: "", FacultyRemarks: "Ensure you prevent overfitting.", StudentRemarks: "Dataset loaded.", IsDeleted: false, ProjectName: "AI-Powered Medical Diagnosis Tool" },
  { TaskId: 5, AllocationID: 404, TaskTitle: "Verify Inverter Grid Synchronization Data", TaskDescription: "Audit grid sync frequency data", TaskStatus: 3, PriorityID: 3, AssignedScore: 12.00, EarnedScore: 11.50, ProgressPercentage: 100.00, StartDate: "2026-06-05", DueDate: "2026-06-20", CompletedDate: "2026-06-18", FacultyRemarks: "Grid parameters match limits.", StudentRemarks: "Validated.", IsDeleted: false, ProjectName: "Smart Solar Grid Monitor" },
  { TaskId: 6, AllocationID: 404, TaskTitle: "Draft System Documentation & Reports", TaskDescription: "Write LaTeX reports and architectural diagrams", TaskStatus: 2, PriorityID: 2, AssignedScore: 10.00, EarnedScore: 0.00, ProgressPercentage: 10.00, StartDate: "2026-07-05", DueDate: "2026-08-05", CompletedDate: "", FacultyRemarks: "", StudentRemarks: "Structure defined.", IsDeleted: false, ProjectName: "Smart Solar Grid Monitor" }
];

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

function ManageTasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modal forms overlay states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    TaskTitle: "",
    TaskDescription: "",
    AllocationID: 401,
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
    ProjectName: "Student Project Management System"
  });

  const handleInputChange = (e) => {
    const val = ["AllocationID", "TaskStatus", "PriorityID"].includes(e.target.name)
      ? parseInt(e.target.value) || 0
      : ["AssignedScore", "EarnedScore", "ProgressPercentage"].includes(e.target.name)
      ? parseFloat(e.target.value) || 0
      : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: val
    });
  };

  const handleOpenAdd = () => {
    setFormData({
      TaskTitle: "",
      TaskDescription: "",
      AllocationID: 401,
      TaskStatus: 1,
      PriorityID: 2,
      AssignedScore: 10,
      EarnedScore: 0,
      ProgressPercentage: 0,
      StartDate: new Date().toISOString().split("T")[0],
      DueDate: new Date().toISOString().split("T")[0],
      CompletedDate: "",
      FacultyRemarks: "",
      StudentRemarks: "",
      IsDeleted: false,
      ProjectName: "Student Project Management System"
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
      ProjectName: t.ProjectName || "Student Project Management System"
    });
    setSelectedId(t.TaskId);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const updated = tasks.filter(t => t.TaskId !== id);
      setTasks(updated);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = tasks.map(t => {
      if (t.TaskId === id) {
        const nextProgress = newStatus === 3 ? 100.00 : newStatus === 2 ? 50.00 : 0.00;
        return { ...t, TaskStatus: newStatus, ProgressPercentage: nextProgress };
      }
      return t;
    });
    setTasks(updated);
    localStorage.setItem("spm_tasks_store", JSON.stringify(updated));
    window.dispatchEvent(new Event("spm_tasks_updated"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for duplicate task assignment within the same project
    const taskExists = tasks.some(t => 
      t.TaskTitle.toLowerCase() === formData.TaskTitle.trim().toLowerCase() &&
      t.ProjectName === formData.ProjectName &&
      (modalMode === "add" || t.TaskId !== selectedId)
    );
    if (taskExists) {
      alert(`Error: A task with the title "${formData.TaskTitle}" already exists for project "${formData.ProjectName}".`);
      return;
    }

    const submitData = {
      TaskTitle: formData.TaskTitle,
      TaskDescription: formData.TaskDescription,
      AllocationID: formData.AllocationID,
      TaskStatus: formData.TaskStatus,
      PriorityID: formData.PriorityID,
      AssignedScore: formData.AssignedScore,
      EarnedScore: formData.EarnedScore,
      ProgressPercentage: formData.ProgressPercentage,
      StartDate: formData.StartDate,
      DueDate: formData.DueDate,
      CompletedDate: formData.CompletedDate,
      FacultyRemarks: formData.FacultyRemarks,
      StudentRemarks: formData.StudentRemarks,
      IsDeleted: formData.IsDeleted || false,
      ProjectName: formData.ProjectName
    };

    let updated;
    if (modalMode === "add") {
      const newT = {
        TaskId: tasks.length > 0 ? Math.max(...tasks.map(t => t.TaskId)) + 1 : 1,
        ...submitData
      };
      updated = [...tasks, newT];
    } else {
      updated = tasks.map(t => t.TaskId === selectedId ? { ...t, ...submitData } : t);
    }
    setTasks(updated);
    localStorage.setItem("spm_tasks_store", JSON.stringify(updated));
    window.dispatchEvent(new Event("spm_tasks_updated"));
    setShowModal(false);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.TaskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ProjectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "All" || t.PriorityID === parseInt(priorityFilter);

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="manage-tasks-container">
      <div className="tasks-page-header">
        <div>
          <h2>Project Tasks Registry</h2>
          <p>Assign project workload goals, set priorities, and view scores according to SPM schema.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-add-task">
          + Create Task
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
                    <span className={`priority-badge p-badge-${PRIORITY_MAP[t.PriorityID].toLowerCase()}`}>
                      {PRIORITY_MAP[t.PriorityID]}
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
                    <span className={`status-badge-pill st-pill-${STATUS_MAP[t.TaskStatus].toLowerCase().replace(" ", "")}`}>
                      {STATUS_MAP[t.TaskStatus]}
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
                <label>Task Title</label>
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
                  <select name="ProjectName" value={formData.ProjectName} onChange={handleInputChange}>
                    <option value="Student Project Management System">Student Project Management System</option>
                    <option value="E-Commerce Web Application">E-Commerce Web Application</option>
                    <option value="IoT Smart Agriculture System">IoT Smart Agriculture System</option>
                    <option value="AI-Powered Medical Diagnosis Tool">AI-Powered Medical Diagnosis Tool</option>
                    <option value="Smart Solar Grid Monitor">Smart Solar Grid Monitor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Allocation ID</label>
                  <input
                    type="number"
                    name="AllocationID"
                    value={formData.AllocationID}
                    onChange={handleInputChange}
                    required
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
                  <label>Priority Rank Code</label>
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
                  <label>Assigned Score (Faculty Max)</label>
                  <input
                    type="number"
                    name="AssignedScore"
                    step="0.5"
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
                    value={formData.EarnedScore}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Progress percentage (%)</label>
                  <input
                    type="number"
                    name="ProgressPercentage"
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
