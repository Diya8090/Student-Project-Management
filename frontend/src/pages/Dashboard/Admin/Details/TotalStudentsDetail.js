import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TotalStudentsDetail.css";

const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

function TotalStudentsDetail() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

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
    fetchApi("/User")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const studentList = data.filter(
            (u) =>
              u.roleId === 3 ||
              (u.role && u.role.toLowerCase() === "student") ||
              (u.Role && u.Role.toLowerCase() === "student")
          );
          setStudents(studentList);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching students in detail view:", err);
        setLoading(false);
      });
  }, [fetchApi]);

  const filteredStudents = students.filter(s => {
    const sName = s.fullName || s.FullName || s.name || "";
    const sEmail = s.email || s.Email || "";
    const sProj = s.projectTitle || s.ProjectTitle || "Academic Project";
    const dept = s.department || "CS";
    const matchesSearch = sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sProj.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = deptFilter === "All" || dept === deptFilter;

    return matchesSearch && matchesDept;
  });

  // Calculate totals
  const total = students.length;
  const cs = students.filter(s => (s.department || "CS") === "CS").length;
  const it = students.filter(s => s.department === "IT").length;
  const others = students.filter(s => (s.department || "CS") !== "CS" && s.department !== "IT").length;

  return (
    <div className="students-detail-container">
      <div className="detail-navigation-bar">
        <Link to="/admin/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="detail-page-header">
        <h2>Students Enrolled Directory</h2>
        <p>Overview of student registrations, departments, project guides and milestones progress.</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-stats-cards">
        <div className="stat-summary-card">
          <span className="summary-title">Total Students</span>
          <span className="summary-value">{total}</span>
        </div>
        <div className="stat-summary-card cs-border">
          <span className="summary-title">Computer Science</span>
          <span className="summary-value">{cs}</span>
        </div>
        <div className="stat-summary-card it-border">
          <span className="summary-title">Information Technology</span>
          <span className="summary-value">{it}</span>
        </div>
        <div className="stat-summary-card others-border">
          <span className="summary-title">Other Engineering</span>
          <span className="summary-value">{others}</span>
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
            placeholder="Search students, emails, or project titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="All">All Departments</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="EC">Electronics & Comm. (EC)</option>
            <option value="EE">Electrical Engineering (EE)</option>
          </select>
        </div>
      </div>

      <div className="details-table-card">
        <table className="details-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Department</th>
              <th>Enrolled Project</th>
              <th>Faculty Guide</th>
              <th>Project Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(s => {
                const sId = s.userId || s.UserId || s.id;
                const name = s.fullName || s.FullName || s.name || "Student";
                const emailStr = s.email || s.Email || "";
                const dept = s.department || "CS";
                const projTitle = s.projectTitle || s.ProjectTitle || "Academic Project";
                const guide = s.guideName || s.GuideName || "Faculty Guide";
                const progress = s.progress !== undefined ? s.progress : 50;

                return (
                  <tr key={sId}>
                    <td>
                      <div className="student-profile-cell">
                        <div className="student-avatar-initials">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-name-details">
                          <strong className="student-table-name">{name}</strong>
                          <span className="student-table-email">{emailStr}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="student-dept-badge">{dept}</span>
                    </td>
                    <td>
                      <span className="student-table-project" title={projTitle}>{projTitle}</span>
                    </td>
                    <td>
                      <span className="student-table-guide">{guide}</span>
                    </td>
                    <td>
                      <div className="student-progress-wrapper">
                        <span className="student-progress-label">{progress}%</span>
                        <div className="student-progress-bar-track">
                          <div
                            className="student-progress-bar-fill"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: progress === 100 ? "#10b981" : "#f59e0b"
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-records-cell">
                  No student records match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TotalStudentsDetail;
