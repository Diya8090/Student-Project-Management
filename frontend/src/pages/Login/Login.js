import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const ROLE_ROUTES = {
  Admin: "/admin/dashboard",
  Faculty: "/faculty/dashboard",
  Student: "/student/dashboard",
};

const ROLES = [
  {
    value: "Student",
    label: "Student",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
  {
    value: "Faculty",
    label: "Faculty",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    value: "Admin",
    label: "Admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "Student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setLoginData({ ...loginData, role });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const defaults = {
        Student: {
          fullName: "Aarav Patel",
          email: loginData.email || "aarav.patel@student.university.edu",
          mobileNumber: "+1 (555) 017-4321",
          profilePictureLink: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          isActive: true,
          role: "Student"
        },
        Faculty: {
          fullName: "Prof. Sunita Rao",
          email: loginData.email || "sunita.rao@university.edu",
          mobileNumber: "+1 (555) 014-9876",
          profilePictureLink: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          isActive: true,
          role: "Faculty"
        },
        Admin: {
          fullName: "Dr. Ramesh Kumar",
          email: loginData.email || "admin@university.edu",
          mobileNumber: "+1 (555) 019-2834",
          profilePictureLink: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          isActive: true,
          role: "Admin"
        }
      };

      const userProfile = defaults[loginData.role] || defaults.Student;
      localStorage.setItem("currentUser", JSON.stringify(userProfile));

      console.log(loginData);
      navigate(ROLE_ROUTES[loginData.role]);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className="login-container">
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-badge">Academic Portal</div>
            <h1>
              Manage projects,
              <span> shape futures.</span>
            </h1>
            <p>
              A unified platform for students, faculty, and administrators to
              collaborate on academic projects seamlessly.
            </p>

            <ul className="brand-features">
              <li>
                <span className="feature-icon">📋</span>
                Track project milestones in real time
              </li>
              <li>
                <span className="feature-icon">👥</span>
                Collaborate across departments
              </li>
              <li>
                <span className="feature-icon">📊</span>
                Insights & progress dashboards
              </li>
            </ul>
          </div>

          <div className="brand-footer">
            <span>© 2026 Student Project Management</span>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-card">
            <div className="card-h">
              <div className="logo-ring">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2>Welcome back</h2>
              <p>Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email address</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    name="email"
                    value={loginData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Sign in as</label>
                <div className="role-selector">
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      className={`role-pill ${loginData.role === role.value ? "active" : ""}`}
                      onClick={() => handleRoleSelect(role.value)}
                    >
                      <span className="role-icon">{role.icon}</span>
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className={`btn-login ${isSubmitting ? "loading" : ""}`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner" />
                ) : (
                  <>
                    Log In
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

              <div className="extra-links">
                <a href="#">Forgot password?</a>
                <a href="#">Contact admin</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
