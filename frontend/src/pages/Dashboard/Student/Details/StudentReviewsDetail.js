import { Link } from "react-router-dom";
import "./StudentReviewsDetail.css";

const REVIEWS_DETAIL_LIST = [
  { id: 1, milestone: "Milestone 1: Project Proposal", reviewer: "Prof. Sunita Rao", date: "2026-02-20", score: "26 / 30", remarks: "Solid core MQTT protocol definitions. The UI mockups look clean but ensure they map MQTT topic updates correctly. Good implementation strategy." },
  { id: 2, milestone: "System Architecture Proposal", reviewer: "Dr. Ramesh Kumar", date: "2026-03-05", score: "Passed", remarks: "Satisfactory details. Verify the power backups schema for local microcontrollers in case of gateway hardware connection drops." }
];

function StudentReviewsDetail() {
  return (
    <div className="student-reviews-detail-container">
      <div className="details-header">
        <Link to="/student/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Evaluation Feedback Directory</h2>
        <p>Detail reviews and scores received from your supervisors.</p>
      </div>

      <div className="details-table-card">
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
            {REVIEWS_DETAIL_LIST.map((review) => (
              <tr key={review.id}>
                <td><strong>{review.milestone}</strong></td>
                <td>{review.reviewer}</td>
                <td>{review.date}</td>
                <td>
                  <span className="score-badge-detail">{review.score}</span>
                </td>
                <td className="remarks-td-cell">{review.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentReviewsDetail;
