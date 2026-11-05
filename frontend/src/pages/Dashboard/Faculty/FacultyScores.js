import { useState, useEffect } from "react";
import "./FacultyScores.css";
import { tasksApi, unwrapData } from "../../../services/api";

function FacultyScores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ EarnedScore: 0 });

  const loadScores = async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getAll();
      const rawTasks = unwrapData(res) || [];

      const normalized = rawTasks.map((t) => ({
        TaskId: t.taskId || t.TaskId,
        StudentName: t.projectTitle ? `${t.projectTitle} Candidate` : "Student Scholar",
        ProjectTitle: t.projectTitle || t.ProjectTitle || "Project Assignment",
        AssignedScore: Number(t.assignedScore || t.AssignedScore || 10),
        EarnedScore: Number(t.earnedScore || t.EarnedScore || 0),
        milestone: t.taskTitle || t.TaskTitle || "Milestone Task",
        AllocationID: t.allocationID || t.AllocationID || t.allocationId || 1,
        TaskTitle: t.taskTitle || t.TaskTitle,
        TaskDescription: t.taskDescription || t.TaskDescription || "",
        TaskStatus: t.taskStatus || t.TaskStatus || 1,
        PriorityID: t.priorityID || t.PriorityID || 2,
        ProgressPercentage: Number(t.progressPercentage || t.ProgressPercentage || 0),
        StartDate: t.startDate || t.StartDate,
        DueDate: t.dueDate || t.DueDate,
        FacultyRemarks: t.facultyRemarks || t.FacultyRemarks || "",
        StudentRemarks: t.studentRemarks || t.StudentRemarks || ""
      }));

      setScores(normalized);
    } catch (err) {
      console.error("Failed to load scores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  const handleEditClick = (s) => {
    setEditingId(s.TaskId);
    setEditForm({ EarnedScore: s.EarnedScore });
  };

  const handleSaveClick = async (id) => {
    const item = scores.find((s) => s.TaskId === id);
    if (!item) return;

    const newScore = parseFloat(editForm.EarnedScore) || 0;

    const payload = {
      allocationID: item.AllocationID,
      taskTitle: item.TaskTitle,
      taskDescription: item.TaskDescription,
      taskStatus: newScore > 0 ? 3 : item.TaskStatus,
      priorityID: item.PriorityID,
      assignedScore: item.AssignedScore,
      earnedScore: newScore,
      progressPercentage: newScore >= item.AssignedScore ? 100 : item.ProgressPercentage,
      startDate: item.StartDate || new Date().toISOString(),
      dueDate: item.DueDate || new Date().toISOString(),
      completedDate: newScore > 0 ? new Date().toISOString() : null,
      facultyRemarks: item.FacultyRemarks,
      studentRemarks: item.StudentRemarks,
      isDeleted: false
    };

    try {
      await tasksApi.update(id, payload);
      setEditingId(null);
      await loadScores();
    } catch (err) {
      console.error("Failed to update task score:", err);
      alert("Error saving score: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="faculty-scores-container">
      <div className="page-header">
        <h2>Scores & Evaluation Remarks</h2>
        <p>Edit assessment marks according to SPM_Task schema fields (AssignedScore / EarnedScore) connected to backend.</p>
      </div>

      <div className="scores-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading evaluation records...</div>
        ) : (
          <table className="scores-table">
            <thead>
              <tr>
                <th>Student Team</th>
                <th>Project Topic</th>
                <th>Milestone Stage</th>
                <th>Marks Earned (EarnedScore)</th>
                <th>Max Score (AssignedScore)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scores.length > 0 ? (
                scores.map((s) => {
                  const isEditing = editingId === s.TaskId;

                  return (
                    <tr key={s.TaskId}>
                      <td className="scores-table-student"><strong>{s.StudentName}</strong></td>
                      <td>{s.ProjectTitle}</td>
                      <td>{s.milestone}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={s.AssignedScore}
                            className="scores-input"
                            value={editForm.EarnedScore}
                            onChange={(e) => setEditForm({ EarnedScore: e.target.value })}
                          />
                        ) : (
                          s.EarnedScore
                        )}
                      </td>
                      <td>
                        {s.AssignedScore}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="edit-actions-row">
                            <button className="btn-score-save" onClick={() => handleSaveClick(s.TaskId)}>Save</button>
                            <button className="btn-score-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button className="btn-score-edit" onClick={() => handleEditClick(s)}>Edit Marks</button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No scoring tasks recorded yet.
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

export default FacultyScores;
