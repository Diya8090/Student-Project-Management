import { useState, useEffect } from "react";
import "./StudentProjects.css";
import { projectsApi, tasksApi, unwrapData } from "../../../services/api";

function StudentProjects() {
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        const [projsRes, tasksRes] = await Promise.all([
          projectsApi.getAll(),
          tasksApi.getAll()
        ]);

        const allProjs = unwrapData(projsRes) || [];
        const allTasks = unwrapData(tasksRes) || [];

        const savedUser = localStorage.getItem("currentUser");
        let studentId = null;
        let studentName = "Scholar";
        if (savedUser) {
          try {
            const u = JSON.parse(savedUser);
            studentId = u.userId;
            studentName = u.fullName || "Scholar";
          } catch (e) {}
        }

        const myProj = (studentId && allProjs.find(p => (p.studentId || p.StudentId) === studentId)) || allProjs[0];

        if (myProj) {
          const pId = myProj.projectId || myProj.ProjectId;
          const projTasks = allTasks.filter(t => (t.allocationID || t.AllocationID || t.allocationId) === pId);

          const taskMilestones = projTasks.map((t, idx) => ({
            name: `Milestone ${idx + 1}: ${t.taskTitle || t.TaskTitle}`,
            status: (t.taskStatus || t.TaskStatus) === 3 ? "Approved" : (t.taskStatus || t.TaskStatus) === 2 ? "In Progress" : "Pending",
            date: t.dueDate ? (typeof t.dueDate === "string" ? t.dueDate.split("T")[0] : t.dueDate) : "Scheduled"
          }));

          setProject({
            ProjectId: pId,
            ProjectTitle: myProj.projectTitle || myProj.ProjectTitle,
            Description: myProj.description || myProj.Description || "Research and software project specification under SPM system.",
            FacultyName: myProj.facultyName || myProj.FacultyName || "Faculty Advisor",
            StudentName: myProj.studentName || myProj.StudentName || studentName,
            teamMembers: [myProj.studentName || studentName, "Team Partner"],
            ProgressPercentage: myProj.progressPercentage || myProj.ProgressPercentage || 0
          });

          setMilestones(taskMilestones.length > 0 ? taskMilestones : [
            { name: "Milestone 1: Project Proposal & Scope", status: "Approved", date: "2026-02-15" },
            { name: "Milestone 2: Database & Architecture", status: "Under Review", date: "2026-05-10" },
            { name: "Final Presentation & Code Review", status: "Pending", date: "2026-08-20" }
          ]);
        }
      } catch (err) {
        console.error("Failed to load student project:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, []);

  return (
    <div className="student-projects-container">
      <div className="page-header">
        <h2>My Projects</h2>
        <p>View detail specifications, supervision groups, and milestone completion status for your registered project according to SPM_Project schema.</p>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading project details...</div>
      ) : project ? (
        <>
          <div className="project-detail-card">
            <div className="proj-card-header">
              <h3>{project.ProjectTitle}</h3>
              <span className="proj-status-badge">Active Project ({project.ProgressPercentage}%)</span>
            </div>
            <div className="proj-card-body">
              <p className="proj-desc">{project.Description}</p>

              <div className="proj-supervisors-grid">
                <div className="supervisor-block">
                  <span className="block-label">Primary Faculty Guide</span>
                  <p><strong>{project.FacultyName}</strong></p>
                </div>
                <div className="supervisor-block">
                  <span className="block-label">Assigned Student Leader</span>
                  <p><strong>{project.StudentName}</strong></p>
                </div>
              </div>

              <div className="team-members-block">
                <span className="block-label">Project Team Members</span>
                <div className="team-badges-row">
                  {project.teamMembers.map((member, idx) => (
                    <span key={idx} className="team-badge">{member}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Milestone tracking timeline card */}
          <div className="project-detail-card milestones-card">
            <div className="proj-card-header">
              <h3>Project Completion Milestones</h3>
            </div>
            <div className="milestones-timeline">
              {milestones.map((m, idx) => (
                <div key={idx} className="timeline-node-item">
                  <div className="node-marker-col">
                    <span className={`node-marker status-${m.status.toLowerCase().replace(" ", "-")}`}></span>
                    {idx < milestones.length - 1 && <span className="timeline-connector-line"></span>}
                  </div>
                  <div className="node-info-col">
                    <strong>{m.name}</strong>
                    <span className={`node-status status-text-${m.status.toLowerCase().replace(" ", "-")}`}>
                      {m.status} ({m.date})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: "30px", color: "#6b7280" }}>No project currently registered.</div>
      )}
    </div>
  );
}

export default StudentProjects;
