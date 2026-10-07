import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ title, items, variant = "admin" }) {
  return (
    <aside className={`app-sidebar app-sidebar-${variant}`}>
      <div className="sidebar-header">
        <span>{title}</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) =>
          item.to ? (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ) : (
            <button key={item.id} type="button" className="sidebar-link">
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </button>
          )
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
