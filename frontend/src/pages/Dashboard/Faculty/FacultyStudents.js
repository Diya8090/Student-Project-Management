import { useState, useEffect } from "react";
import "./FacultyStudents.css";
import { projectsApi, usersApi, unwrapData } from "../../../services/api";

function FacultyStudents() {
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
            milestone: p.totalTasks > 0 ? `${p.completedTasks || 0} / ${p.totalTasks} Tasks Completed` : "Milestone 1 Active"
          };
        });

        setStudents(list);
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  return (
    <div className="faculty-students-container">
      <div className="page-header">
        <h2>My Students</h2>
        <p>List of students registered under your supervision groups according to SPM schema.</p>
      </div>

      <div className="faculty-students-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading enrolled scholars...</div>
        ) : (
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
                    No students currently supervised.
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

export default FacultyStudents;
