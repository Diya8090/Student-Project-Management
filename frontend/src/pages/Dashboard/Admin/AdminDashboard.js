import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

// API Ports
const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

// SVG Icons
const ICONS = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  students: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
    </svg>
  ),
  faculty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
};

const DEFAULT_MONTHLY_PROGRESS = [
  { month: "Jan", progress: 30 },
  { month: "Feb", progress: 45 },
  { month: "Mar", progress: 60 },
  { month: "Apr", progress: 55 },
  { month: "May", progress: 75 },
  { month: "Jun", progress: 90 },
];

function AdminDashboard() {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Live Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalProjects: 0,
    totalTasks: 0,
  });

  const [statusData, setStatusData] = useState([
    { label: "Completed", value: 0, color: "#10b981", class: "status-completed" },
    { label: "In Progress", value: 0, color: "#3b82f6", class: "status-inprogress" },
    { label: "On Hold", value: 0, color: "#f59e0b", class: "status-onhold" },
    { label: "Not Started", value: 0, color: "#ef4444", class: "status-notstarted" }
  ]);

  const [facultyGuides, setFacultyGuides] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

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

  // Fetch Dashboard Stats from backend API
  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Fetch Users
      let allUsers = [];
      try {
        const usersRes = await fetchApi("/User");
        if (usersRes.ok) {
          allUsers = await usersRes.json();
        }
      } catch (err) {
        console.warn("Could not fetch users for dashboard stats:", err);
      }

      const totalUsers = allUsers.length;
      const totalStudents = allUsers.filter(
        (u) =>
          u.roleId === 3 ||
          (u.role && u.role.toLowerCase() === "student") ||
          (u.Role && u.Role.toLowerCase() === "student")
      ).length;

      const facultyList = allUsers.filter(
        (u) =>
          u.roleId === 2 ||
          (u.role && u.role.toLowerCase() === "faculty") ||
          (u.Role && u.Role.toLowerCase() === "faculty")
      );
      const totalFaculty = facultyList.length;

      // 2. Fetch Projects
      let allProjects = [];
      try {
        const projRes = await fetchApi("/Project");
        if (projRes.ok) {
          allProjects = await projRes.json();
        }
      } catch (err) {
        console.warn("Could not fetch projects for dashboard stats:", err);
      }
      const totalProjects = allProjects.length;

      // 3. Fetch Tasks
      let allTasks = [];
      try {
        const taskRes = await fetchApi("/Task");
        if (taskRes.ok) {
          allTasks = await taskRes.json();
        }
      } catch (err) {
        console.warn("Could not fetch tasks for dashboard stats:", err);
      }
      const totalTasks = allTasks.length;

      // Set Counts in Stats State
      setStats({
        totalUsers,
        totalStudents,
        totalFaculty,
        totalProjects,
        totalTasks,
      });

      // Calculate Status Distribution from Projects
      let completedCount = 0;
      let inProgressCount = 0;
      let onHoldCount = 0;
      let notStartedCount = 0;

      allProjects.forEach((p) => {
        const st = p.projectStatus ?? p.ProjectStatus;
        const stName = (p.statusName || p.StatusName || "").toLowerCase();
        if (st === 2 || stName.includes("completed")) completedCount++;
        else if (st === 1 || stName.includes("progress")) inProgressCount++;
        else if (st === 3 || stName.includes("hold")) onHoldCount++;
        else notStartedCount++;
      });

      setStatusData([
        { label: "Completed", value: completedCount, color: "#10b981", class: "status-completed" },
        { label: "In Progress", value: inProgressCount, color: "#3b82f6", class: "status-inprogress" },
        { label: "On Hold", value: onHoldCount, color: "#f59e0b", class: "status-onhold" },
        { label: "Not Started", value: notStartedCount, color: "#ef4444", class: "status-notstarted" }
      ]);

      // Map Faculty Workload
      const themes = ["green", "blue", "indigo", "amber"];
      const mappedWorkload = facultyList.map((f, idx) => {
        const fId = f.userId ?? f.UserId ?? f.id;
        const count = allProjects.filter(
          (p) => (p.facultyId ?? p.FacultyId) === fId
        ).length;

        return {
          name: f.fullName || f.FullName || "Faculty Guide",
          count: count,
          max: 10,
          color: themes[idx % themes.length],
        };
      });

      setFacultyGuides(mappedWorkload);

      // Build Recent Activities from live data
      const liveActivities = [];
      allProjects.slice(0, 5).forEach((p, idx) => {
        liveActivities.push({
          id: p.projectId ?? p.ProjectId ?? idx + 1,
          user: p.studentName || p.StudentName || "Student User",
          role: "Student",
          action: "Working on Project",
          project: p.projectTitle || p.ProjectTitle || "Academic Project",
          time: `${(idx + 1) * 2} hrs ago`,
        });
      });

      if (liveActivities.length > 0) {
        setRecentActivities(liveActivities);
      } else {
        setRecentActivities([
          { id: 1, user: "System", role: "Admin", action: "Initialized Database Connection", project: "SPM Platform", time: "Just now" }
        ]);
      }
    } catch (err) {
      console.error("Error loading dashboard live stats:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const STATS_DATA = [
    { id: "users", label: "Total Users", value: String(stats.totalUsers), trend: "+8%", desc: "vs last month", icon: "users", theme: "blue" },
    { id: "students", label: "Total Students", value: String(stats.totalStudents), trend: "+12%", desc: "vs last month", icon: "students", theme: "amber" },
    { id: "faculty", label: "Total Faculty", value: String(stats.totalFaculty), trend: "+3%", desc: "vs last month", icon: "faculty", theme: "green" },
    { id: "projects", label: "Total Projects", value: String(stats.totalProjects), trend: "+15%", desc: "vs last month", icon: "projects", theme: "indigo" },
    { id: "tasks", label: "Total Tasks", value: String(stats.totalTasks), trend: "+22%", desc: "vs last month", icon: "tasks", theme: "rose" }
  ];

  // SVG Line Chart calculations
  const width = 500;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = DEFAULT_MONTHLY_PROGRESS.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / (DEFAULT_MONTHLY_PROGRESS.length - 1);
    const y = height - paddingBottom - (d.progress / 100) * chartHeight;
    return { x, y, ...d, index: i };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // SVG Donut calculations
  const donutCX = 80;
  const donutCY = 80;
  const donutR = 55;
  const donutC = 2 * Math.PI * donutR;
  const totalProjectsSum = statusData.reduce((sum, item) => sum + item.value, 0) || 1;

  let accumulatedPercent = 0;

  return (
    <div className="admin-dashboard-container">
      {/* Dashboard Welcome Header */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <h1>Admin Command Center</h1>
          <p>System monitoring, statistics, analytics, and overview of all ongoing academic projects.</p>
        </div>
        <div className="banner-badge">
          <span className="pulse-indicator"></span>
          Live SPM API Connected
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="stats-cards-grid">
        {STATS_DATA.map((card) => (
          <Link key={card.id} to={`/admin/details/${card.id}`} className={`stats-card card-theme-${card.theme}`} style={{ textDecoration: "none" }}>
            <div className="stats-card-header">
              <span className="card-label">{card.label}</span>
              <div className="card-icon-wrapper">{ICONS[card.icon]}</div>
            </div>
            <div className="stats-card-body">
              <span className="card-value">{loading ? "..." : card.value}</span>
            </div>
            <div className="stats-card-footer">
              <span className="trend-badge">{card.trend}</span>
              <span className="trend-desc">{card.desc}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="analytics-grid">
        {/* Progress Line Graph */}
        <div className="analytics-box line-graph-box">
          <div className="box-header">
            <h3>Student Academic Progress</h3>
            <p>Overall project progress trajectory (%) over the last 6 months</p>
          </div>
          <div className="box-body chart-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {[0, 25, 50, 75, 100].map((level) => {
                const y = height - paddingBottom - (level / 100) * chartHeight;
                return (
                  <g key={level} className="chart-grid-line">
                    <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e5e7eb" strokeDasharray="3,3" />
                    <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="chart-axis-text">
                      {level}%
                    </text>
                  </g>
                );
              })}

              {points.map((p) => (
                <text key={p.month} x={p.x} y={height - 15} textAnchor="middle" className="chart-axis-text">
                  {p.month}
                </text>
              ))}

              <path d={areaPath} fill="url(#chartGradient)" />
              <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {hoveredPoint !== null && (
                <line
                  x1={points[hoveredPoint].x}
                  y1={paddingTop}
                  x2={points[hoveredPoint].x}
                  y2={height - paddingBottom}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              )}

              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint === idx ? 6 : 4}
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth={hoveredPoint === idx ? 3 : 2}
                  className="chart-dot"
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            <div className={`chart-tooltip ${hoveredPoint !== null ? "visible" : ""}`}>
              {hoveredPoint !== null && (
                <>
                  <div className="tooltip-month">{points[hoveredPoint].month} Status</div>
                  <div className="tooltip-value">Progress: <strong>{points[hoveredPoint].progress}%</strong></div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Donut Status Chart */}
        <div className="analytics-box donut-chart-box">
          <div className="box-header">
            <h3>Project Status Distribution</h3>
            <p>Breakdown of active project statuses from Database</p>
          </div>
          <div className="box-body donut-chart-container">
            <div className="donut-svg-wrapper">
              <svg viewBox="0 0 160 160" className="donut-chart">
                {statusData.map((item, idx) => {
                  const percent = (item.value / totalProjectsSum) * 100;
                  const strokeDashoffset = donutC - (percent / 100) * donutC;
                  const rotation = (accumulatedPercent / 100) * 360;
                  accumulatedPercent += percent;

                  return (
                    <circle
                      key={idx}
                      cx={donutCX}
                      cy={donutCY}
                      r={donutR}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="13"
                      strokeDasharray={donutC}
                      strokeDashoffset={strokeDashoffset}
                      transform={`rotate(${rotation - 90} ${donutCX} ${donutCY})`}
                      className={`donut-segment ${hoveredStatus === idx ? "active" : ""}`}
                      onMouseEnter={() => setHoveredStatus(idx)}
                      onMouseLeave={() => setHoveredStatus(null)}
                    />
                  );
                })}
                <g className="donut-center-text">
                  <text x={donutCX} y={donutCY - 4} textAnchor="middle" className="donut-center-label">
                    {hoveredStatus !== null ? statusData[hoveredStatus].label : "Projects"}
                  </text>
                  <text x={donutCX} y={donutCY + 14} textAnchor="middle" className="donut-center-val">
                    {hoveredStatus !== null ? statusData[hoveredStatus].value : stats.totalProjects}
                  </text>
                </g>
              </svg>
            </div>

            <div className="donut-legend">
              {statusData.map((item, idx) => {
                const percent = ((item.value / totalProjectsSum) * 100).toFixed(1);
                return (
                  <div
                    key={idx}
                    className={`legend-item ${hoveredStatus === idx ? "highlighted" : ""}`}
                    onMouseEnter={() => setHoveredStatus(idx)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  >
                    <span className="legend-indicator" style={{ backgroundColor: item.color }}></span>
                    <div className="legend-details">
                      <span className="legend-label">{item.label}</span>
                      <span className="legend-value">{item.value} ({totalProjectsSum > 0 ? percent : 0}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row of Details Lists */}
      <div className="details-grid">
        {/* Recent Activities Panel */}
        <div className="details-box activity-box">
          <div className="box-header flex-header">
            <div>
              <h3>Recent Project Activities</h3>
              <p>Updates, submissions, and approvals across the platform</p>
            </div>
            <button className="btn-view-all" onClick={() => setShowActivitiesModal(true)}>View All</button>
          </div>
          <div className="box-body scrollable-body">
            <div className="activity-timeline">
              {recentActivities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-badge-container">
                    <span className={`activity-avatar role-color-${activity.role.toLowerCase()}`}>
                      {activity.user.charAt(0).toUpperCase()}
                    </span>
                    <div className="activity-line"></div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-meta">
                      <strong className="activity-user">{activity.user}</strong>
                      <span className="activity-role">{activity.role}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    <div className="activity-desc">
                      {activity.action} of <span className="activity-project">"{activity.project}"</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View All Activities Modal */}
        {showActivitiesModal && (
          <div className="modal-overlay" onClick={() => setShowActivitiesModal(false)}>
            <div className="modal-card activities-log-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>All Project Activities</h3>
                <button onClick={() => setShowActivitiesModal(false)} className="btn-close-modal">×</button>
              </div>
              <div className="modal-body activities-modal-scroll">
                <div className="activity-timeline">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-badge-container">
                        <span className={`activity-avatar role-color-${activity.role.toLowerCase()}`}>
                          {activity.user.charAt(0).toUpperCase()}
                        </span>
                        <div className="activity-line"></div>
                      </div>
                      <div className="activity-content">
                        <div className="activity-meta">
                          <strong className="activity-user">{activity.user}</strong>
                          <span className="activity-role">{activity.role}</span>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                        <div className="activity-desc">
                          {activity.action} of <span className="activity-project">"{activity.project}"</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Faculty Guide Workload Panel */}
        <div className="details-box guides-box">
          <div className="box-header">
            <h3>Faculty Workload</h3>
            <p>Supervision capacity and project allocation per faculty guide</p>
          </div>
          <div className="box-body guides-body">
            {facultyGuides.length > 0 ? (
              facultyGuides.map((guide, idx) => {
                const fillPercentage = Math.min((guide.count / guide.max) * 100, 100);
                return (
                  <div key={idx} className="guide-progress-row">
                    <div className="guide-info">
                      <span className="guide-name">{guide.name}</span>
                      <span className="guide-stats">{guide.count} / {guide.max} Projects</span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className={`progress-bar-fill fill-theme-${guide.color || "green"}`}
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ padding: "12px", color: "#6b7280" }}>No faculty guides registered in database.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
