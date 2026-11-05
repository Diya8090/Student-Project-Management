import { useState, useEffect } from "react";
import "./FacultyReviews.css";
import { tasksApi, unwrapData } from "../../../services/api";

function FacultyReviews() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [facultyRemarks, setFacultyRemarks] = useState("");
  const [taskStatus, setTaskStatus] = useState(3); // 3 = Completed default
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getAll();
      const rawTasks = unwrapData(res) || [];

      const normalized = rawTasks.map((t) => ({
        TaskId: t.taskId || t.TaskId,
        TaskTitle: t.taskTitle || t.TaskTitle,
        TaskDescription: t.taskDescription || t.TaskDescription,
        StudentName: t.projectTitle ? `${t.projectTitle} Team` : "Student Scholar",
        ProjectTitle: t.projectTitle || t.ProjectTitle || "Project Assignment",
        milestone: `Task #${t.taskId || t.TaskId}`,
        fileName: `Deliverable_Task_${t.taskId || t.TaskId}.pdf`,
        date: (t.dueDate || t.DueDate || new Date().toISOString()).split("T")[0],
        TaskStatus: t.taskStatus || t.TaskStatus || 1,
        PriorityID: t.priorityID || t.PriorityID || 2,
        AllocationID: t.allocationID || t.AllocationID || t.allocationId || 1,
        AssignedScore: Number(t.assignedScore || t.AssignedScore || 10),
        EarnedScore: Number(t.earnedScore || t.EarnedScore || 0),
        ProgressPercentage: Number(t.progressPercentage || t.ProgressPercentage || 0),
        FacultyRemarks: t.facultyRemarks || t.FacultyRemarks || "",
        StudentRemarks: t.studentRemarks || t.StudentRemarks || "",
        StartDate: t.startDate || t.StartDate,
        DueDate: t.dueDate || t.DueDate,
        CompletedDate: t.completedDate || t.CompletedDate
      }));

      setSubmissions(normalized);
      if (normalized.length > 0) {
        setSelectedSub(normalized[0]);
        setFacultyRemarks(normalized[0].FacultyRemarks || "");
        setTaskStatus(normalized[0].TaskStatus || 3);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleSelectSub = (sub) => {
    setSelectedSub(sub);
    setFacultyRemarks(sub.FacultyRemarks || "");
    setTaskStatus(sub.TaskStatus || 3);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    const nextProgress = taskStatus === 3 ? 100.0 : taskStatus === 2 ? 50.0 : 0.0;
    const nextEarned = taskStatus === 3 && selectedSub.EarnedScore === 0 ? selectedSub.AssignedScore : selectedSub.EarnedScore;

    const payload = {
      allocationID: selectedSub.AllocationID,
      taskTitle: selectedSub.TaskTitle,
      taskDescription: selectedSub.TaskDescription || "",
      taskStatus: parseInt(taskStatus, 10),
      priorityID: selectedSub.PriorityID,
      assignedScore: selectedSub.AssignedScore,
      earnedScore: nextEarned,
      progressPercentage: nextProgress,
      startDate: selectedSub.StartDate || new Date().toISOString(),
      dueDate: selectedSub.DueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      completedDate: taskStatus === 3 ? new Date().toISOString() : null,
      facultyRemarks: facultyRemarks.trim(),
      studentRemarks: selectedSub.StudentRemarks || "",
      isDeleted: false
    };

    try {
      await tasksApi.update(selectedSub.TaskId, payload);

      setModalMessage(`Milestone review submitted successfully for "${selectedSub.TaskTitle}". Assessment status set to: ${
        taskStatus === 3 ? "Completed (100%)" :
        taskStatus === 2 ? "In Progress" :
        taskStatus === 1 ? "Pending" : "Rejected"
      }`);
      setShowSuccessModal(true);

      await loadSubmissions();
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Error submitting review: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="faculty-reviews-container">
      <div className="page-header">
        <h2>Submissions Reviews</h2>
        <p>Inspect student milestone documents, assign approval states, and write critical feedback connected to the live database.</p>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading task deliverables...</div>
      ) : (
        <div className="reviews-layout-grid">
          {/* Left column: submissions list */}
          <div className="submissions-list-card">
            <div className="card-header">
              <h3>Recent Submissions</h3>
            </div>
            <div className="submissions-list">
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <div
                    key={sub.TaskId}
                    className={`submission-item-row ${selectedSub && selectedSub.TaskId === sub.TaskId ? "active-row" : ""}`}
                    onClick={() => handleSelectSub(sub)}
                  >
                    <div className="sub-header-line">
                      <strong>{sub.StudentName}</strong>
                      <span className="sub-date">{sub.date}</span>
                    </div>
                    <p className="sub-title">{sub.ProjectTitle}</p>
                    <span className="sub-milestone-tag">{sub.TaskTitle}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: "20px", color: "#6b7280" }}>No submissions available for review.</div>
              )}
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
                    📎 <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulating download of ${selectedSub.fileName}`); }}>{selectedSub.fileName}</a>
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} className="eval-form">
                  <div className="form-group">
                    <label>Set Task Assessment Status</label>
                    <select 
                      value={taskStatus} 
                      onChange={(e) => setTaskStatus(parseInt(e.target.value, 10))}
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
      )}

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
