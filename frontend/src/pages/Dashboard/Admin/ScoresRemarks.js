import { useState } from "react";
import "./ScoresRemarks.js"; // wait, should be ScoresRemarks.css
import "./ScoresRemarks.css";

const INITIAL_EVALUATIONS = [
  { id: 1, studentName: "Aarav Patel", projectName: "Student Project Management System", m1: 25, m2: 24, finalExam: 36, remarks: "Consistent progress and thorough system design." },
  { id: 2, studentName: "Neha Sharma", email: "neha.sharma@student.university.edu", projectName: "E-Commerce Web Application", m1: 28, m2: 27, finalExam: 38, remarks: "Outstanding UI presentation and payment API implementation." },
  { id: 3, studentName: "Amit Singh", projectName: "IoT Smart Agriculture System", m1: 22, m2: 21, finalExam: 32, remarks: "Functional sensor integration, report structure needs adjustments." },
  { id: 4, studentName: "Pooja Reddy", projectName: "AI-Powered Medical Diagnosis Tool", m1: 18, m2: 20, finalExam: 28, remarks: "Good dataset collection, model fine-tuning was delayed." },
  { id: 5, studentName: "Vikram Malhotra", projectName: "Smart Solar Grid Monitor", m1: 26, m2: 25, finalExam: 35, remarks: "Solid engineering documentation and hardware test setups." }
];

function ScoresRemarks() {
  const [evaluations, setEvaluations] = useState(INITIAL_EVALUATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");

  // Modal form overlay state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    studentName: "",
    projectName: "Student Project Management System",
    m1: 0,
    m2: 0,
    finalExam: 0,
    remarks: ""
  });

  const handleInputChange = (e) => {
    const val = e.target.name === "studentName" || e.target.name === "projectName" || e.target.name === "remarks"
      ? e.target.value
      : parseInt(e.target.value) || 0;

    setFormData({
      ...formData,
      [e.target.name]: val
    });
  };

  const calculateTotal = (m1, m2, finalExam) => m1 + m2 + finalExam;

  const getGrade = (total) => {
    if (total >= 90) return "A";
    if (total >= 75) return "B";
    if (total >= 60) return "C";
    return "F";
  };

  const handleOpenAdd = () => {
    setFormData({ studentName: "", projectName: "Student Project Management System", m1: 0, m2: 0, finalExam: 0, remarks: "" });
    setModalMode("add");
    setShowModal(true);
  };

  const handleOpenEdit = (ev) => {
    setFormData({
      studentName: ev.studentName,
      projectName: ev.projectName,
      m1: ev.m1,
      m2: ev.m2,
      finalExam: ev.finalExam,
      remarks: ev.remarks
    });
    setSelectedId(ev.id);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this score evaluation?")) {
      setEvaluations(evaluations.filter(ev => ev.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newEv = {
        id: evaluations.length > 0 ? Math.max(...evaluations.map(ev => ev.id)) + 1 : 1,
        ...formData
      };
      setEvaluations([...evaluations, newEv]);
    } else {
      setEvaluations(evaluations.map(ev => ev.id === selectedId ? { ...ev, ...formData } : ev));
    }
    setShowModal(false);
  };

  // Filter evaluations list
  const filteredEvaluations = evaluations.filter(ev => {
    const total = calculateTotal(ev.m1, ev.m2, ev.finalExam);
    const grade = getGrade(total);

    const matchesSearch = ev.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.remarks.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = gradeFilter === "All" || grade === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  return (
    <div className="scores-remarks-container">
      <div className="scores-page-header">
        <div>
          <h2>Evaluation & Scores Sheet</h2>
          <p>Input student milestone marks, calculate grades, and record supervisor feedback.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-add-evaluation">
          + Input Evaluation Scores
        </button>
      </div>

      <div className="directory-filters">
        <div className="search-box-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student name, project title, or remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-grade-wrapper">
          <label>Grade:</label>
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option value="All">All Grades</option>
            <option value="A">Grade A (90+)</option>
            <option value="B">Grade B (75-89)</option>
            <option value="C">Grade C (60-74)</option>
            <option value="F">Grade F (Fail)</option>
          </select>
        </div>
      </div>

      {/* Evaluation Table */}
      <div className="scores-table-card">
        <table className="scores-table">
          <thead>
            <tr>
              <th>Student Name / Project</th>
              <th>M1 (30)</th>
              <th>M2 (30)</th>
              <th>Presentation (40)</th>
              <th>Total (100)</th>
              <th>Grade</th>
              <th>Remarks Feedback</th>
              <th className="align-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvaluations.length > 0 ? (
              filteredEvaluations.map((ev) => {
                const total = calculateTotal(ev.m1, ev.m2, ev.finalExam);
                const grade = getGrade(total);
                return (
                  <tr key={ev.id}>
                    <td>
                      <div className="scores-profile-cell">
                        <strong className="scores-table-student">{ev.studentName}</strong>
                        <span className="scores-table-project" title={ev.projectName}>{ev.projectName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="score-number-val">{ev.m1}</span>
                    </td>
                    <td>
                      <span className="score-number-val">{ev.m2}</span>
                    </td>
                    <td>
                      <span className="score-number-val">{ev.finalExam}</span>
                    </td>
                    <td>
                      <span className="score-total-val">{total}</span>
                    </td>
                    <td>
                      <span className={`grade-badge-tag g-tag-${grade.toLowerCase()}`}>
                        Grade {grade}
                      </span>
                    </td>
                    <td>
                      <span className="scores-table-remarks" title={ev.remarks}>{ev.remarks}</span>
                    </td>
                    <td>
                      <div className="scores-action-btns">
                        <button onClick={() => handleOpenEdit(ev)} className="btn-table-action btn-table-edit" title="Edit">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(ev.id)} className="btn-table-action btn-table-delete" title="Delete">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-records-cell">
                  No evaluations match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup Form overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === "add" ? "Input Project Score Marks" : "Modify Evaluation Scores"}</h3>
              <button onClick={() => setShowModal(false)} className="btn-close-modal">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Enter student name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Project Title</label>
                <select name="projectName" value={formData.projectName} onChange={handleInputChange}>
                  <option value="Student Project Management System">Student Project Management System</option>
                  <option value="E-Commerce Web Application">E-Commerce Web Application</option>
                  <option value="IoT Smart Agriculture System">IoT Smart Agriculture System</option>
                  <option value="AI-Powered Medical Diagnosis Tool">AI-Powered Medical Diagnosis Tool</option>
                  <option value="Smart Solar Grid Monitor">Smart Solar Grid Monitor</option>
                </select>
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Milestone 1 Marks (Max 30)</label>
                  <input
                    type="number"
                    name="m1"
                    min="0"
                    max="30"
                    value={formData.m1}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Milestone 2 Marks (Max 30)</label>
                  <input
                    type="number"
                    name="m2"
                    min="0"
                    max="30"
                    value={formData.m2}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Final Presentation (Max 40)</label>
                  <input
                    type="number"
                    name="finalExam"
                    min="0"
                    max="40"
                    value={formData.finalExam}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Calculated Total Score</label>
                  <input
                    type="text"
                    value={`${calculateTotal(formData.m1, formData.m2, formData.finalExam)} / 100`}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Remarks & Supervisor Feedback</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Write evaluation feedback remarks..."
                  rows="3"
                  className="remarks-textarea"
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-modal-submit">
                  {modalMode === "add" ? "Save Grades" : "Save Changes"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-modal-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoresRemarks;
