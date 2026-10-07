import "./StudentReviews.css";

const REVIEWS_DATA = [
  { id: 1, milestone: "Milestone 1: Project Proposal", reviewer: "Prof. Sunita Rao", date: "2026-02-20", score: "26 / 30", remarks: "Solid core MQTT protocol definitions. The UI mockups look clean but ensure they map MQTT topic updates correctly. Good implementation strategy." },
  { id: 2, milestone: "System Architecture Proposal", reviewer: "Dr. Ramesh Kumar", date: "2026-03-05", score: "Passed", remarks: "Satisfactory details. Verify the power backups schema for local microcontrollers in case of gateway hardware connection drops." }
];

function StudentReviews() {
  return (
    <div className="student-reviews-container">
      <div className="page-header">
        <h2>Reviews & Guide Feedback</h2>
        <p>List of milestone evaluations and comments received from your faculty supervisors.</p>
      </div>

      <div className="reviews-cards-list">
        {REVIEWS_DATA.map((review) => (
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
        ))}
      </div>
    </div>
  );
}

export default StudentReviews;
