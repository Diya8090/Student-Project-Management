import { useState } from "react";
import "./ManageRoles.css";

const INITIAL_ROLES = [
  {
    RoleId: 1,
    roleName: "Admin",
    description: "System Administrators with full platform access and management rights.",
    permissions: {
      projects: { read: true, write: true, delete: true, approve: true },
      tasks: { read: true, write: true, delete: true, approve: true },
      users: { read: true, write: true, delete: true, approve: true },
      roles: { read: true, write: true, delete: true, approve: true },
    }
  },
  {
    RoleId: 2,
    roleName: "Faculty",
    description: "Project mentors and guides who supervise student project progress and reviews.",
    permissions: {
      projects: { read: true, write: false, delete: false, approve: true },
      tasks: { read: true, write: true, delete: true, approve: false },
      users: { read: true, write: false, delete: false, approve: false },
      roles: { read: false, write: false, delete: false, approve: false },
    }
  },
  {
    RoleId: 3,
    roleName: "Student",
    description: "Standard users who register projects, submit milestones, and upload tasks.",
    permissions: {
      projects: { read: true, write: true, delete: false, approve: false },
      tasks: { read: true, write: true, delete: false, approve: false },
      users: { read: false, write: false, delete: false, approve: false },
      roles: { read: false, write: false, delete: false, approve: false },
    }
  }
];

function ManageRoles() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [showAddRole, setShowAddRole] = useState(false);

  // Toggle permissions
  const handleTogglePermission = (module, action) => {
    const updatedRoles = [...roles];
    const role = updatedRoles[selectedRoleIndex];
    role.permissions[module][action] = !role.permissions[module][action];
    setRoles(updatedRoles);
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) return;

    const roleNameClean = newRole.name.trim();
    const roleExists = roles.some(r => r.roleName.toLowerCase() === roleNameClean.toLowerCase());
    if (roleExists) {
      alert(`Error: A role with the name "${roleNameClean}" already exists.`);
      return;
    }

    const newRoleData = {
      RoleId: roles.length > 0 ? Math.max(...roles.map(r => r.RoleId || 0)) + 1 : 1,
      roleName: roleNameClean,
      description: newRole.description.trim() || "Custom defined role permissions.",
      permissions: {
        projects: { read: false, write: false, delete: false, approve: false },
        tasks: { read: false, write: false, delete: false, approve: false },
        users: { read: false, write: false, delete: false, approve: false },
        roles: { read: false, write: false, delete: false, approve: false },
      }
    };

    setRoles([...roles, newRoleData]);
    setSelectedRoleIndex(roles.length); // auto select newly created role
    setNewRole({ name: "", description: "" });
    setShowAddRole(false);
  };

  const activeRole = roles[selectedRoleIndex];

  // Helper count of total permissions enabled for active role
  const getEnabledCount = (role) => {
    let count = 0;
    Object.keys(role.permissions).forEach(mod => {
      Object.keys(role.permissions[mod]).forEach(act => {
        if (role.permissions[mod][act]) count++;
      });
    });
    return count;
  };

  return (
    <div className="manage-roles-container">
      <div className="roles-header">
        <div>
          <h2>Role & Access Management</h2>
          <p>Configure user roles and granular access permissions across modules.</p>
        </div>
        <button onClick={() => setShowAddRole(!showAddRole)} className="btn-add-role-toggle">
          {showAddRole ? "Close Form" : "+ Create Custom Role"}
        </button>
      </div>

      {showAddRole && (
        <form onSubmit={handleAddRole} className="add-role-panel">
          <h3>Create Custom Role</h3>
          <div className="add-role-form-grid">
            <div className="form-group">
              <label>Role Name</label>
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="e.g. Coordinator"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Brief role scope description"
              />
            </div>
          </div>
          <button type="submit" className="btn-save-new-role">Create Role</button>
        </form>
      )}

      <div className="roles-dashboard-grid">
        {/* Roles Directory (Left List) */}
        <div className="roles-directory-box">
          <div className="box-section-title">Available Roles</div>
          <div className="roles-list">
            {roles.map((r, idx) => (
              <div
                key={r.roleName}
                className={`role-item-card ${selectedRoleIndex === idx ? "active" : ""}`}
                onClick={() => setSelectedRoleIndex(idx)}
              >
                <div className="role-item-header">
                  <h4>{r.roleName}</h4>
                  <span className="permissions-badge">{getEnabledCount(r)} Permissions</span>
                </div>
                <p className="role-item-desc">{r.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Configuration Grid (Right Panel) */}
        <div className="permissions-config-box">
          <div className="config-header">
            <h3>Configure Access for: <span className="active-role-highlight">{activeRole.roleName}</span></h3>
            <p>Define what actions users in this group are authorized to perform.</p>
          </div>

          <div className="permissions-table">
            <div className="p-table-header">
              <div className="col-module">Module / Scope</div>
              <div className="col-action">Read</div>
              <div className="col-action">Write</div>
              <div className="col-action">Delete</div>
              <div className="col-action">Approve</div>
            </div>

            {Object.keys(activeRole.permissions).map((mod) => (
              <div key={mod} className="p-table-row">
                <div className="col-module module-name-label">
                  <strong>{mod.toUpperCase()}</strong>
                  <span>Access to system {mod}</span>
                </div>
                {["read", "write", "delete", "approve"].map((action) => (
                  <div key={action} className="col-action">
                    <label className="switch-toggle-wrapper">
                      <input
                        type="checkbox"
                        checked={activeRole.permissions[mod][action]}
                        onChange={() => handleTogglePermission(mod, action)}
                      />
                      <span className="slider-round-switch"></span>
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageRoles;
