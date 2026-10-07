import "./StudentReports.css";

const MY_REPORTS = [
  { id: 1, name: "Milestone 1 Graded Marks Report", format: "PDF Document", date: "2026-03-01", size: "320 KB" },
  { id: 2, name: "System Workload Evaluation summary", format: "PDF Document", date: "2026-05-15", size: "450 KB" }
];

function StudentReports() {
  return (
    <div className="student-reports-container">
      <div className="page-header">
        <h2>My Progress Reports</h2>
        <p>Download generated academic progress certificates, milestones reports, and evaluations files.</p>
      </div>

      <div className="reports-table-card">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Description Name</th>
              <th>Document Format</th>
              <th>Compiled Date</th>
              <th>File Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MY_REPORTS.map((report) => (
              <tr key={report.id}>
                <td className="report-name"><strong>{report.name}</strong></td>
                <td>{report.format}</td>
                <td>{report.date}</td>
                <td>{report.size}</td>
                <td>
                  <button className="btn-report-download" onClick={() => alert(`Downloading ${report.name}`)}>
                    Download PDF File
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentReports;
