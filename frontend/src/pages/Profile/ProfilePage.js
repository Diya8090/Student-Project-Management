import { useState } from "react";
import "./ProfilePage.css";

function ProfilePage({ role }) {
  // Load initial user details
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role.toLowerCase() === role.toLowerCase()) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const defaults = {
      admin: {
        fullName: "Dr. Ramesh Kumar",
        email: "admin@university.edu",
        mobileNumber: "+1 (555) 019-2834",
        profilePictureLink: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        isActive: true,
        role: "Admin"
      },
      faculty: {
        fullName: "Prof. Sunita Rao",
        email: "sunita.rao@university.edu",
        mobileNumber: "+1 (555) 014-9876",
        profilePictureLink: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        isActive: true,
        role: "Faculty"
      },
      student: {
        fullName: "Aarav Patel",
        email: "aarav.patel@student.university.edu",
        mobileNumber: "+1 (555) 017-4321",
        profilePictureLink: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        isActive: true,
        role: "Student"
      }
    };
    return defaults[role] || defaults.student;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    email: profile.email,
    mobileNumber: profile.mobileNumber
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobileNumber.trim()) {
      showAlert("error", "All fields must be completed.");
      return;
    }
    const updated = { ...profile, ...formData };
    setProfile(updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
    window.dispatchEvent(new Event("profileUpdate"));
    setIsEditing(false);
    showAlert("success", "Profile details updated successfully!");
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showAlert("error", "Please fill in all password fields.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert("error", "New Password and Confirm Password do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showAlert("error", "New password should be at least 6 characters.");
      return;
    }
    const updated = { ...profile, password: passwordData.newPassword };
    setProfile(updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsEditing(false);
    showAlert("success", "Password updated successfully!");
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 4000);
  };

  const triggerEdit = () => {
    setFormData({
      fullName: profile.fullName,
      email: profile.email,
      mobileNumber: profile.mobileNumber
    });
    setIsEditing(true);
  };

  return (
    <div className="profile-page-container">
      {alert.show && (
        <div className={`toast-alert alert-${alert.type}`}>
          <span className="alert-icon">{alert.type === "success" ? "✓" : "⚠"}</span>
          <span className="alert-message">{alert.message}</span>
        </div>
      )}

      {/* Profile Header Widget */}
      <div className="profile-hero-card">
        <div className="profile-hero-image-wrapper">
          <img
            src={profile.profilePictureLink || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
            alt={profile.fullName}
            className="profile-hero-image"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
            }}
          />
        </div>
        <div className="profile-hero-info">
          <div className="profile-hero-meta">
            <h2>{profile.fullName}</h2>
            <span className={`profile-badge badge-${role}`}>{profile.role}</span>
          </div>
          <p className="profile-hero-email">{profile.email}</p>
          <div className="profile-status-pill">
            <span className="status-dot-pulse"></span>
            Active Account
          </div>
        </div>
      </div>

      {!isEditing ? (
        /* Read-Only Mode */
        <div className="profile-card profile-details-summary-card">
          <div className="profile-card-header">
            <h3>Personal Information</h3>
            <p>Your academic profile and contact details.</p>
          </div>
          <div className="profile-details-list">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{profile.fullName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{profile.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mobile Number</span>
              <span className="detail-value">{profile.mobileNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">System Role</span>
              <span className="detail-value">{profile.role}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account Status</span>
              <span className="detail-value status-active-pill">Active</span>
            </div>
          </div>
          <div className="profile-summary-actions">
            <button onClick={triggerEdit} className="btn-profile-edit-trigger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="edit-trigger-icon">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile & Security Settings
            </button>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="profile-forms-grid-container">
          <div className="edit-mode-header">
            <button onClick={() => setIsEditing(false)} className="btn-edit-cancel-back">
              ← Back to Profile
            </button>
          </div>
          <div className="profile-forms-grid">
            {/* Account Details Card */}
            <div className="profile-card personal-info-card">
              <div className="profile-card-header">
                <h3>Account Settings</h3>
                <p>Update your personal details below.</p>
              </div>
              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleProfileChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number</label>
                  <input
                    id="mobileNumber"
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleProfileChange}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>

                <div className="profile-form-buttons">
                  <button type="submit" className="btn-profile-save">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-profile-cancel">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="profile-card security-card">
              <div className="profile-card-header">
                <h3>Security Controls</h3>
                <p>Update your account password for safety.</p>
              </div>
              <form onSubmit={handleUpdatePassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="currentPassword"
                      type={showPassword.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-view"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    >
                      {showPassword.current ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="newPassword"
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-view"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    >
                      {showPassword.new ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-view"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    >
                      {showPassword.confirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="profile-form-buttons">
                  <button type="submit" className="btn-profile-save btn-security">
                    Update Password
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-profile-cancel">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
