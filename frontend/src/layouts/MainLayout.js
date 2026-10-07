import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import AdminSidebar from "../components/Sidebar/AdminSidebar";
import FacultySidebar from "../components/Sidebar/FacultySidebar";
import StudentSidebar from "../components/Sidebar/StudentSidebar";
import "./MainLayout.css";

const SIDEBAR_ROLES = ["admin", "faculty", "student"];

function MainLayout({ role }) {
  const hasSidebar = SIDEBAR_ROLES.includes(role);

  return (
    <div className={`main-layout layout-${role}`}>
      <Navbar role={role} />

      <div className={`layout-body ${hasSidebar ? "layout-body-sidebar" : ""}`}>
        {role === "admin" && <AdminSidebar />}
        {role === "faculty" && <FacultySidebar />}
        {role === "student" && <StudentSidebar />}

        <main className="layout-content">
          <Outlet />
        </main>
      </div>

      <Footer role={role} />
    </div>
  );
}

export default MainLayout;
