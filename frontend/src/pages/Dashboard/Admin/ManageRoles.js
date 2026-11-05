import { useState, useEffect } from "react";
import "./ManageRoles.css";
import { rolesApi, unwrapData } from "../../../services/api";

const DEFAULT_PERMISSIONS = {
  projects: { read: true, write: true, delete: false, approve: false },
  tasks: { read: true, write: true, delete: false, approve: false },
  users: { read: false, write: false, delete: false, approve: false },
  roles: { read: false, write: false, delete: false, approve: false }
};

const INITIAL_ROLES = [
  {
    RoleId: 1,
    roleName: "Admin",
    description: "System Administrators with full platform access and management rights.",
    permissions: {
      projects: { read: true, write: true, delete: true, approve: true },
      tasks: { read: true, write: true, delete: true, approve: true },
      users: { read: true, write: true, delete: true, approve: true },
      roles: { read: true, write: true, delete: true, approve: true }
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
      roles: { read: false, write: false, delete: false, approve: false }
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
      roles: { read: false, write: false, delete: false, approve: false }
    }
  }
];

function ManageRoles() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [showAddRole, setShowAddRole] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await rolesApi.getAll();
      const rawRoles = unwrapData(res) || [];

      if (rawRoles.length > 0) {
        const mergedRoles = rawRoles.map((r) => {
          const rId = r.roleId || r.RoleId;
          const rName = r.roleName || r.RoleName;
          const rDesc = r.description || r.Description || "System role.";

          const existingPreset = INITIAL_ROLES.find(
            (p) => p.roleName.toLowerCase() === rName.toLowerCase()
          );

          return {
            RoleId: rId,
            roleName: rName,
            description: rDesc,
            permissions: existingPreset
              ? JSON.parse(JSON.stringify(existingPreset.permissions))
              : JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
          };
        });
        setRoles(mergedRoles);
      }
    } catch (e) {
      console.warn("Could not fetch roles from server:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Toggle permissions
  const handleTogglePermission = (module, action) => {
    const updatedRoles = [...roles];
    const role = updatedRoles[selectedRoleIndex];
    if (role && role.permissions && role.permissions[module]) {
      role.permissions[module][action] = !role.permissions[module][action];
      setRoles(updatedRoles);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) return;

    const roleNameClean = newRole.name.trim();
    const roleExists = roles.some((r) => r.roleName.toLowerCase() === roleNameClean.toLowerCase());
    if (roleExists) {
      alert(`Error: A role with the name "${roleNameClean}" already exists.`);
      return;
    }

    try {
      await rolesApi.create({
        roleName: roleNameClean,
        description: newRole.description.trim() || "Custom defined role permissions."
      });
      await loadRoles();
      setSelectedRoleIndex(roles.length);
      setNewRole({ name: "", description: "" });
      setShowAddRole(false);
    } catch (err) {
      console.error("Failed to add role:", err);
      // Fallback local addition if needed
      const newRoleData = {
        RoleId: roles.length > 0 ? Math.max(...roles.map((r) => r.RoleId || 0)) + 1 : 1,
        roleName: roleNameClean,
        description: newRole.description.trim() || "Custom defined role permissions.",
        permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
      };
      setRoles([...roles, newRoleData]);
      setSelectedRoleIndex(roles.length);
      setNewRole({ name: "", description: "" });
      setShowAddRole(false);
    }
  };

  const activeRole = roles[selectedRoleIndex] || roles[0] || INITIAL_ROLES[0];

  // Helper count of total permissions enabled for active role
  const getEnabledCount = (role) => {
    if (!role || !role.permissions) return 0;
    let count = 0;
    Object.keys(role.permissions).forEach((mod) => {
      Object.keys(role.permissions[mod]).forEach((act) => {
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
          <p>Configure user roles and granular access permissions across modules connected to database.</p>
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
          <div className="box-section-title">Available Roles {loading ? "(Syncing...)" : ""}</div>
          <div className="roles-list">
            {roles.map((r, idx) => (
              <div
                key={r.roleName || idx}
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

            {activeRole.permissions &&
              Object.keys(activeRole.permissions).map((mod) => (
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
