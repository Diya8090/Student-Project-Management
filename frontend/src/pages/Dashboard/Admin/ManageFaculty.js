import { useState, useEffect, useCallback } from "react";
import "./ManageFaculty.css";

const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

function ManageFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // Modal forms overlay state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "CS",
    designation: "Assistant Professor",
    supervisedCount: 0,
    mobileNumber: "",
  });

  // API helper with fallback
  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${PRIMARY_API_BASE}${endpoint}`, options);
      return res;
    } catch {
      const res = await fetch(`${FALLBACK_API_BASE}${endpoint}`, options);
      return res;
    }
  }, []);

  // Load Faculty & Projects from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Fetch Users
      const usersRes = await fetchApi("/User");
      if (!usersRes.ok) {
        throw new Error(`Failed to fetch users (Status: ${usersRes.status})`);
      }
      const allUsers = await usersRes.json();

      // Filter Faculty Guides (RoleId = 2 or Role = "Faculty")
      const facultyUsers = allUsers.filter(
        (u) =>
          u.roleId === 2 ||
          (u.role && u.role.toLowerCase() === "faculty") ||
          (u.Role && u.Role.toLowerCase() === "faculty")
      );

      // 2. Fetch Projects to calculate actual supervised count
      let projList = [];
      try {
        const projRes = await fetchApi("/Project");
        if (projRes.ok) {
          projList = await projRes.json();
        }
      } catch (pErr) {
        console.warn("Could not fetch projects for supervised count:", pErr);
      }

      // Map Faculty items
      const mappedFaculty = facultyUsers.map((f) => {
        const fId = f.userId ?? f.UserId ?? f.id;

        // Count projects assigned to this faculty guide
        const count = projList.filter(
          (p) => (p.facultyId ?? p.FacultyId) === fId
        ).length;

        return {
          id: fId,
          userId: fId,
          fullName: f.fullName || f.FullName || "",
          email: f.email || f.Email || "",
          department: f.department || "CS",
          designation: f.designation || "Professor",
          supervisedCount: count,
          mobileNumber: f.mobileNumber || f.MobileNumber || "",
          isActive: f.isActive !== undefined ? Boolean(f.isActive) : true,
        };
      });

      setFaculty(mappedFaculty);
    } catch (err) {
      console.error("Error loading faculty data:", err);
      setErrorMessage(
        "Failed to connect to backend database API. Ensure your .NET server is running on http://localhost:5239 or https://localhost:7145."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      department: "CS",
      designation: "Assistant Professor",
      supervisedCount: 0,
      mobileNumber: "",
    });
    setSelectedId(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleOpenEdit = (f) => {
    setFormData({
      fullName: f.fullName,
      email: f.email,
      password: "",
      department: f.department || "CS",
      designation: f.designation || "Assistant Professor",
      supervisedCount: f.supervisedCount || 0,
      mobileNumber: f.mobileNumber,
    });
    setSelectedId(f.id);
    setModalMode("edit");
    setShowModal(true);
  };

  // DELETE Faculty via API (DELETE /api/User/{id})
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this faculty record from database?")) {
      return;
    }

    try {
      const response = await fetchApi(`/User/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete faculty (Status: ${response.status})`);
      }

      setFaculty((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Error deleting faculty:", error);
      alert("Failed to delete faculty record: " + error.message);
    }
  };

  // POST / PUT Faculty via API (POST or PUT /api/User)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailClean = formData.email.trim();

    // Duplicate email check
    const emailExists = faculty.some(
      (f) =>
        f.email.toLowerCase() === emailClean.toLowerCase() &&
        (modalMode === "add" || f.id !== selectedId)
    );

    if (emailExists) {
      alert(`Error: A faculty member with email "${emailClean}" already exists.`);
      return;
    }

    const dtoPayload = {
      fullName: formData.fullName.trim(),
      email: emailClean,
      password: formData.password,
      mobileNumber: formData.mobileNumber.trim(),
      profilePicturePath: "",
      roleId: 2, // Faculty RoleId
      isActive: true,
      isDeleted: false,
    };

    if (modalMode === "add") {
      try {
        const response = await fetchApi("/User", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dtoPayload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Failed to create faculty (Status: ${response.status})`);
        }

        const createdUser = await response.json();
        const newId = createdUser.userId ?? createdUser.UserId;

        const newFaculty = {
          id: newId,
          userId: newId,
          fullName: dtoPayload.fullName,
          email: dtoPayload.email,
          department: formData.department,
          designation: formData.designation,
          supervisedCount: parseInt(formData.supervisedCount, 10) || 0,
          mobileNumber: dtoPayload.mobileNumber,
          isActive: true,
        };

        setFaculty((prev) => [...prev, newFaculty]);
        setShowModal(false);
      } catch (error) {
        console.error("Error creating faculty:", error);
        alert("Failed to add faculty: " + error.message);
      }
    } else {
      try {
        const response = await fetchApi(`/User/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dtoPayload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Failed to update faculty (Status: ${response.status})`);
        }

        setFaculty((prev) =>
          prev.map((f) => {
            if (f.id === selectedId) {
              return {
                ...f,
                fullName: dtoPayload.fullName,
                email: dtoPayload.email,
                department: formData.department,
                designation: formData.designation,
                supervisedCount: parseInt(formData.supervisedCount, 10) || 0,
                mobileNumber: dtoPayload.mobileNumber,
              };
            }
            return f;
          })
        );

        setShowModal(false);
      } catch (error) {
        console.error("Error updating faculty:", error);
        alert("Failed to update faculty: " + error.message);
      }
    }
  };

  // Filtered List
  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.mobileNumber.includes(searchQuery);

    const matchesDept = deptFilter === "All" || f.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="manage-faculty-container">
      <div className="faculty-page-header">
        <div>
          <h2>Manage Faculty Guides</h2>
          <p>Register faculty, modify designations, and monitor student supervision counts in SPM Database.</p>
        </div>

        <button onClick={handleOpenAdd} className="btn-add-faculty">
          + Add Faculty Guide
        </button>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{errorMessage}</span>
          <button
            onClick={loadData}
            style={{
              padding: "4px 10px",
              background: "#991b1b",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Directory Filters */}
      <div className="directory-filters">
        <div className="search-box-wrapper">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by faculty, email, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-dept-wrapper">
          <label>Department:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="EC">Electronics & Comm. (EC)</option>
            <option value="EE">Electrical Engineering (EE)</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="faculty-table-card">
          <p style={{ padding: "20px" }}>Loading faculty guides from SPM Database...</p>
        </div>
      ) : (
        /* Directory Table */
        <div className="faculty-table-card">
          <table className="faculty-table">
            <thead>
              <tr>
                <th>Faculty Name / Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Supervised Students</th>
                <th>Mobile Number</th>
                <th className="align-center">Action Controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.length > 0 ? (
                filteredFaculty.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="faculty-profile-cell">
                        <div className="faculty-avatar-initials">
                          {f.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="faculty-name-details">
                          <strong className="faculty-table-name">
                            {f.fullName}
                          </strong>
                          <span className="faculty-table-email">{f.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="faculty-dept-badge">
                        {f.department}
                      </span>
                    </td>
                    <td>
                      <span className="faculty-table-designation">
                        {f.designation}
                      </span>
                    </td>
                    <td>
                      <div className="supervised-badge-progress">
                        <span className="supervised-count-number">
                          {f.supervisedCount} / 10 Students
                        </span>
                        <div className="supervised-progress-bar">
                          <div
                            className="supervised-progress-fill"
                            style={{
                              width: `${Math.min(
                                (f.supervisedCount / 10) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="faculty-table-mobile">
                        {f.mobileNumber}
                      </span>
                    </td>
                    <td>
                      <div className="faculty-action-btns">
                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="btn-table-action btn-table-edit"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="btn-table-action btn-table-delete"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-records-cell">
                    No faculty records match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Popup Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {modalMode === "add"
                  ? "Register Faculty Guide Account"
                  : "Modify Faculty Details"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close-modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@university.edu"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  {modalMode === "add"
                    ? "Password"
                    : "Password (leave blank to keep unchanged)"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    modalMode === "add"
                      ? "Enter login password"
                      : "Enter new password (optional)"
                  }
                  required={modalMode === "add"}
                />
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="CS">Computer Science (CS)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="EC">Electronics & Comm. (EC)</option>
                    <option value="EE">Electrical Engineering (EE)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Designation</label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Supervised Count</label>
                  <input
                    type="number"
                    name="supervisedCount"
                    value={formData.supervisedCount}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    required
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-modal-submit">
                  {modalMode === "add" ? "Register Guide" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-modal-cancel"
                >
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

export default ManageFaculty;

