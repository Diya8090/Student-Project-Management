import Sidebar from "./Sidebar";
import { SIDEBAR_ICONS } from "./sidebarIcons";

const FACULTY_MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: SIDEBAR_ICONS.dashboard,
    to: "/faculty/dashboard",
    end: true,
  },
  { id: "assigned-projects", label: "Assigned Projects", icon: SIDEBAR_ICONS.projects, to: "/faculty/projects" },
  { id: "reviews", label: "Reviews", icon: SIDEBAR_ICONS.review, to: "/faculty/reviews" },
  { id: "students", label: "My Students", icon: SIDEBAR_ICONS.students, to: "/faculty/students" },
  { id: "scores-remarks", label: "Scores & Remarks", icon: SIDEBAR_ICONS.scores, to: "/faculty/scores" },
  { id: "reports", label: "Reports", icon: SIDEBAR_ICONS.reports, to: "/faculty/reports" },
];

function FacultySidebar() {
  return (
    <Sidebar title="Faculty Menu" items={FACULTY_MENU} variant="faculty" />
  );
}

export default FacultySidebar;
