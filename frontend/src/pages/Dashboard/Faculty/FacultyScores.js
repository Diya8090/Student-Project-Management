import { useState } from "react";
import "./FacultyScores.css";

const SCORES_DATA = [
  { TaskId: 1, StudentName: "Aarav Patel", StudentId: 101, ProjectTitle: "IoT Smart Home automation", AssignedScore: 30.00, EarnedScore: 26.00, milestone: "Milestone 1" },
  { TaskId: 2, StudentName: "Rohan Gupta", StudentId: 102, ProjectTitle: "IoT Smart Home automation", AssignedScore: 30.00, EarnedScore: 25.00, milestone: "Milestone 1" },
  { TaskId: 3, StudentName: "Neha Sharma", StudentId: 103, ProjectTitle: "E-Commerce Web Portal", AssignedScore: 30.00, EarnedScore: 22.00, milestone: "Milestone 1" },
  { TaskId: 4, StudentName: "Kunal Sen", StudentId: 104, ProjectTitle: "Machine Learning Crop Predictor", AssignedScore: 40.00, EarnedScore: 37.00, milestone: "Presentation" },
  { TaskId: 5, StudentName: "Ishita Roy", StudentId: 105, ProjectTitle: "Machine Learning Crop Predictor", AssignedScore: 40.00, EarnedScore: 38.00, milestone: "Presentation" }
];

function FacultyScores() {
  const [scores, setScores] = useState(SCORES_DATA);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ EarnedScore: 0 });

  const handleEditClick = (s) => {
    setEditingId(s.TaskId);
    setEditForm({ EarnedScore: s.EarnedScore });
  };

  const handleSaveClick = (id) => {
    const updated = scores.map((s) => {
      if (s.TaskId === id) {
        return { ...s, EarnedScore: parseFloat(editForm.EarnedScore) || 0 };
      }
      return s;
    });
    setScores(updated);
    setEditingId(null);
  };

  return (
    <div className="faculty-scores-container">
      <div className="page-header">
        <h2>Scores & Evaluation Remarks</h2>
        <p>Edit assessment marks according to SPM_Task schema fields (AssignedScore / EarnedScore).</p>
      </div>

      <div className="scores-table-card">
        <table className="scores-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Project Topic</th>
              <th>Milestone Stage</th>
              <th>Marks Earned (EarnedScore)</th>
              <th>Max Score (AssignedScore)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => {
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacultyScores;
