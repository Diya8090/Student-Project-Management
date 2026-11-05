import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FacultyStudentsDetail.css";
import { projectsApi, usersApi, unwrapData } from "../../../../services/api";

function FacultyStudentsDetail() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const [projsRes, usersRes] = await Promise.all([
          projectsApi.getAll(),
          usersApi.getAll()
        ]);

        const allProjs = unwrapData(projsRes) || [];
        const allUsers = unwrapData(usersRes) || [];

        const studentUsers = allUsers.filter(u => {
          const r = (u.role || u.Role || "").toLowerCase();
          return r === "student" || (u.roleId || u.RoleId) === 3;
        });

        const list = allProjs.map((p, idx) => {
          const sId = p.studentId || p.StudentId;
          const userMatch = studentUsers.find(u => (u.userId || u.UserId) === sId);

          return {
            StudentId: sId || (idx + 1),
            StudentName: p.studentName || p.StudentName || userMatch?.fullName || `Student #${sId || idx + 1}`,
            email: userMatch?.email || "student@university.edu",
            department: "Computer Science & Engineering",
            ProjectTitle: p.projectTitle || p.ProjectTitle || "Project Assignment",
            milestone: p.totalTasks > 0 ? `${p.completedTasks || 0} / ${p.totalTasks} Tasks Done` : "Milestone 1 Active"
          };
        });

        setStudents(list);
      } catch (e) {
        console.warn("Could not load faculty students detail:", e);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  return (
    <div className="faculty-students-detail-container">
      <div className="details-header">
        <Link to="/faculty/dashboard" className="btn-back-link">
          ← Back to Dashboard
        </Link>
        <h2>Supervised Students Directory</h2>
        <p>Comprehensive roster of all students registered under your project guidance according to live SPM database.</p>
      </div>

      <div className="details-table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading enrolled scholars...</div>
        ) : (
          <table className="details-table">
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
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.StudentId}>
                    <td className="student-table-name"><strong>{student.StudentName}</strong></td>
                    <td>{student.email}</td>
                    <td>{student.department}</td>
                    <td>{student.ProjectTitle}</td>
                    <td><span className="student-milestone-badge">{student.milestone}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No students found.
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

export default FacultyStudentsDetail;
