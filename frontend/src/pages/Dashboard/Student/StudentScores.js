import "./StudentScores.css";

const SCORES_DATA = {
  milestone1: { earned: 26, max: 30, remarks: "Excellent relational schema design and database normalisation." },
  milestone2: { earned: 24, max: 30, remarks: "Good implementation of API routes. Need better error handling." },
  presentation: { earned: 38, max: 40, remarks: "Outstanding slides and live demo demonstration." }
};

function StudentScores() {
  const currentTotal = SCORES_DATA.milestone1.earned + SCORES_DATA.milestone2.earned + SCORES_DATA.presentation.earned;
  const maxTotal = SCORES_DATA.milestone1.max + SCORES_DATA.milestone2.max + SCORES_DATA.presentation.max;

  return (
    <div className="student-scores-container">
      <div className="page-header">
        <h2>My Scores & Remarks</h2>
        <p>Overview of grading points earned for project milestones evaluations.</p>
      </div>

      <div className="scores-overview-grid">
        {/* Milestone 1 card */}
        <div className="score-summary-card">
          <span className="milestone-lbl">Milestone 1</span>
          <div className="marks-display-row">
            <strong className="marks-obtained">{SCORES_DATA.milestone1.earned}</strong>
            <span className="marks-separator">/</span>
            <span className="marks-max">{SCORES_DATA.milestone1.max}</span>
          </div>
          <span className="marks-status success-status">✓ Graded</span>
        </div>

        {/* Milestone 2 card */}
        <div className="score-summary-card">
          <span className="milestone-lbl">Milestone 2</span>
          <div className="marks-display-row">
            <strong className="marks-obtained">{SCORES_DATA.milestone2.earned}</strong>
            <span className="marks-separator">/</span>
            <span className="marks-max">{SCORES_DATA.milestone2.max}</span>
          </div>
          <span className="marks-status success-status">✓ Graded</span>
        </div>

        {/* Presentation card */}
        <div className="score-summary-card">
          <span className="milestone-lbl">Final Presentation</span>
          <div className="marks-display-row">
            <strong className="marks-obtained">{SCORES_DATA.presentation.earned}</strong>
            <span className="marks-separator">/</span>
            <span className="marks-max">{SCORES_DATA.presentation.max}</span>
          </div>
          <span className="marks-status success-status">✓ Graded</span>
        </div>
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
              <strong>{currentTotal}</strong>
              <span>/ {maxTotal} Marks</span>
            </div>
          </div>
          <div className="performance-remarks-block">
            <span className="total-label">Academic Evaluation Remarks</span>
            <p>Your team is making steady progress toward final demonstration parameters. Review recommendations on power backups before demo day.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentScores;
