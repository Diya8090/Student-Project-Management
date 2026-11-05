import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentDashboard.css";
import { projectsApi, tasksApi, unwrapData } from "../../../services/api";

const DEFAULT_PRIORITY_DATA = [
  { label: "High Priority", value: 1, color: "#dc2626" },
  { label: "Medium Priority", value: 2, color: "#f59e0b" },
  { label: "Low Priority", value: 1, color: "#2563eb" }
];

const DEFAULT_ACTIVITIES = [
  { id: 1, type: "task", user: "You", action: "worked on Database Entities Schema", time: "30 mins ago" },
  { id: 2, type: "review", user: "Faculty Guide", action: "left feedback on project proposal", time: "3 hrs ago" },
  { id: 3, type: "task", user: "You", action: "updated task remarks", time: "1 day ago" }
];

function StudentDashboard() {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const [stats, setStats] = useState({
    myProjects: 1,
    myTasks: 2,
    completedTasks: 1,
    pendingTasks: 1,
    reviewsCount: 1,
    completionRate: 50
  });

  const [priorityData, setPriorityData] = useState(DEFAULT_PRIORITY_DATA);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    let userObj = null;
    if (savedUser) {
      try {
        userObj = JSON.parse(savedUser);
        setCurrentUser(userObj);
      } catch (e) {}
    }

    const loadData = async () => {
      try {
        const [projsRes, tasksRes] = await Promise.all([
          projectsApi.getAll(),
          tasksApi.getAll()
        ]);

        const allProjs = unwrapData(projsRes) || [];
        const allTasks = unwrapData(tasksRes) || [];

        const studentId = userObj?.userId;
        const myProjects = studentId && allProjs.some(p => (p.studentId || p.StudentId) === studentId)
          ? allProjs.filter(p => (p.studentId || p.StudentId) === studentId)
          : allProjs;

        const myProjectIds = new Set(myProjects.map(p => p.projectId || p.ProjectId));
        const myTasks = allTasks.filter(t => myProjectIds.has(t.allocationID || t.AllocationID || t.allocationId));
        const relevantTasks = myTasks.length > 0 ? myTasks : allTasks;

        const completed = relevantTasks.filter(t => (t.taskStatus || t.TaskStatus) === 3 || (t.progressPercentage || t.ProgressPercentage) >= 100).length;
        const pending = relevantTasks.length - completed;
        const reviews = relevantTasks.filter(t => (t.facultyRemarks || t.FacultyRemarks || "").trim().length > 0).length;
        const rate = relevantTasks.length > 0 ? Math.round((completed / relevantTasks.length) * 100) : 0;

        setStats({
          myProjects: myProjects.length || 1,
          myTasks: relevantTasks.length || 1,
          completedTasks: completed,
          pendingTasks: pending,
          reviewsCount: reviews,
          completionRate: rate
        });

        // Priority breakdown
        const high = relevantTasks.filter(t => (t.priorityID || t.PriorityID) === 1).length;
        const med = relevantTasks.filter(t => (t.priorityID || t.PriorityID) === 2).length;
        const low = relevantTasks.filter(t => (t.priorityID || t.PriorityID) === 3).length;

        setPriorityData([
          { label: "High Priority", value: Math.max(high, 1), color: "#dc2626" },
          { label: "Medium Priority", value: Math.max(med, 1), color: "#f59e0b" },
          { label: "Low Priority", value: Math.max(low, 0), color: "#2563eb" }
        ]);

        if (relevantTasks.length > 0) {
          const act = relevantTasks.slice(0, 6).map((t, idx) => ({
            id: t.taskId || t.TaskId || idx,
            type: (t.facultyRemarks || t.FacultyRemarks) ? "review" : "task",
            user: (t.facultyRemarks || t.FacultyRemarks) ? "Faculty Guide" : "You",
            action: (t.facultyRemarks || t.FacultyRemarks)
              ? `reviewed '${t.taskTitle || t.TaskTitle}': "${t.facultyRemarks || t.FacultyRemarks}"`
              : `updated task '${t.taskTitle || t.TaskTitle}' (${t.progressPercentage || t.ProgressPercentage || 0}%)`,
            time: `${idx + 1} day ago`
          }));
          setActivities(act);
        }
      } catch (err) {
        console.warn("Could not load dynamic student metrics:", err);
      }
    };

    loadData();
  }, []);

  // SVG chart parameters
  const width = 500;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const progressHistory = [
    { month: "Jan", progress: 10 },
    { month: "Feb", progress: 25 },
    { month: "Mar", progress: 40 },
    { month: "Apr", progress: 55 },
    { month: "May", progress: 75 },
    { month: "Jun", progress: Math.max(stats.completionRate, 80) }
  ];

  const points = progressHistory.map((item, idx) => {
    const x = paddingLeft + (idx / (progressHistory.length - 1)) * chartWidth;
    const y = height - paddingBottom - (item.progress / 100) * chartHeight;
    return { x, y, ...item };
  });

  const linePath = points.reduce((path, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Donut chart parameters
  const totalTasks = priorityData.reduce((acc, item) => acc + item.value, 0) || 1;
  const donutCX = 80;
  const donutCY = 80;
  const donutR = 50;
  const donutC = 2 * Math.PI * donutR;
  let accumulatedPercent = 0;

  return (
    <div className="student-dashboard-container">
      <div className="dashboard-page-header">
        <div>
          <h2>Student Workspace</h2>
          <p>Welcome back, <strong>{currentUser?.fullName || "Scholar"}</strong>! Monitor your project milestone records, track task logs, and view feedback.</p>
        </div>
      </div>

      {/* Grid of stats cards */}
      <div className="stats-cards-grid">
        <Link to="/student/details/projects" className="stats-card card-theme-amber">
          <div className="stats-card-header">
            <span className="card-label">My Projects</span>
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
          </div>
          <span className="card-value">{stats.myProjects}</span>
          <div className="stats-card-footer">
            <span className="trend-badge">Active</span>
            <span className="trend-desc">supervision</span>
          </div>
        </Link>

        <Link to="/student/details/tasks" className="stats-card card-theme-blue">
          <div className="stats-card-header">
            <span className="card-label">My Tasks</span>
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
          </div>
          <span className="card-value">{stats.myTasks}</span>
          <div className="stats-card-footer">
            <span className="trend-badge alert-badge">{stats.pendingTasks} Pending</span>
            <span className="trend-desc">tasks</span>
          </div>
        </Link>

        <Link to="/student/details/completed-tasks" className="stats-card card-theme-green">
          <div className="stats-card-header">
            <span className="card-label">Completed Tasks</span>
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <span className="card-value">{stats.completedTasks}</span>
          <div className="stats-card-footer">
            <span className="trend-badge">{stats.completionRate}% Done</span>
            <span className="trend-desc">progress</span>
          </div>
        </Link>

        <Link to="/student/details/reviews" className="stats-card card-theme-indigo">
          <div className="stats-card-header">
            <span className="card-label">Evaluation Reviews</span>
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <span className="card-value">{stats.reviewsCount}</span>
          <div className="stats-card-footer">
            <span className="trend-badge">{stats.reviewsCount} Feedback</span>
            <span className="trend-desc">reports</span>
          </div>
        </Link>
      </div>

      {/* Analytics charts grid */}
      <div className="analytics-grid">
        {/* Progress chart */}
        <div className="analytics-box line-graph-box">
          <div className="box-header">
            <h3>My Milestone Progression Track</h3>
            <p>Overall completion progress trajectory (%) over the last 6 months</p>
          </div>
          <div className="box-body chart-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
              <defs>
                <linearGradient id="studentChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
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

              {/* Month Labels */}
              {points.map((p) => (
                <text key={p.month} x={p.x} y={height - 15} textAnchor="middle" className="chart-axis-text">
                  {p.month}
                </text>
              ))}

              {/* Area Under Path */}
              <path d={areaPath} fill="url(#studentChartGradient)" />

              {/* Main Line Path */}
              <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Hover highlight guide line */}
              {hoveredPoint !== null && (
                <line
                  x1={points[hoveredPoint].x}
                  y1={paddingTop}
                  x2={points[hoveredPoint].x}
                  y2={height - paddingBottom}
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              )}

              {/* Points Markers */}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint === idx ? 6 : 4}
                  fill={hoveredPoint === idx ? "#f59e0b" : "#ffffff"}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: "pointer", transition: "r 0.15s ease" }}
                />
              ))}
            </svg>

            {/* Live Interactive Tooltip */}
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

        {/* Donut Chart */}
        <div className="analytics-box donut-chart-box">
          <div className="box-header">
            <h3>Pending Tasks Priority</h3>
            <p>Distribution of active assigned task targets</p>
          </div>
          <div className="box-body donut-chart-container">
            <div className="donut-svg-wrapper">
              <svg viewBox="0 0 160 160" className="donut-chart">
                {priorityData.map((item, idx) => {
                  const percent = (item.value / totalTasks) * 100;
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
                {/* Center Label Text */}
                <g className="donut-center-text">
                  <text x={donutCX} y={donutCY - 4} textAnchor="middle" className="donut-center-label">
                    {hoveredStatus !== null ? priorityData[hoveredStatus].label : "Tasks"}
                  </text>
                  <text x={donutCX} y={donutCY + 14} textAnchor="middle" className="donut-center-val">
                    {hoveredStatus !== null ? priorityData[hoveredStatus].value : totalTasks}
                  </text>
                </g>
              </svg>
            </div>

            {/* Custom Interactive Legend List */}
            <div className="donut-legend-list">
              {priorityData.map((item, idx) => (
                <div
                  key={idx}
                  className={`donut-legend-item ${hoveredStatus === idx ? "legend-hover" : ""}`}
                  onMouseEnter={() => setHoveredStatus(idx)}
                  onMouseLeave={() => setHoveredStatus(null)}
                >
                  <span className="legend-indicator-dot" style={{ background: item.color }}></span>
                  <span className="legend-name-label">{item.label}</span>
                  <span className="legend-qty-val">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback activities panel */}
      <div className="details-box recent-activities-panel-card">
        <div className="panel-header-row">
          <div>
            <h3>Recent Tasks & Review Activities</h3>
            <p>Chronological feed of task status updates and feedback events.</p>
          </div>
          <button onClick={() => setShowAllActivities(true)} className="btn-view-all-modal">
            View All Log Events
          </button>
        </div>

        <div className="activities-list-feed">
          {activities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="activity-item-feed-row">
              <span className={`activity-icon-badge icon-${activity.type}`}></span>
              <div className="activity-main-desc">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-action">{activity.action}</span>
                <span className="activity-log-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW ALL ACTIVITIES DIALOG POPUP MODAL */}
      {showAllActivities && (
        <div className="modal-overlay" onClick={() => setShowAllActivities(false)}>
          <div className="modal-card modal-card-activities-log" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>System Tasks Activities Log</h3>
                <p>Complete project timeline records and task logs</p>
              </div>
              <button onClick={() => setShowAllActivities(false)} className="btn-close-modal">×</button>
            </div>
            <div className="modal-body scrollable-activities-modal-body">
              <div className="activities-list-feed">
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-item-feed-row">
                    <span className={`activity-icon-badge icon-${activity.type}`}></span>
                    <div className="activity-main-desc">
                      <span className="activity-user">{activity.user}</span>
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-log-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
