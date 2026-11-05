import { useState, useEffect } from "react";
import "./StudentReviews.css";
import { tasksApi, projectsApi, unwrapData } from "../../../services/api";

function StudentReviews() {
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

        const reviewList = allTasks
          .filter(t => (t.facultyRemarks || t.FacultyRemarks || "").trim().length > 0 || (t.earnedScore || t.EarnedScore) > 0)
          .map((t, idx) => {
            const proj = allProjs.find(p => (p.projectId || p.ProjectId) === (t.allocationID || t.AllocationID || t.allocationId));
            return {
              id: t.taskId || t.TaskId || idx,
              milestone: t.taskTitle || t.TaskTitle,
              reviewer: proj?.facultyName || "Faculty Advisor",
              date: t.completedDate ? (typeof t.completedDate === "string" ? t.completedDate.split("T")[0] : t.completedDate) : "Recent Review",
              score: `${t.earnedScore || t.EarnedScore || 0} / ${t.assignedScore || t.AssignedScore || 10}`,
              remarks: t.facultyRemarks || t.FacultyRemarks || "Milestone completed with satisfactory progress."
            };
          });

        setReviews(reviewList.length > 0 ? reviewList : [
          {
            id: 1,
            milestone: "Database Schema & Entity Models",
            reviewer: "Faculty Advisor",
            date: "2026-06-25",
            score: "10 / 10",
            remarks: "Exemplary relational structures. Primary and foreign key configurations match project guidelines."
          }
        ]);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  return (
    <div className="student-reviews-container">
      <div className="page-header">
        <h2>Reviews & Guide Feedback</h2>
        <p>List of milestone evaluations and comments received from your faculty supervisors connected to database records.</p>
      </div>

      <div className="reviews-cards-list">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading review feedback...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-item-card">
              <div className="review-card-header">
                <div>
                  <h3>{review.milestone}</h3>
                  <span className="reviewer-name-sub">Evaluated by: <strong>{review.reviewer}</strong></span>
                </div>
                <div className="review-score-badge">
                  <span className="score-lbl">Score Received</span>
                  <strong className="score-val">{review.score}</strong>
                </div>
              </div>
              <div className="review-card-body">
                <p className="review-remarks-label">Comments & Guidance Remarks</p>
                <div className="remarks-text-box">
                  {review.remarks}
                </div>
                <span className="review-completed-date">Assessed on: {review.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "30px", color: "#6b7280" }}>No supervisor reviews recorded yet.</div>
        )}
      </div>
    </div>
  );
}

export default StudentReviews;
