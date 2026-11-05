import { useState, useEffect } from "react";
import "./StudentScores.css";
import { tasksApi, projectsApi, unwrapData } from "../../../services/api";

function StudentScores() {
  const [taskScores, setTaskScores] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalMax, setTotalMax] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        setLoading(true);
        const [tasksRes, projsRes] = await Promise.all([
          tasksApi.getAll(),
          projectsApi.getAll()
        ]);

        const allTasks = unwrapData(tasksRes) || [];
        const allProjs = unwrapData(projsRes) || [];

        const savedUser = localStorage.getItem("currentUser");
        let studentId = null;
        if (savedUser) {
          try {
            studentId = JSON.parse(savedUser).userId;
          } catch (e) {}
        }

        const myProjs = studentId && allProjs.some(p => (p.studentId || p.StudentId) === studentId)
          ? allProjs.filter(p => (p.studentId || p.StudentId) === studentId)
          : allProjs;

        const myProjIds = new Set(myProjs.map(p => p.projectId || p.ProjectId));
        const relevant = allTasks.filter(t => myProjIds.has(t.allocationID || t.AllocationID || t.allocationId));
        const finalTasks = relevant.length > 0 ? relevant : allTasks;

        const items = finalTasks.map((t, idx) => ({
          id: t.taskId || t.TaskId || idx,
          title: t.taskTitle || t.TaskTitle || `Milestone ${idx + 1}`,
          earned: Number(t.earnedScore || t.EarnedScore || 0),
          max: Number(t.assignedScore || t.AssignedScore || 10),
          remarks: t.facultyRemarks || t.FacultyRemarks || "Task completed."
        }));

        const earnedSum = items.reduce((acc, curr) => acc + curr.earned, 0);
        const maxSum = items.reduce((acc, curr) => acc + curr.max, 0);

        setTaskScores(items);
        setTotalEarned(earnedSum);
        setTotalMax(maxSum || 100);
      } catch (err) {
        console.error("Failed to load scores:", err);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, []);

  return (
    <div className="student-scores-container">
      <div className="page-header">
        <h2>My Scores & Remarks</h2>
        <p>Overview of grading points earned for project milestones evaluations connected to live database.</p>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading score metrics...</div>
      ) : (
        <>
          <div className="scores-overview-grid">
            {taskScores.map((s) => (
              <div key={s.id} className="score-summary-card">
                <span className="milestone-lbl">{s.title}</span>
                <div className="marks-display-row">
                  <strong className="marks-obtained">{s.earned}</strong>
                  <span className="marks-separator">/</span>
                  <span className="marks-max">{s.max}</span>
                </div>
                <span className="marks-status success-status">
                  {s.earned > 0 ? "✓ Graded" : "In Evaluation"}
                </span>
              </div>
            ))}
          </div>

          {/* Cumulative total grade box */}
          <div className="cumulative-total-card">
            <div className="total-header">
              <h3>Cumulative Performance Summary</h3>
            </div>
            <div className="total-body">
              <div className="total-marks-block">
                <span className="total-label">Total Score Obtained</span>
                <div className="total-display">
                  <strong>{totalEarned}</strong>
                  <span>/ {totalMax} Marks</span>
                </div>
              </div>
              <div className="performance-remarks-block">
                <span className="total-label">Academic Evaluation Remarks</span>
                <p>
                  {totalEarned >= totalMax * 0.8
                    ? "Outstanding performance! Your implementation and documentation meet high engineering standards."
                    : "Consistent progress toward final project deliverables. Ensure all faculty feedback remarks are addressed."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentScores;
