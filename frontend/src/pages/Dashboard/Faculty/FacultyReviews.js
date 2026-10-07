import { useState } from "react";
import "./FacultyReviews.css";

const SUBMISSIONS_DATA = [
  { TaskId: 1, TaskTitle: "Implement Auth Guards", TaskDescription: "Design SQL table entities and relationships", StudentName: "Aarav Patel", StudentId: 101, ProjectTitle: "IoT Smart Home automation", milestone: "Milestone 2", fileName: "M2_Architecture_Draft.pdf", date: "2026-07-08", TaskStatus: 3 },
  { TaskId: 2, TaskTitle: "Integrate Payment Gateway API", TaskDescription: "Connect Stripe hooks callbacks", StudentName: "Neha Sharma", StudentId: 102, ProjectTitle: "E-Commerce Web Portal", milestone: "Milestone 1", fileName: "M1_Wireframes_UI_Mock.pdf", date: "2026-07-07", TaskStatus: 3 },
  { TaskId: 3, TaskTitle: "Verify Inverter Grid Synchronization Data", TaskDescription: "Audit grid sync frequency data", StudentName: "Meera Nair", StudentId: 108, ProjectTitle: "Cybersecurity Threat Analyzer", milestone: "Milestone 2", fileName: "M2_Network_Security_Models.docx", date: "2026-07-06", TaskStatus: 3 }
];

function FacultyReviews() {
  const [submissions, setSubmissions] = useState(SUBMISSIONS_DATA);
  const [selectedSub, setSelectedSub] = useState(SUBMISSIONS_DATA[0]);
  const [facultyRemarks, setFacultyRemarks] = useState("");
  const [taskStatus, setTaskStatus] = useState(3); // 3 = Completed default
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    const updatedSubmissions = submissions.map((sub) => {
      if (sub.TaskId === selectedSub.TaskId) {
        const nextProgress = taskStatus === 3 ? 100.00 : taskStatus === 2 ? 50.00 : 0.00;
        return { ...sub, TaskStatus: taskStatus, ProgressPercentage: nextProgress, FacultyRemarks: facultyRemarks };
      }
      return sub;
    });

    setSubmissions(updatedSubmissions);

    // Update shared tasks store in localStorage
    const stored = localStorage.getItem("spm_tasks_store");
    let currentStore = stored ? JSON.parse(stored) : [];
    const updatedStore = currentStore.map((t) => {
      if (t.TaskId === selectedSub.TaskId) {
        const nextProgress = taskStatus === 3 ? 100.00 : taskStatus === 2 ? 50.00 : 0.00;
        return { ...t, TaskStatus: taskStatus, ProgressPercentage: nextProgress, FacultyRemarks: facultyRemarks };
      }
      return t;
    });
    localStorage.setItem("spm_tasks_store", JSON.stringify(updatedStore));
    window.dispatchEvent(new Event("spm_tasks_updated"));

    setModalMessage(`Milestone review submitted successfully for student ${selectedSub.StudentName}. Status set to: ${
      taskStatus === 3 ? "Completed" :
      taskStatus === 2 ? "In Progress" :
      taskStatus === 1 ? "Pending" : "Rejected"
    }`);
    setShowSuccessModal(true);
    setFacultyRemarks("");
  };

  return (
    <div className="faculty-reviews-container">
      <div className="page-header">
        <h2>Submissions Reviews</h2>
        <p>Inspect student milestone documents, assign approval states, and write critical feedback according to SPM_Task schema.</p>
      </div>

      <div className="reviews-layout-grid">
        {/* Left column: submissions list */}
        <div className="submissions-list-card">
          <div className="card-header">
            <h3>Recent Submissions</h3>
          </div>
          <div className="submissions-list">
            {submissions.map((sub) => (
              <div
                key={sub.TaskId}
                className={`submission-item-row ${selectedSub && selectedSub.TaskId === sub.TaskId ? "active-row" : ""}`}
                onClick={() => setSelectedSub(sub)}
              >
                <div className="sub-header-line">
                  <strong>{sub.StudentName}</strong>
                  <span className="sub-date">{sub.date}</span>
                </div>
                <p className="sub-title">{sub.ProjectTitle}</p>
                <span className="sub-milestone-tag">{sub.TaskTitle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: evaluation form */}
        <div className="evaluation-form-card">
          <div className="card-header">
            <h3>Evaluate Submission</h3>
          </div>
          {selectedSub ? (
            <div className="evaluation-body">
              <div className="eval-info-block">
                <label>Project Context</label>
                <p><strong>{selectedSub.ProjectTitle}</strong></p>

                <label>Task Title</label>
                <p>{selectedSub.TaskTitle} (ID: {selectedSub.TaskId})</p>

                <label>Attached Document File</label>
                <p className="attached-file-link">
                  📎 <a href="#" onClick={(e) => { e.preventDefault(); alert(`Downloading ${selectedSub.fileName}`); }}>{selectedSub.fileName}</a>
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="eval-form">
                <div className="form-group">
                  <label>Set Task Assessment Status</label>
                  <select 
                    value={taskStatus} 
                    onChange={(e) => setTaskStatus(parseInt(e.target.value))}
                    className="assessment-dropdown"
                  >
                    <option value="3">Completed</option>
                    <option value="2">In Progress</option>
                    <option value="1">Pending</option>
                    <option value="4">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Faculty Remarks</label>
                  <textarea
                    rows="4"
                    placeholder="Input detailed FacultyRemarks here..."
                    value={facultyRemarks}
                    onChange={(e) => setFacultyRemarks(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-submit-review">
                  Submit Milestone Assessment
                </button>
              </form>
            </div>
          ) : (
            <div className="no-selection-placeholder">
              <p>Select a submission from the left panel to review</p>
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card success-modal-card">
            <div className="modal-header">
              <h3>Review Sent Successfully</h3>
              <button onClick={() => setShowSuccessModal(false)} className="btn-close-modal">×</button>
            </div>
            <div className="modal-body">
              <div className="success-icon-badge">✓</div>
              <p>{modalMessage}</p>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowSuccessModal(false)} className="btn-modal-submit">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyReviews;
