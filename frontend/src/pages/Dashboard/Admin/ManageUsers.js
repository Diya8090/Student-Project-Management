import { useState, useEffect, useCallback } from "react";
import "./ManageUsers.css";

// API Base URLs (.NET Backend supports http on 5239 and https on 7145)
const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

const DEFAULT_ROLES = [
  { roleId: 1, roleName: "Admin" },
  { roleId: 2, roleName: "Faculty" },
  { roleId: 3, roleName: "Student" },
];

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: 3, // Default Student
    mobileNumber: "",
    isActive: true,
  });

  // Helper: map roleName to roleId
  const getRoleIdFromName = useCallback(
    (roleName) => {
      if (!roleName) return 3; // default Student
      const match = roles.find(
        (r) => r.roleName.toLowerCase() === String(roleName).toLowerCase()
      );
      if (match) return match.roleId;
      if (roleName.toLowerCase() === "admin") return 1;
      if (roleName.toLowerCase() === "faculty") return 2;
      return 3;
    },
    [roles]
  );

  // Helper: map roleId to roleName
  const getRoleNameFromId = useCallback(
    (roleId) => {
      const match = roles.find((r) => r.roleId === Number(roleId));
      if (match) return match.roleName;
      if (Number(roleId) === 1) return "Admin";
      if (Number(roleId) === 2) return "Faculty";
      return "Student";
    },
    [roles]
  );

  // Api fetch wrapper with fallback port support
  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${PRIMARY_API_BASE}${endpoint}`, options);
      return res;
    } catch {
      // If http://localhost:5239 fails (e.g. SSL or port issue), try fallback https://localhost:7145
      const res = await fetch(`${FALLBACK_API_BASE}${endpoint}`, options);
      return res;
    }
  }, []);

  // Fetch Users & Roles on component load
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Fetch Roles
      try {
        const rolesRes = await fetchApi("/Role");
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          if (Array.isArray(rolesData) && rolesData.length > 0) {
            setRoles(rolesData);
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic roles from API, using default role mapping:", err);
      }

      // 2. Fetch Users
      const usersRes = await fetchApi("/User");
      if (!usersRes.ok) {
        throw new Error(`Server returned status ${usersRes.status}`);
      }

      const usersData = await usersRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setErrorMessage(
        "Failed to load users from backend API. Please make sure your .NET API is running on localhost (http://localhost:5239 or https://localhost:7145)."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Form input handler
  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  // Toggle Active Status via API (PUT /api/User/{id})
  const handleToggleStatus = async (userId) => {
    const userToUpdate = users.find(
      (u) => (u.userId ?? u.UserId ?? u.id) === userId
    );

    if (!userToUpdate) return;

    const currentStatus = Boolean(userToUpdate.isActive ?? userToUpdate.IsActive);
    const updatedStatus = !currentStatus;

    // AddEditUserDTO model payload
    const dtoPayload = {
      fullName: userToUpdate.fullName || userToUpdate.FullName || "",
      email: userToUpdate.email || userToUpdate.Email || "",
      password: "", // Keep unchanged
      mobileNumber: userToUpdate.mobileNumber || userToUpdate.MobileNumber || "",
      profilePicturePath: userToUpdate.profilePicturePath || userToUpdate.ProfilePicturePath || "",
      roleId: userToUpdate.roleId || userToUpdate.RoleId || getRoleIdFromName(userToUpdate.role || userToUpdate.Role),
      isActive: updatedStatus,
      isDeleted: userToUpdate.isDeleted ?? userToUpdate.IsDeleted ?? false,
    };

    try {
      const response = await fetchApi(`/User/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dtoPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status (Status Code: ${response.status})`);
      }

      // HTTP 204 No Content returned on success, update state locally
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          const uId = u.userId ?? u.UserId ?? u.id;
          return uId === userId
            ? { ...u, isActive: updatedStatus, IsActive: updatedStatus }
            : u;
        })
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update user active status: " + error.message);
    }
  };

  // Open Modal for Create New User
  const handleOpenAdd = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      roleId: roles.length > 0 ? roles[0].roleId : 3,
      mobileNumber: "",
      isActive: true,
    });
    setSelectedUserId(null);
    setModalMode("add");
    setShowModal(true);
  };

  // Open Modal for Edit User
  const handleOpenEdit = (user) => {
    const userId = user.userId ?? user.UserId ?? user.id;
    const currentRoleId =
      user.roleId ??
      user.RoleId ??
      getRoleIdFromName(user.role ?? user.Role);

    setFormData({
      fullName: user.fullName || user.FullName || "",
      email: user.email || user.Email || "",
      password: "", // Blank by default, user enters new password only if changing
      roleId: currentRoleId,
      mobileNumber: user.mobileNumber || user.MobileNumber || "",
      isActive: user.isActive !== undefined ? Boolean(user.isActive) : Boolean(user.IsActive),
    });

    setSelectedUserId(userId);
    setModalMode("edit");
    setShowModal(true);
  };

  // Delete User via API (DELETE /api/User/{id})
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetchApi(`/User/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user (Status Code: ${response.status})`);
      }

      // HTTP 204 No Content returned on success
      setUsers((prevUsers) =>
        prevUsers.filter((u) => (u.userId ?? u.UserId ?? u.id) !== userId)
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user: " + error.message);
    }
  };

  // Handle Create/Edit Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailClean = formData.email.trim();

    // Validate email duplicate
    const emailExists = users.some((u) => {
      const uEmail = (u.email || u.Email || "").toLowerCase();
      const uId = u.userId ?? u.UserId ?? u.id;
      return (
        uEmail === emailClean.toLowerCase() &&
        (modalMode === "add" || uId !== selectedUserId)
      );
    });

    if (emailExists) {
      alert(`Error: A user with email "${emailClean}" already exists.`);
      return;
    }

    const roleIdInt = parseInt(formData.roleId, 10) || 3;
    const roleNameStr = getRoleNameFromId(roleIdInt);

    const dtoPayload = {
      fullName: formData.fullName.trim(),
      email: emailClean,
      password: formData.password,
      mobileNumber: formData.mobileNumber.trim(),
      profilePicturePath: "",
      roleId: roleIdInt,
      isActive: Boolean(formData.isActive),
      isDeleted: false,
    };

    // ==================================================
    // ADD USER - POST /api/User
    // ==================================================
    if (modalMode === "add") {
      try {
        const response = await fetchApi("/User", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dtoPayload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Server responded with status ${response.status}`);
        }

        // POST returns CreatedAtAction with GetUserDTO object
        const createdUser = await response.json();

        setUsers((prevUsers) => [...prevUsers, createdUser]);
        setShowModal(false);
      } catch (error) {
        console.error("Error adding user:", error);
        alert("Failed to add user: " + error.message);
      }
    }
    // ==================================================
    // EDIT USER - PUT /api/User/{id}
    // ==================================================
    else {
      try {
        const response = await fetchApi(`/User/${selectedUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dtoPayload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Server responded with status ${response.status}`);
        }

        // PUT returns 204 No Content (No JSON body)
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            const uId = u.userId ?? u.UserId ?? u.id;
            if (uId === selectedUserId) {
              return {
                ...u,
                userId: selectedUserId,
                UserId: selectedUserId,
                fullName: dtoPayload.fullName,
                FullName: dtoPayload.fullName,
                email: dtoPayload.email,
                Email: dtoPayload.email,
                mobileNumber: dtoPayload.mobileNumber,
                MobileNumber: dtoPayload.mobileNumber,
                roleId: roleIdInt,
                RoleId: roleIdInt,
                role: roleNameStr,
                Role: roleNameStr,
                isActive: dtoPayload.isActive,
                IsActive: dtoPayload.isActive,
              };
            }
            return u;
          })
        );

        setShowModal(false);
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Failed to update user: " + error.message);
      }
    }
  };

  // Filter Users
  const filteredUsers = users.filter((user) => {
    const fullName = user.fullName || user.FullName || "";
    const email = user.email || user.Email || "";
    const mobileNumber = user.mobileNumber || user.MobileNumber || "";
    const role = user.role || user.Role || getRoleNameFromId(user.roleId || user.RoleId);

    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mobileNumber.includes(searchQuery);

    const matchesRole =
      roleFilter === "All" ||
      role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="manage-users-container">
      <div className="users-page-header">
        <div>
          <h2>User Management Directory</h2>
          <p>Register, modify, and monitor SPM system user accounts.</p>
        </div>

        <button onClick={handleOpenAdd} className="btn-add-user">
          + Add New User
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

      {/* Directory Filter controls */}
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
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-role-wrapper">
          <label>Filter Role:</label>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            {roles.map((r) => (
              <option key={r.roleId} value={r.roleName}>
                {r.roleName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="users-table-card">
          <p style={{ padding: "20px" }}>Loading users from SPM Database...</p>
        </div>
      ) : (
        /* Directory Table */
        <div className="users-table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Profile Name / Email</th>
                <th>System Role</th>
                <th>Mobile Number</th>
                <th>Active Status</th>
                <th className="align-center">Action Controls</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const userId = user.userId ?? user.UserId ?? user.id;
                  const fullName = user.fullName || user.FullName || "Unnamed";
                  const email = user.email || user.Email || "No email";
                  const role =
                    user.role ||
                    user.Role ||
                    getRoleNameFromId(user.roleId || user.RoleId);
                  const mobileNumber = user.mobileNumber || user.MobileNumber || "-";
                  const isActive =
                    user.isActive !== undefined
                      ? Boolean(user.isActive)
                      : Boolean(user.IsActive);

                  return (
                    <tr key={userId}>
                      <td>
                        <div className="user-profile-cell">
                          <div className="user-avatar-initials">
                            {fullName.charAt(0).toUpperCase()}
                          </div>

                          <div className="user-name-details">
                            <strong className="user-table-name">
                              {fullName}
                            </strong>
                            <span className="user-table-email">{email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`user-role-pill r-pill-${role.toLowerCase()}`}
                        >
                          {role}
                        </span>
                      </td>

                      <td>
                        <span className="user-table-mobile">
                          {mobileNumber}
                        </span>
                      </td>

                      <td>
                        <label className="switch-toggle-wrapper">
                          <input
                            type="checkbox"
                            checked={Boolean(isActive)}
                            onChange={() => handleToggleStatus(userId)}
                          />
                          <span className="slider-round-switch"></span>
                        </label>
                      </td>

                      <td>
                        <div className="user-action-btns">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="btn-table-action btn-table-edit"
                            title="Edit"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(userId)}
                            className="btn-table-action btn-table-delete"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="no-records-cell">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {modalMode === "add"
                  ? "Create New User Account"
                  : "Edit User Account"}
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
                  {modalMode === "add" ? "Password" : "Password (leave blank to keep unchanged)"}
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
                  <label>System Role</label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                  >
                    {roles.map((r) => (
                      <option key={r.roleId} value={r.roleId}>
                        {r.roleName}
                      </option>
                    ))}
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

              <div className="form-group checkbox-form-group">
                <label className="checkbox-label-wrapper">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span>Mark Account Active</span>
                </label>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-modal-submit">
                  {modalMode === "add" ? "Add User" : "Save Changes"}
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

export default ManageUsers;