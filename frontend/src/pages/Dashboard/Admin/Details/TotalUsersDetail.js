import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TotalUsersDetail.css";

const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

function TotalUsersDetail() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
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
    fetchApi("/User")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users in detail view:", err);
        setLoading(false);
      });
  }, [fetchApi]);

  const filteredUsers = users.filter(u => {
    const name = u.fullName || u.FullName || "";
    const emailStr = u.email || u.Email || "";
    const phone = u.mobileNumber || u.MobileNumber || "";
    const userRole = u.role || u.Role || (u.roleId === 1 ? "Admin" : u.roleId === 2 ? "Faculty" : "Student");
    const isActive = u.isActive !== undefined ? u.isActive : u.IsActive;
    const userStatus = u.status ? u.status : (isActive ? "Active" : "Inactive");

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "All" || userRole.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "All" || userStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate totals
  const total = users.length;
  const admins = users.filter(u => (u.role || u.Role || (u.roleId === 1 ? "Admin" : "")) === "Admin").length;
  const faculty = users.filter(u => (u.role || u.Role || (u.roleId === 2 ? "Faculty" : "")) === "Faculty").length;
  const students = users.filter(u => (u.role || u.Role || (u.roleId === 3 ? "Student" : "")) === "Student").length;

  return (
    <div className="users-detail-container">
      <div className="detail-navigation-bar">
        <Link to="/admin/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="detail-page-header">
        <h2>Total System Users</h2>
        <p>Comprehensive register of all administrators, guides, and student accounts.</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-stats-cards">
        <div className="stat-summary-card">
          <span className="summary-title">Total Registered</span>
          <span className="summary-value">{total}</span>
        </div>
        <div className="stat-summary-card admin-border">
          <span className="summary-title">System Admins</span>
          <span className="summary-value">{admins}</span>
        </div>
        <div className="stat-summary-card faculty-border">
          <span className="summary-title">Faculty Guides</span>
          <span className="summary-value">{faculty}</span>
        </div>
        <div className="stat-summary-card student-border">
          <span className="summary-title">Students</span>
          <span className="summary-value">{students}</span>
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
            placeholder="Search users name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Faculty">Faculty</option>
            <option value="Student">Student</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="details-table-card">
        <table className="details-table">
          <thead>
            <tr>
              <th>User Info</th>
              <th>Role</th>
              <th>Mobile Number</th>
              <th>Status</th>
              <th>Last Logged In</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => {
                const uId = u.userId || u.UserId || u.id;
                const name = u.fullName || u.FullName || "User";
                const emailStr = u.email || u.Email || "";
                const mobile = u.mobileNumber || u.MobileNumber || "N/A";
                const userRole = u.role || u.Role || (u.roleId === 1 ? "Admin" : u.roleId === 2 ? "Faculty" : "Student");
                const isActive = u.isActive !== undefined ? u.isActive : (u.IsActive !== undefined ? u.IsActive : true);
                const userStatus = u.status ? u.status : (isActive ? "Active" : "Inactive");
                const lastLogin = u.lastLogin || u.LastLogin || "Recently";

                return (
                  <tr key={uId}>
                    <td>
                      <div className="user-profile-cell">
                        <div className={`user-avatar-initials role-color-${userRole.toLowerCase()}`}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-name-details">
                          <strong className="user-table-name">{name}</strong>
                          <span className="user-table-email">{emailStr}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`user-role-badge role-${userRole.toLowerCase()}`}>
                        {userRole}
                      </span>
                    </td>
                    <td>
                      <span className="user-table-mobile">{mobile}</span>
                    </td>
                    <td>
                      <span className={`user-status-pill status-${userStatus.toLowerCase()}`}>
                        {userStatus}
                      </span>
                    </td>
                    <td>
                      <span className="user-table-login">{lastLogin}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-records-cell">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TotalUsersDetail;
