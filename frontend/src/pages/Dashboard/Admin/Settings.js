import { useState, useEffect } from "react";
import "./Settings.css";

function Settings() {
  const [sysConfig, setSysConfig] = useState({
    registrationLimit: 4,
    allowProposalRegistration: true
  });

  const [evaluationWeights, setEvaluationWeights] = useState({
    m1: 30,
    m2: 30,
    presentation: 40
  });

  const [deadlines, setDeadlines] = useState({
    registrationDeadline: "2026-08-30",
    m1Deadline: "2026-10-15",
    finalDeadline: "2026-12-10"
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: false,
    weeklyDigest: true
  });

  const [backupStatus, setBackupStatus] = useState("idle"); // idle, backing_up, completed
  const [progress, setProgress] = useState(0);

  const handleToggleNotification = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  const handleSysChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSysConfig({
      ...sysConfig,
      [e.target.name]: val
    });
  };

  const handleWeightChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setEvaluationWeights({
      ...evaluationWeights,
      [e.target.name]: val
    });
  };

  const handleDeadlineChange = (e) => {
    setDeadlines({
      ...deadlines,
      [e.target.name]: e.target.value
    });
  };

  const totalWeight = evaluationWeights.m1 + evaluationWeights.m2 + evaluationWeights.presentation;
  const isWeightValid = totalWeight === 100;

  const handleBackup = () => {
    setBackupStatus("backing_up");
    setProgress(0);
    
    // Simulate backup progress bar
    let cur = 0;
    const interval = setInterval(() => {
      cur += 10;
      setProgress(cur);
      if (cur >= 100) {
        clearInterval(interval);
        setBackupStatus("completed");
        
        // Trigger a mock file download!
        const sqlText = `-- Student Project Management System Backup\n-- Date: ${new Date().toLocaleString()}\n\nCREATE DATABASE IF NOT EXISTS spm_db;\n\nINSERT INTO spm_db.settings VALUES ('registration_limit', '${sysConfig.registrationLimit}');\nINSERT INTO spm_db.settings VALUES ('m1_weight', '${evaluationWeights.m1}');\nINSERT INTO spm_db.settings VALUES ('m2_weight', '${evaluationWeights.m2}');\nINSERT INTO spm_db.settings VALUES ('presentation_weight', '${evaluationWeights.presentation}');\n\n-- Backup completed successfully!`;
        const blob = new Blob([sqlText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SPM_Database_Backup.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }, 200);
  };

  return (
    <div className="system-settings-container">
      <div className="settings-page-header">
        <div>
          <h2>System Control Panel Settings</h2>
          <p>Manage portal configurations, evaluation parameters, dark theme settings, and backups.</p>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Academic Config */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Academic Registration Settings</h3>
            <p>Define guidelines for student project registration.</p>
          </div>
          <div className="settings-card-body">
            <div className="form-group">
              <label>Project Registration limit per Student</label>
              <input
                type="number"
                name="registrationLimit"
                min="1"
                max="10"
                value={sysConfig.registrationLimit}
                onChange={handleSysChange}
              />
            </div>

            <div className="form-group checkbox-field">
              <label className="switch-toggle-wrapper">
                <input
                  type="checkbox"
                  name="allowProposalRegistration"
                  checked={sysConfig.allowProposalRegistration}
                  onChange={handleSysChange}
                />
                <span className="slider-round-switch"></span>
              </label>
              <div className="checkbox-info-desc">
                <strong>Allow Proposal Registrations</strong>
                <span>Enable or disable students from proposing new project details.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Weights Config */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Milestone Evaluation Weights</h3>
            <p>Adjust the percentage weights of project milestones. Total must equal 100%.</p>
          </div>
          <div className="settings-card-body">
            <div className="weights-inputs-grid">
              <div className="form-group">
                <label>Milestone 1 Weight (%)</label>
                <input
                  type="number"
                  name="m1"
                  min="0"
                  max="100"
                  value={evaluationWeights.m1}
                  onChange={handleWeightChange}
                />
              </div>

              <div className="form-group">
                <label>Milestone 2 Weight (%)</label>
                <input
                  type="number"
                  name="m2"
                  min="0"
                  max="100"
                  value={evaluationWeights.m2}
                  onChange={handleWeightChange}
                />
              </div>

              <div className="form-group">
                <label>Presentation Weight (%)</label>
                <input
                  type="number"
                  name="presentation"
                  min="0"
                  max="100"
                  value={evaluationWeights.presentation}
                  onChange={handleWeightChange}
                />
              </div>
            </div>

            <div className={`weight-validation-panel ${isWeightValid ? "weight-valid" : "weight-invalid"}`}>
              <span>Total Calculated: <strong>{totalWeight}%</strong></span>
              {!isWeightValid && (
                <span className="error-note">⚠️ Cumulative weights must equal 100%</span>
              )}
              {isWeightValid && (
                <span className="success-note">✓ Milestone configurations valid</span>
              )}
            </div>
          </div>
        </div>

        {/* Term Milestones Deadlines */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Academic Calendars & Targets</h3>
            <p>Define dates for student registration cut-offs and final presentations.</p>
          </div>
          <div className="settings-card-body">
            <div className="dates-inputs-grid">
              <div className="form-group">
                <label>Registration Deadline Date</label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={deadlines.registrationDeadline}
                  onChange={handleDeadlineChange}
                />
              </div>

              <div className="form-group">
                <label>Milestone 1 Submission Target</label>
                <input
                  type="date"
                  name="m1Deadline"
                  value={deadlines.m1Deadline}
                  onChange={handleDeadlineChange}
                />
              </div>

              <div className="form-group">
                <label>Final Assessment Presentation Date</label>
                <input
                  type="date"
                  name="finalDeadline"
                  value={deadlines.finalDeadline}
                  onChange={handleDeadlineChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Config */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Notification Preferences</h3>
            <p>Customize email notifications and system triggers.</p>
          </div>
          <div className="settings-card-body">
            <div className="form-group checkbox-field">
              <label className="switch-toggle-wrapper">
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={() => handleToggleNotification("emailAlerts")}
                />
                <span className="slider-round-switch"></span>
              </label>
              <div className="checkbox-info-desc">
                <strong>Email Alert Notifications</strong>
                <span>Receive instantly when files are uploaded or reviewed.</span>
              </div>
            </div>

            <div className="form-group checkbox-field">
              <label className="switch-toggle-wrapper">
                <input
                  type="checkbox"
                  checked={notifications.pushAlerts}
                  onChange={() => handleToggleNotification("pushAlerts")}
                />
                <span className="slider-round-switch"></span>
              </label>
              <div className="checkbox-info-desc">
                <strong>Web Browser Push Alerts</strong>
                <span>Receive desktop notification flags during active sessions.</span>
              </div>
            </div>

            <div className="form-group checkbox-field">
              <label className="switch-toggle-wrapper">
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={() => handleToggleNotification("weeklyDigest")}
                />
                <span className="slider-round-switch"></span>
              </label>
              <div className="checkbox-info-desc">
                <strong>Weekly Digest Reports</strong>
                <span>Send weekly supervision graphs to guides.</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Maintenance Controls */}
        <div className="settings-card system-maintenance-card">
          <div className="settings-card-header">
            <h3>Database Backup & Recovery</h3>
            <p>Export database records into a single backup file.</p>
          </div>
          <div className="settings-card-body maintenance-body">
            {backupStatus === "idle" && (
              <button onClick={handleBackup} className="btn-trigger-backup">
                Generate Database Backup (.SQL)
              </button>
            )}

            {backupStatus === "backing_up" && (
              <div className="backup-progress-container">
                <div className="backup-status-text">Creating backup schema... {progress}%</div>
                <div className="backup-progress-bar-track">
                  <div className="backup-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {backupStatus === "completed" && (
              <div className="backup-success-container">
                <span className="success-icon-badge">✓</span>
                <div className="success-desc">
                  <strong>Backup Export Completed!</strong>
                  <span>Your download has started automatically.</span>
                </div>
                <button onClick={() => setBackupStatus("idle")} className="btn-backup-reset">
                  Create Another Backup
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
