import Sidebar from "./Sidebar";
import { SIDEBAR_ICONS } from "./sidebarIcons";

const STUDENT_MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: SIDEBAR_ICONS.dashboard,
    to: "/student/dashboard",
    end: true,
  },
  { id: "my-projects", label: "My Projects", icon: SIDEBAR_ICONS.projects, to: "/student/projects" },
  { id: "tasks", label: "My Tasks", icon: SIDEBAR_ICONS.tasks, to: "/student/tasks" },
  { id: "reviews", label: "Reviews", icon: SIDEBAR_ICONS.review, to: "/student/reviews" },
  { id: "scores-remarks", label: "Scores & Remarks", icon: SIDEBAR_ICONS.scores, to: "/student/scores" },
  { id: "reports", label: "Reports", icon: SIDEBAR_ICONS.reports, to: "/student/reports" },
];

function StudentSidebar() {
  return (
    <Sidebar title="Student Menu" items={STUDENT_MENU} variant="student" />
  );
}

export default StudentSidebar;
