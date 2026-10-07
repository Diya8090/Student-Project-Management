import { useState } from "react";
import { Link } from "react-router-dom";
import "./FacultyDashboard.css";

const MOCK_ACTIVITIES = [
  { id: 1, type: "submission", user: "Aarav Patel", action: "uploaded Milestone 2 documentation", time: "10 mins ago" },
  { id: 2, type: "review", user: "You", action: "approved IoT Smart Home draft Proposal", time: "2 hrs ago" },
  { id: 3, type: "submission", user: "Rohan Gupta", action: "submitted Final Presentation slide", time: "5 hrs ago" },
  { id: 4, type: "task", user: "Neha Sharma", action: "marked Task 'Database Schema' complete", time: "1 day ago" },
  { id: 5, type: "system", user: "Portal Admin", action: "updated evaluation rubric weights", time: "2 days ago" },
  { id: 6, type: "review", user: "You", action: "sent feedback on Milestone 1 code repository", time: "3 days ago" }
];

const STATUS_DATA = [
  { label: "In Progress", value: 8, color: "#16a34a" },  // Green accent
  { label: "Completed", value: 5, color: "#2563eb" },
  { label: "Under Review", value: 3, color: "#f59e0b" },
  { label: "Delayed", value: 2, color: "#dc2626" }
];

function FacultyDashboard() {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);

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
    { month: "Jan", progress: 20 },
    { month: "Feb", progress: 35 },
    { month: "Mar", progress: 50 },
    { month: "Apr", progress: 68 },
    { month: "May", progress: 80 },
    { month: "Jun", progress: 92 }
  ];

  const points = progressHistory.map((item, idx) => {
    const x = paddingLeft + (idx / (progressHistory.length - 1)) * chartWidth;
    const y = height - paddingBottom - (item.progress / 100) * chartHeight;
    return { x, y, ...item };
  });

  const linePath = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Donut chart parameters
  const totalProjects = STATUS_DATA.reduce((acc, item) => acc + item.value, 0);
  const donutCX = 80;
  const donutCY = 80;
  const donutR = 50;
  const donutC = 2 * Math.PI * donutR;
  let accumulatedPercent = 0;

  return (
    <div className="faculty-dashboard-container">
      {/* Header Banner */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <h2>Faculty Advisory & Supervision Portal</h2>
          <p>Supervise student project milestones, review submitted document deliverables, and record grading remarks.</p>
        </div>
        <div className="banner-badge">
          <span>Role: <strong>Faculty Mentor</strong></span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-cards-grid">
        <Link to="/faculty/details/projects" className="stats-card card-theme-green">
          <div className="stats-card-header">
            <span className="card-label">Assigned Projects</span>
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
          <span className="card-value">18</span>
          <div className="stats-card-footer">
            <span className="trend-badge">Active</span>
            <span className="trend-desc">supervisions</span>
          </div>
        </Link>

        <Link to="/faculty/details/reviews" className="stats-card card-theme-blue">
          <div className="stats-card-header">
            <span className="card-label">Pending Reviews</span>
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
          </div>
          <span className="card-value">7</span>
          <div className="stats-card-footer">
            <span className="trend-badge danger-badge">7 New</span>
            <span className="trend-desc">submissions</span>
          </div>
        </Link>

        <Link to="/faculty/details/students" className="stats-card card-theme-amber">
          <div className="stats-card-header">
            <span className="card-label">Supervised Students</span>
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <span className="card-value">42</span>
          <div className="stats-card-footer">
            <span className="trend-badge">8 Groups</span>
            <span className="trend-desc">enrolled</span>
          </div>
        </Link>

        <Link to="/faculty/details/scores" className="stats-card card-theme-indigo">
          <div className="stats-card-header">
            <span className="card-label">Milestones Graded</span>
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <span className="card-value">25</span>
          <div className="stats-card-footer">
            <span className="trend-badge">Complete</span>
            <span className="trend-desc">evaluations</span>
          </div>
        </Link>
      </div>

      {/* Analytics charts grid */}
      <div className="analytics-grid">
        {/* Progress chart */}
        <div className="analytics-box line-graph-box">
          <div className="box-header">
            <h3>Average Milestones Completion Track</h3>
            <p>Average supervision group progress (%) over the last 6 months</p>
          </div>
          <div className="box-body chart-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
              <defs>
                <linearGradient id="facultyChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.00" />
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
              <path d={areaPath} fill="url(#facultyChartGradient)" />

              {/* Main Line Path */}
              <path d={linePath} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Hover highlight guide line */}
              {hoveredPoint !== null && (
                <line
                  x1={points[hoveredPoint].x}
                  y1={paddingTop}
                  x2={points[hoveredPoint].x}
                  y2={height - paddingBottom}
                  stroke="#16a34a"
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
                  fill={hoveredPoint === idx ? "#16a34a" : "#ffffff"}
                  stroke="#16a34a"
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
            <h3>Projects Progress Status</h3>
            <p>Distribution of active supervised projects</p>
          </div>
          <div className="box-body donut-chart-container">
            <div className="donut-svg-wrapper">
              <svg viewBox="0 0 160 160" className="donut-chart">
                {STATUS_DATA.map((item, idx) => {
                  const percent = (item.value / totalProjects) * 100;
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
                    {hoveredStatus !== null ? STATUS_DATA[hoveredStatus].label : "Projects"}
                  </text>
                  <text x={donutCX} y={donutCY + 14} textAnchor="middle" className="donut-center-val">
                    {hoveredStatus !== null ? STATUS_DATA[hoveredStatus].value : totalProjects}
                  </text>
                </g>
              </svg>
            </div>

            {/* Custom Interactive Legend List */}
            <div className="donut-legend-list">
              {STATUS_DATA.map((item, idx) => (
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

      {/* Recent Activity Log Row */}
      <div className="details-box recent-activities-panel-card">
        <div className="panel-header-row">
          <div>
            <h3>Recent Project Activities</h3>
            <p>Chronological feed of group submissions and supervisor feedback logs.</p>
          </div>
          <button onClick={() => setShowAllActivities(true)} className="btn-view-all-modal">
            View All Log Events
          </button>
        </div>

        <div className="activities-list-feed">
          {MOCK_ACTIVITIES.slice(0, 4).map((activity) => (
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
                <h3>System Project Activities Log</h3>
                <p>Complete timeline events for your supervised students</p>
              </div>
              <button onClick={() => setShowAllActivities(false)} className="btn-close-modal">×</button>
            </div>
            <div className="modal-body scrollable-activities-modal-body">
              <div className="activities-list-feed">
                {MOCK_ACTIVITIES.map((activity) => (
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

export default FacultyDashboard;
