import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TotalProjectsDetail.css";

const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

const STATUS_MAP = {
  1: "In Progress",
  2: "Completed",
  3: "Under Review",
  4: "Delayed"
};

function TotalProjectsDetail() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${PRIMARY_API_BASE}${endpoint}`, options);
      return res;
    } catch {
      const res = await fetch(`${FALLBACK_API_BASE}${endpoint}`, options);
      return res;
    }
  }, []);

  useEffect(() => {
    fetchApi("/Project")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects in detail view:", err);
        setLoading(false);
      });
  }, [fetchApi]);

  const filteredProjects = projects.filter(p => {
    const title = p.projectTitle || p.ProjectTitle || "";
    const student = p.studentName || p.StudentName || "";
    const faculty = p.facultyName || p.FacultyName || "";
    const st = (p.statusName || p.StatusName || "").toLowerCase();

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || st.includes(statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const total = projects.length;
  const completed = projects.filter(p => (p.statusName || "").toLowerCase().includes("completed") || p.projectStatus === 2).length;
  const inProgress = projects.filter(p => (p.statusName || "").toLowerCase().includes("progress") || p.projectStatus === 1).length;
  const underReview = projects.filter(p => (p.statusName || "").toLowerCase().includes("hold") || (p.statusName || "").toLowerCase().includes("review") || p.projectStatus === 3).length;

  return (
    <div className="projects-detail-container">
      <div className="detail-navigation-bar">
        <Link to="/admin/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="detail-page-header">
        <h2>Total Academic Projects</h2>
        <p>Register board summarizing milestone completion progress, allocated students and guides according to SPM schema.</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-stats-cards">
        <div className="stat-summary-card">
          <span className="summary-title">Total Projects</span>
          <span className="summary-value">{total}</span>
        </div>
        <div className="stat-summary-card completed-border">
          <span className="summary-title">Completed</span>
          <span className="summary-value">{completed}</span>
        </div>
        <div className="stat-summary-card progress-border">
          <span className="summary-title">In Progress</span>
          <span className="summary-value">{inProgress}</span>
        </div>
        <div className="stat-summary-card hold-border">
          <span className="summary-title">Under Review</span>
          <span className="summary-value">{underReview}</span>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="directory-filters">
        <div className="search-box-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by project name, student, or guide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="1">1 - In Progress</option>
            <option value="2">2 - Completed</option>
            <option value="3">3 - Under Review</option>
            <option value="4">4 - Delayed</option>
          </select>
        </div>
      </div>

      <div className="details-table-card">
        <table className="details-table">
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Student Name</th>
              <th>Assigned Guide</th>
              <th>Target Date Term</th>
              <th>Progress</th>
              <th>Status Badge</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map(p => {
                const pId = p.projectId || p.ProjectId || p.id;
                const title = p.projectTitle || p.ProjectTitle || "Academic Project";
                const studentName = p.studentName || p.StudentName || "Assigned Student";
                const facultyName = p.facultyName || p.FacultyName || "Faculty Guide";
                const startDate = p.startDate ? String(p.startDate).split("T")[0] : "2026-01-01";
                const endDate = p.endDate ? String(p.endDate).split("T")[0] : "2026-06-30";
                const progress = p.progressPercentage ?? p.ProgressPercentage ?? 50;
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
                              backgroundColor: st === 2 || stName.toLowerCase().includes("completed") ? "#10b981" : "#3b82f6"
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge-pill st-pill-${stClass}`}>
                        {stName}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-records-cell">
                  No projects match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TotalProjectsDetail;
