import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TotalFacultyDetail.css";

const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

function TotalFacultyDetail() {
  const [faculty, setFaculty] = useState([]);
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
          const facultyList = data.filter(
            (u) =>
              u.roleId === 2 ||
              (u.role && u.role.toLowerCase() === "faculty") ||
              (u.Role && u.Role.toLowerCase() === "faculty")
          );
          setFaculty(facultyList);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching faculty in detail view:", err);
        setLoading(false);
      });
  }, [fetchApi]);

  const filteredFaculty = faculty.filter(f => {
    const name = f.fullName || f.FullName || f.name || "";
    const emailStr = f.email || f.Email || "";
    const desig = f.designation || "Professor";
    const dept = f.department || "CS";

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desig.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = deptFilter === "All" || dept === deptFilter;

    return matchesSearch && matchesDept;
  });

  // Calculate totals
  const total = faculty.length;
  const cs = faculty.filter(f => (f.department || "CS") === "CS").length;
  const it = faculty.filter(f => f.department === "IT").length;
  const others = faculty.filter(f => (f.department || "CS") !== "CS" && f.department !== "IT").length;

  return (
    <div className="faculty-detail-container">
      <div className="detail-navigation-bar">
        <Link to="/admin/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="detail-page-header">
        <h2>Faculty Mentors Registry</h2>
        <p>Information directory of faculty guides, academic supervision workload, and departments.</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-stats-cards">
        <div className="stat-summary-card">
          <span className="summary-title">Total Faculty</span>
          <span className="summary-value">{total}</span>
        </div>
        <div className="stat-summary-card cs-border">
          <span className="summary-title">CS Department</span>
          <span className="summary-value">{cs}</span>
        </div>
        <div className="stat-summary-card it-border">
          <span className="summary-title">IT Department</span>
          <span className="summary-value">{it}</span>
        </div>
        <div className="stat-summary-card others-border">
          <span className="summary-title">Other Fields</span>
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
            placeholder="Search guides by name, email, or designation..."
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
              <th>Guide Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Supervised Ratio</th>
              <th>Ongoing Projects</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map(f => {
                const fId = f.userId || f.UserId || f.id;
                const name = f.fullName || f.FullName || f.name || "Faculty Guide";
                const emailStr = f.email || f.Email || "";
                const desig = f.designation || "Professor";
                const dept = f.department || "CS";
                const count = f.supervisedCount !== undefined ? f.supervisedCount : 3;
                const projList = Array.isArray(f.projects) ? f.projects : ["Academic Supervision"];

                return (
                  <tr key={fId}>
                    <td>
                      <div className="faculty-profile-cell">
                        <div className="faculty-avatar-initials">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="faculty-name-details">
                          <strong className="faculty-table-name">{name}</strong>
                          <span className="faculty-table-email">{emailStr}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="faculty-table-designation">{desig}</span>
                    </td>
                    <td>
                      <span className="faculty-dept-badge">{dept}</span>
                    </td>
                    <td>
                      <div className="supervised-badge-progress">
                        <span className="supervised-count-number">{count} / 10 Students</span>
                        <div className="supervised-progress-bar">
                          <div
                            className="supervised-progress-fill"
                            style={{ width: `${(count / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="faculty-projects-cell">
                        {projList.map((proj, idx) => (
                          <span key={idx} className="faculty-proj-tag" title={proj}>
                            {proj}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-records-cell">
                  No guides match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TotalFacultyDetail;
