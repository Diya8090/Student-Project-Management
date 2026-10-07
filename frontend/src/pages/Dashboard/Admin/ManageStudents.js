import { useState, useEffect, useCallback } from "react";
import "./ManageStudents.css";

const PRIMARY_API_BASE = "http://localhost:5239/api";
const FALLBACK_API_BASE = "https://localhost:7145/api";

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [facultyGuides, setFacultyGuides] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // Form modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "CS",
    projectTitle: "",
    assignedGuide: "",
    mobileNumber: "",
  });

  // API helper with fallback
  const fetchApi = useCallback(async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${PRIMARY_API_BASE}${endpoint}`, options);
      return res;
    } catch {
      const res = await fetch(`${FALLBACK_API_BASE}${endpoint}`, options);
      return res;
    }
  }, []);

  // Fetch Students, Faculty, and Projects from API
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Fetch Users
      const usersRes = await fetchApi("/User");
      if (!usersRes.ok) {
        throw new Error(`Failed to fetch users (Status: ${usersRes.status})`);
      }
      const allUsers = await usersRes.json();

      // Filter Students (RoleId = 3 or Role = "Student")
      const studentUsers = allUsers.filter(
        (u) =>
          u.roleId === 3 ||
          (u.role && u.role.toLowerCase() === "student") ||
          (u.Role && u.Role.toLowerCase() === "student")
      );

      // Filter Faculty Guides (RoleId = 2 or Role = "Faculty")
      const facultyUsers = allUsers.filter(
        (u) =>
          u.roleId === 2 ||
          (u.role && u.role.toLowerCase() === "faculty") ||
          (u.Role && u.Role.toLowerCase() === "faculty")
      );
      setFacultyGuides(facultyUsers);

      // 2. Fetch Projects (to map assigned guide & project titles)
      let projList = [];
      try {
        const projRes = await fetchApi("/Project");
        if (projRes.ok) {
          projList = await projRes.json();
          setProjects(projList);
        }
      } catch (pErr) {
        console.warn("Could not fetch projects list:", pErr);
      }

      // Map Students with Project & Faculty info
      const mappedStudents = studentUsers.map((stu) => {
        const sId = stu.userId ?? stu.UserId ?? stu.id;

        // Find linked project for this student
        const linkedProject = projList.find(
          (p) => (p.studentId ?? p.StudentId) === sId
        );

        return {
          id: sId,
          userId: sId,
          fullName: stu.fullName || stu.FullName || "",
          email: stu.email || stu.Email || "",
          department: stu.department || "CS",
          projectTitle:
            linkedProject?.projectTitle ||
            linkedProject?.ProjectTitle ||
            "Not Assigned",
          assignedGuide:
            linkedProject?.facultyName ||
            linkedProject?.FacultyName ||
            (facultyUsers.length > 0
              ? facultyUsers[0].fullName || facultyUsers[0].FullName
              : "Unassigned"),
          mobileNumber: stu.mobileNumber || stu.MobileNumber || "",
          isActive: stu.isActive !== undefined ? Boolean(stu.isActive) : true,
        };
      });

      setStudents(mappedStudents);
    } catch (err) {
      console.error("Error loading students data:", err);
      setErrorMessage(
        "Failed to connect to backend database API. Ensure your .NET server is running on http://localhost:5239 or https://localhost:7145."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      department: "CS",
      projectTitle: "",
      assignedGuide:
        facultyGuides.length > 0
          ? facultyGuides[0].fullName || facultyGuides[0].FullName
          : "",
      mobileNumber: "",
    });
    setSelectedStudentId(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleOpenEdit = (student) => {
    setFormData({
      fullName: student.fullName,
      email: student.email,
      password: "",
      department: student.department || "CS",
      projectTitle: student.projectTitle === "Not Assigned" ? "" : student.projectTitle,
      assignedGuide: student.assignedGuide || "",
      mobileNumber: student.mobileNumber,
    });
    setSelectedStudentId(student.id);
    setModalMode("edit");
    setShowModal(true);
  };

  // DELETE Student via API (DELETE /api/User/{id})
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this student record from database?")) {
      return;
    }

    try {
      const response = await fetchApi(`/User/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete student (Status: ${response.status})`);
      }

      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student: " + error.message);
    }
  };

  // POST / PUT Student via API (POST or PUT /api/User)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailClean = formData.email.trim();

    // Duplicate check
    const emailExists = students.some(
      (s) =>
        s.email.toLowerCase() === emailClean.toLowerCase() &&
        (modalMode === "add" || s.id !== selectedStudentId)
    );

    if (emailExists) {
      alert(`Error: A student with email "${emailClean}" already exists.`);
      return;
    }

    const dtoPayload = {
      fullName: formData.fullName.trim(),
      email: emailClean,
      password: formData.password,
      mobileNumber: formData.mobileNumber.trim(),
      profilePicturePath: "",
      roleId: 3, // Student RoleId
      isActive: true,
      isDeleted: false,
    };

    if (modalMode === "add") {
      try {
        const response = await fetchApi("/User", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dtoPayload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Failed to create student (Status: ${response.status})`);
        }

        const createdUser = await response.json();
        const newId = createdUser.userId ?? createdUser.UserId;

        const newStudent = {
          id: newId,
          userId: newId,
          fullName: dtoPayload.fullName,
          email: dtoPayload.email,
          department: formData.department,
          projectTitle: formData.projectTitle || "Not Assigned",
          assignedGuide: formData.assignedGuide || "Unassigned",
          mobileNumber: dtoPayload.mobileNumber,
          isActive: true,
        };

        setStudents((prev) => [...prev, newStudent]);
        setShowModal(false);
      } catch (error) {
        console.error("Error creating student:", error);
        alert("Failed to create student: " + error.message);
      }
    } else {
      try {
        const response = await fetchApi(`/User/${selectedStudentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dtoPayload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Failed to update student (Status: ${response.status})`);
        }

        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === selectedStudentId) {
              return {
                ...s,
                fullName: dtoPayload.fullName,
                email: dtoPayload.email,
                department: formData.department,
                projectTitle: formData.projectTitle || "Not Assigned",
                assignedGuide: formData.assignedGuide || "Unassigned",
                mobileNumber: dtoPayload.mobileNumber,
              };
            }
            return s;
          })
        );

        setShowModal(false);
      } catch (error) {
        console.error("Error updating student:", error);
        alert("Failed to update student: " + error.message);
      }
    }
  };

  // Filtered Students List
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.assignedGuide.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.mobileNumber.includes(searchQuery);

    const matchesDept =
      deptFilter === "All" || student.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="manage-students-container">
      <div className="students-page-header">
        <div>
          <h2>Manage Student Directory</h2>
          <p>Register student details, assign faculty guides, and link project titles in SPM Database.</p>
        </div>

        <button onClick={handleOpenAdd} className="btn-add-student">
          + Add New Student
        </button>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{errorMessage}</span>
          <button
            onClick={loadData}
            style={{
              padding: "4px 10px",
              background: "#991b1b",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Directory Filter controls */}
      <div className="directory-filters">
        <div className="search-box-wrapper">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student, project, or guide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-dept-wrapper">
          <label>Department:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="EC">Electronics & Comm. (EC)</option>
            <option value="EE">Electrical Engineering (EE)</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="students-table-card">
          <p style={{ padding: "20px" }}>Loading students from SPM Database...</p>
        </div>
      ) : (
        /* Student Table */
        <div className="students-table-card">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Department</th>
                <th>Enrolled Project Title</th>
                <th>Assigned Guide</th>
                <th>Mobile Number</th>
                <th className="align-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-profile-cell">
                        <div className="student-avatar-initials">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-name-details">
                          <strong className="student-table-name">
                            {student.fullName}
                          </strong>
                          <span className="student-table-email">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="student-dept-badge">
                        {student.department}
                      </span>
                    </td>
                    <td>
                      <span
                        className="student-table-project"
                        title={student.projectTitle}
                      >
                        {student.projectTitle}
                      </span>
                    </td>
                    <td>
                      <span className="student-table-guide">
                        {student.assignedGuide}
                      </span>
                    </td>
                    <td>
                      <span className="student-table-mobile">
                        {student.mobileNumber}
                      </span>
                    </td>
                    <td>
                      <div className="student-action-btns">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="btn-table-action btn-table-edit"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="btn-table-action btn-table-delete"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-records-cell">
                    No student records match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {modalMode === "add"
                  ? "Register New Student Account"
                  : "Modify Student Record"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close-modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@student.university.edu"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  {modalMode === "add"
                    ? "Password"
                    : "Password (leave blank to keep unchanged)"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    modalMode === "add"
                      ? "Enter login password"
                      : "Enter new password (optional)"
                  }
                  required={modalMode === "add"}
                />
              </div>

              <div className="form-row-group">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="CS">Computer Science (CS)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="EC">Electronics & Comm. (EC)</option>
                    <option value="EE">Electrical Engineering (EE)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                />
              </div>

              <div className="form-group">
                <label>Assigned Guide</label>
                <select
                  name="assignedGuide"
                  value={formData.assignedGuide}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Faculty Guide --</option>
                  {facultyGuides.map((fg) => {
                    const fgName = fg.fullName || fg.FullName;
                    return (
                      <option key={fg.userId ?? fg.UserId} value={fgName}>
                        {fgName}
                      </option>
                    );
                  })}
                  {/* Fallback standard guide options if database faculty list is empty */}
                  {facultyGuides.length === 0 && (
                    <>
                      <option value="Dr. Ramesh Kumar">Dr. Ramesh Kumar</option>
                      <option value="Prof. Sunita Rao">Prof. Sunita Rao</option>
                      <option value="Dr. Anil Mehta">Dr. Anil Mehta</option>
                      <option value="Prof. Rajesh Gupta">Prof. Rajesh Gupta</option>
                    </>
                  )}
                </select>
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-modal-submit">
                  {modalMode === "add" ? "Register Student" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-modal-cancel"
                >
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

export default ManageStudents;

