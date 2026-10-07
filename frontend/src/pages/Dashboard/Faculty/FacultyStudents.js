import "./FacultyStudents.css";

const STUDENTS_DATA = [
  { StudentId: 101, StudentName: "Aarav Patel", email: "aarav.patel@university.edu", department: "Computer Science", ProjectTitle: "IoT Smart Home automation", ProjectId: 1, milestone: "Milestone 2" },
  { StudentId: 102, StudentName: "Rohan Gupta", email: "rohan.gupta@university.edu", department: "Computer Science", ProjectTitle: "IoT Smart Home automation", ProjectId: 1, milestone: "Milestone 2" },
  { StudentId: 103, StudentName: "Neha Sharma", email: "neha.sharma@university.edu", department: "Information Technology", ProjectTitle: "E-Commerce Web Portal", ProjectId: 2, milestone: "Milestone 1" },
  { StudentId: 104, StudentName: "Kunal Sen", email: "kunal.sen@university.edu", department: "Computer Science", ProjectTitle: "Machine Learning Crop Predictor", ProjectId: 3, milestone: "Final Presentation" },
  { StudentId: 105, StudentName: "Ishita Roy", email: "ishita.roy@university.edu", department: "Computer Science", ProjectTitle: "Machine Learning Crop Predictor", ProjectId: 3, milestone: "Final Presentation" },
  { StudentId: 106, StudentName: "Meera Nair", email: "meera.nair@university.edu", department: "Information Technology", ProjectTitle: "Cybersecurity Threat Analyzer", ProjectId: 4, milestone: "Milestone 2" }
];

function FacultyStudents() {
  return (
    <div className="faculty-students-container">
      <div className="page-header">
        <h2>My Students</h2>
        <p>List of students registered under your supervision groups according to SPM schema.</p>
      </div>

      <div className="faculty-students-card">
        <table className="faculty-students-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email Address</th>
              <th>Department</th>
              <th>Project Topic</th>
              <th>Active Milestone</th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS_DATA.map((student) => (
              <tr key={student.StudentId}>
                <td className="student-table-name"><strong>{student.StudentName}</strong></td>
                <td>{student.email}</td>
                <td>{student.department}</td>
                <td>{student.ProjectTitle}</td>
                <td><span className="student-milestone-badge">{student.milestone}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacultyStudents;
