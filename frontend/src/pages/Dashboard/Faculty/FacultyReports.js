import { useState } from "react";
import "./FacultyReports.css";

const REPORTS_DATA = [
  { id: 1, name: "Supervision Progress Report", type: "PDF Document", date: "2026-07-01", size: "1.2 MB" },
  { id: 2, name: "Grades Distribution Sheet", type: "Excel Sheet", date: "2026-06-25", size: "482 KB" },
  { id: 3, name: "Milestone 1 Completion Audit", type: "PDF Document", date: "2026-06-15", size: "890 KB" }
];

function FacultyReports() {
  const [reports, setReports] = useState(REPORTS_DATA);

  const handleGenerateReport = () => {
    const newReport = {
      id: reports.length + 1,
      name: `Supervision_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
      type: "PDF Document",
      date: new Date().toISOString().slice(0, 10),
      size: "650 KB"
    };
    setReports([newReport, ...reports]);
    alert("New progress report compiled and generated successfully!");
  };

  return (
    <div className="faculty-reports-container">
      <div className="page-header">
        <h2>Supervision Reports</h2>
        <p>Compile supervision completion metrics, student performance audit reports, and grade lists.</p>
      </div>

      <div className="reports-actions-row">
        <button className="btn-generate-report" onClick={handleGenerateReport}>
          Generate New Progress Report (.PDF)
        </button>
      </div>

      <div className="reports-table-card">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Document Format</th>
              <th>Generated Date</th>
              <th>File Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="report-name"><strong>{report.name}</strong></td>
                <td>{report.type}</td>
                <td>{report.date}</td>
                <td>{report.size}</td>
                <td>
                  <button className="btn-report-download" onClick={() => alert(`Downloading ${report.name}`)}>
                    Download File
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

export default FacultyReports;
