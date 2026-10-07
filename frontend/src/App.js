import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import MainLayout from "./layouts/MainLayout";

// Admin pages
import AdminDashboard from "./pages/Dashboard/Admin/AdminDashboard";
import ManageUsers from "./pages/Dashboard/Admin/ManageUsers";
import ManageStudents from "./pages/Dashboard/Admin/ManageStudents";
import ManageFaculty from "./pages/Dashboard/Admin/ManageFaculty";
import ManageProjects from "./pages/Dashboard/Admin/ManageProjects";
import ManageTasks from "./pages/Dashboard/Admin/ManageTasks";
import ScoresRemarks from "./pages/Dashboard/Admin/ScoresRemarks";
import Settings from "./pages/Dashboard/Admin/Settings";
import ManageRoles from "./pages/Dashboard/Admin/ManageRoles";
import RolePermissions from "./pages/Dashboard/Admin/RolePermissions";
import TotalUsersDetail from "./pages/Dashboard/Admin/Details/TotalUsersDetail";
import TotalStudentsDetail from "./pages/Dashboard/Admin/Details/TotalStudentsDetail";
import TotalFacultyDetail from "./pages/Dashboard/Admin/Details/TotalFacultyDetail";
import TotalProjectsDetail from "./pages/Dashboard/Admin/Details/TotalProjectsDetail";
import TotalTasksDetail from "./pages/Dashboard/Admin/Details/TotalTasksDetail";

// Faculty pages
import FacultyDashboard from "./pages/Dashboard/Faculty/FacultyDashboard";
import FacultyProjects from "./pages/Dashboard/Faculty/FacultyProjects";
import FacultyReviews from "./pages/Dashboard/Faculty/FacultyReviews";
import FacultyStudents from "./pages/Dashboard/Faculty/FacultyStudents";
import FacultyScores from "./pages/Dashboard/Faculty/FacultyScores";
import FacultyReports from "./pages/Dashboard/Faculty/FacultyReports";
import FacultyProjectsDetail from "./pages/Dashboard/Faculty/Details/FacultyProjectsDetail";
import FacultyReviewsDetail from "./pages/Dashboard/Faculty/Details/FacultyReviewsDetail";
import FacultyStudentsDetail from "./pages/Dashboard/Faculty/Details/FacultyStudentsDetail";
import FacultyScoresDetail from "./pages/Dashboard/Faculty/Details/FacultyScoresDetail";

// Student pages
import StudentDashboard from "./pages/Dashboard/Student/StudentDashboard";
import StudentProjects from "./pages/Dashboard/Student/StudentProjects";
import StudentTasks from "./pages/Dashboard/Student/StudentTasks";
import StudentReviews from "./pages/Dashboard/Student/StudentReviews";
import StudentScores from "./pages/Dashboard/Student/StudentScores";
import StudentReports from "./pages/Dashboard/Student/StudentReports";
import StudentProjectsDetail from "./pages/Dashboard/Student/Details/StudentProjectsDetail";
import StudentTasksDetail from "./pages/Dashboard/Student/Details/StudentTasksDetail";
import StudentCompletedTasksDetail from "./pages/Dashboard/Student/Details/StudentCompletedTasksDetail";
import StudentReviewsDetail from "./pages/Dashboard/Student/Details/StudentReviewsDetail";

// Shared Profile page
import ProfilePage from "./pages/Profile/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Admin context */}
        <Route path="/admin" element={<MainLayout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<ProfilePage role="admin" />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="faculty" element={<ManageFaculty />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="tasks" element={<ManageTasks />} />
          <Route path="scores" element={<ScoresRemarks />} />
          <Route path="settings" element={<Settings />} />
          <Route path="roles" element={<ManageRoles />} />
          <Route path="permissions" element={<RolePermissions />} />
          <Route path="details/users" element={<TotalUsersDetail />} />
          <Route path="details/students" element={<TotalStudentsDetail />} />
          <Route path="details/faculty" element={<TotalFacultyDetail />} />
          <Route path="details/projects" element={<TotalProjectsDetail />} />
          <Route path="details/tasks" element={<TotalTasksDetail />} />
        </Route>

        {/* Student context */}
        <Route path="/student" element={<MainLayout role="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<ProfilePage role="student" />} />
          <Route path="projects" element={<StudentProjects />} />
          <Route path="tasks" element={<StudentTasks />} />
          <Route path="reviews" element={<StudentReviews />} />
          <Route path="scores" element={<StudentScores />} />
          <Route path="reports" element={<StudentReports />} />
          <Route path="details/projects" element={<StudentProjectsDetail />} />
          <Route path="details/tasks" element={<StudentTasksDetail />} />
          <Route path="details/completed-tasks" element={<StudentCompletedTasksDetail />} />
          <Route path="details/reviews" element={<StudentReviewsDetail />} />
        </Route>

        {/* Faculty context */}
        <Route path="/faculty" element={<MainLayout role="faculty" />}>
          <Route index element={<FacultyDashboard />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="profile" element={<ProfilePage role="faculty" />} />
          <Route path="projects" element={<FacultyProjects />} />
          <Route path="reviews" element={<FacultyReviews />} />
          <Route path="students" element={<FacultyStudents />} />
          <Route path="scores" element={<FacultyScores />} />
          <Route path="reports" element={<FacultyReports />} />
          <Route path="details/projects" element={<FacultyProjectsDetail />} />
          <Route path="details/reviews" element={<FacultyReviewsDetail />} />
          <Route path="details/students" element={<FacultyStudentsDetail />} />
          <Route path="details/scores" element={<FacultyScoresDetail />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
