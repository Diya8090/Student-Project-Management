import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./StudentReviewsDetail.css";
import { tasksApi, projectsApi, unwrapData } from "../../../../services/api";

function StudentReviewsDetail() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const [tasksRes, projsRes] = await Promise.all([
          tasksApi.getAll(),
          projectsApi.getAll()
        ]);

        const allTasks = unwrapData(tasksRes) || [];
        const allProjs = unwrapData(projsRes) || [];

        const list = allTasks
          .filter(t => (t.facultyRemarks || t.FacultyRemarks || "").trim().length > 0 || (t.earnedScore || t.EarnedScore) > 0)
          .map((t, idx) => {
            const proj = allProjs.find(p => (p.projectId || p.ProjectId) === (t.allocationID || t.AllocationID || t.allocationId));
            return {
              id: t.taskId || t.TaskId || idx,
              milestone: t.taskTitle || t.TaskTitle,
              reviewer: proj?.facultyName || "Faculty Advisor",
              date: t.completedDate ? (typeof t.completedDate === "string" ? t.completedDate.split("T")[0] : t.completedDate) : "Recent",
              score: `${t.earnedScore || t.EarnedScore || 0} / ${t.assignedScore || t.AssignedScore || 10}`,
              remarks: t.facultyRemarks || t.FacultyRemarks || "Evaluation completed."
            };
          });

        setReviews(list);
      } catch (e) {
        console.warn("Could not load reviews detail:", e);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  return (
    <div className="student-reviews-detail-container">
      <div className="details-header">
        <Link to="/student/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Evaluation Feedback Directory</h2>
        <p>Detail reviews and scores received from your supervisors connected to live SPM database.</p>
      </div>

      <div className="details-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading review records...</div>
        ) : (
          <table className="details-table">
            <thead>
              <tr>
                <th>Milestone Stage</th>
                <th>Reviewer</th>
                <th>Date Evaluated</th>
                <th>Score / Status</th>
                <th>Feedback Remarks</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td><strong>{review.milestone}</strong></td>
                    <td>{review.reviewer}</td>
                    <td>{review.date}</td>
                    <td>
                      <span className="score-badge-detail">{review.score}</span>
                    </td>
                    <td className="remarks-td-cell">{review.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No feedback evaluations recorded yet.
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

export default StudentReviewsDetail;
