import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FacultyScoresDetail.css";
import { tasksApi, unwrapData } from "../../../../services/api";

function FacultyScoresDetail() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        setLoading(true);
        const res = await tasksApi.getAll();
        const rawTasks = unwrapData(res) || [];

        const normalized = rawTasks.map((t) => ({
          TaskId: t.taskId || t.TaskId,
          StudentName: t.projectTitle ? `${t.projectTitle} Candidate` : "Student Scholar",
          ProjectTitle: t.projectTitle || t.ProjectTitle || "Project Assignment",
          milestone: t.taskTitle || t.TaskTitle || "Milestone Deliverable",
          EarnedScore: Number(t.earnedScore || t.EarnedScore || 0),
          AssignedScore: Number(t.assignedScore || t.AssignedScore || 10)
        }));

        setScores(normalized);
      } catch (e) {
        console.warn("Could not load faculty scores detail:", e);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, []);

  return (
    <div className="faculty-scores-detail-container">
      <div className="details-header">
        <Link to="/faculty/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Evaluation Grades Roster</h2>
        <p>Breakdown summary of points recorded for milestones deliverables according to live SPM database.</p>
      </div>

      <div className="details-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading grading roster...</div>
        ) : (
          <table className="details-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Project Topic</th>
                <th>Milestone Stage</th>
                <th>Marks Obtained (EarnedScore)</th>
                <th>Max Score (AssignedScore)</th>
              </tr>
            </thead>
            <tbody>
              {scores.length > 0 ? (
                scores.map((s) => (
                  <tr key={s.TaskId}>
                    <td><strong>{s.StudentName}</strong></td>
                    <td>{s.ProjectTitle}</td>
                    <td>{s.milestone}</td>
                    <td><strong className="cumulative-total-value">{s.EarnedScore}</strong></td>
                    <td>{s.AssignedScore}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No evaluations recorded.
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

export default FacultyScoresDetail;
