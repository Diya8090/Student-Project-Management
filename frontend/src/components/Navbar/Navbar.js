import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

// Initial mock notifications
const INITIAL_NOTIFICATIONS = [
  { id: 1, text: "Aarav Patel submitted Milestone 2", time: "2 hrs ago", category: "Tasks", read: false },
  { id: 2, text: "Neha Sharma proposed E-Commerce Web App", time: "4 hrs ago", category: "System", read: false },
  { id: 3, text: "Dr. Ramesh Kumar approved IoT System review", time: "1 day ago", category: "Tasks", read: false }
];

function Navbar({ role }) {
  const navigate = useNavigate();
  const dashboardPath = `/${role}/dashboard`;

  const [currentUser, setCurrentUser] = useState(() => {
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
      admin: { fullName: "Dr. Ramesh Kumar" },
      faculty: { fullName: "Prof. Sunita Rao" },
      student: { fullName: "Aarav Patel" }
    };
    return defaults[role] || { fullName: "Profile" };
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState(INITIAL_NOTIFICATIONS);

  // Sync profile edits instantly
  useEffect(() => {
    const syncProfile = () => {
      const saved = localStorage.getItem("currentUser");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.role.toLowerCase() === role.toLowerCase()) {
            setCurrentUser(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener("profileUpdate", syncProfile);
    return () => window.removeEventListener("profileUpdate", syncProfile);
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Notification Actions
  const handleClearAll = () => {
    setNotificationsList([]);
  };

  const handleMarkAllRead = () => {
    setNotificationsList(notificationsList.map(notif => ({
      ...notif,
      read: true
    })));
  };

  // Calculate dynamic count badge
  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    <nav className={`navbar navbar-${role}`}>
      <div className="navbar-inner navbar-admin-inner">
        <Link to={dashboardPath} className="navbar-brand">
          <span className="navbar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <span className="navbar-title">Student Project Management</span>
        </Link>

        <div className="navbar-actions navbar-admin-actions">
          {/* Notifications Trigger */}
          <div className="notifications-container">
            <button
              type="button"
              className={`nav-icon-btn nav-notification-btn ${showNotifications ? "active" : ""}`}
              title="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="bell-icon">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-drawer-overlay" onClick={() => setShowNotifications(false)}>
                <div className="notifications-drawer-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="drawer-header">
                    <h3>Notifications Center</h3>
                    <button onClick={() => setShowNotifications(false)} className="btn-close-drawer">×</button>
                  </div>
                  
                  <div className="drawer-body">
                    {notificationsList.length > 0 ? (
                      notificationsList.map((notif) => (
                        <div key={notif.id} className={`drawer-notification-item ${notif.read ? "read-item" : ""}`}>
                          <div className="drawer-notif-header">
                            <span className="drawer-notif-category">{notif.category}</span>
                            <span className="drawer-notif-time">{notif.time}</span>
                          </div>
                          <p className="drawer-notif-text">{notif.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="drawer-empty-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty-bell-icon">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p className="empty-title">All caught up!</p>
                        <span className="empty-subtitle">You have no new alerts.</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="drawer-footer">
                    <button className="btn-clear-all" onClick={handleClearAll}>
                      Clear All
                    </button>
                    <button className="btn-mark-read" onClick={handleMarkAllRead}>
                      Mark Read
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Navigation Link */}
          <Link to={`/${role}/profile`} className="nav-profile-btn" title="Profile">
            <div className="nav-profile-avatar-wrapper">
              <img
                src={currentUser.profilePictureLink || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                alt={currentUser.fullName}
                className="nav-profile-avatar"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                }}
              />
            </div>
            <span className="profile-label">{currentUser.fullName}</span>
          </Link>

          {/* Logout Button with Icon */}
          <button type="button" className="btn-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logout-icon">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
