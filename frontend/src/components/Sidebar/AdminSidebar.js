import Sidebar from "./Sidebar";
import { SIDEBAR_ICONS } from "./sidebarIcons";

const ADMIN_MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: SIDEBAR_ICONS.dashboard,
    to: "/admin/dashboard",
    end: true,
  },
  { id: "manage-roles", label: "Manage Roles", icon: SIDEBAR_ICONS.roles, to: "/admin/roles" },
  { id: "manage-users", label: "Manage Users", icon: SIDEBAR_ICONS.users, to: "/admin/users" },
  { id: "manage-students", label: "Manage Students", icon: SIDEBAR_ICONS.students, to: "/admin/students" },
  { id: "manage-faculty", label: "Manage Faculty", icon: SIDEBAR_ICONS.faculty, to: "/admin/faculty" },
  { id: "role-permissions", label: "Role & Permissions", icon: SIDEBAR_ICONS.permission, to: "/admin/permissions" },
  { id: "manage-projects", label: "Manage Projects", icon: SIDEBAR_ICONS.projects, to: "/admin/projects" },
  { id: "manage-tasks", label: "Manage Tasks", icon: SIDEBAR_ICONS.tasks, to: "/admin/tasks" },
  { id: "scores-remarks", label: "Scores & Remarks", icon: SIDEBAR_ICONS.scores, to: "/admin/scores" }
];

function AdminSidebar() {
  return (
    <Sidebar title="Admin Menu" items={ADMIN_MENU} variant="admin" />
  );
}

export default AdminSidebar;
