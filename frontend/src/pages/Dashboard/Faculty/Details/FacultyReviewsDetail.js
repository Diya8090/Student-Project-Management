import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FacultyReviewsDetail.css";
import { tasksApi, unwrapData } from "../../../../services/api";

const STATUS_MAP = {
  1: "Pending",
  2: "In Progress",
  3: "Completed",
  4: "Rejected"
};

function FacultyReviewsDetail() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const res = await tasksApi.getAll();
        const rawTasks = unwrapData(res) || [];

        const normalized = rawTasks.map((t) => ({
          TaskId: t.taskId || t.TaskId,
          TaskTitle: t.taskTitle || t.TaskTitle,
          StudentName: t.projectTitle ? `${t.projectTitle} Team` : "Student Scholar",
          ProjectTitle: t.projectTitle || t.ProjectTitle || "Project Assignment",
          fileName: `Deliverable_Task_${t.taskId || t.TaskId}.pdf`,
          TaskStatus: t.taskStatus || t.TaskStatus || 1
        }));

        setSubmissions(normalized);
      } catch (e) {
        console.warn("Could not load faculty reviews detail:", e);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  return (
    <div className="faculty-reviews-detail-container">
      <div className="details-header">
        <Link to="/faculty/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Pending Submissions Directory</h2>
        <p>List of milestone documents submitted by your students awaiting evaluation according to live SPM database.</p>
      </div>

      <div className="details-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading submissions...</div>
        ) : (
          <table className="details-table">
            <thead>
              <tr>
                <th>Student Team</th>
                <th>Project Topic</th>
                <th>Task Title</th>
                <th>File Deliverable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr key={sub.TaskId}>
                    <td><strong>{sub.StudentName}</strong></td>
                    <td>{sub.ProjectTitle}</td>
                    <td>{sub.TaskTitle}</td>
                    <td><span className="file-name-pill">{sub.fileName}</span></td>
                    <td>
                      <span className={`status-badge-pill review-status-${(STATUS_MAP[sub.TaskStatus] || "pending").toLowerCase().replace(" ", "-")}`}>
                        {STATUS_MAP[sub.TaskStatus] || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No submissions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default FacultyReviewsDetail;
