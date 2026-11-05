// Centralized API Client for Student Project Management (.NET Backend)
export const PRIMARY_API_BASE = "http://localhost:5239/api";
export const FALLBACK_API_BASE = "https://localhost:7145/api";

// Helper to get active JWT token
export const getToken = () => {
  const directToken = localStorage.getItem("token");
  if (directToken) return directToken;
  try {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return user.token || user.Token || null;
  } catch {
    return null;
  }
};

// Helper to get active user
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
};

// Helper to save authenticated session
export const setAuthSession = (user, token) => {
  if (token) {
    localStorage.setItem("token", token);
  }
  if (user) {
    const sessionUser = {
      ...user,
      token: token || user.token,
    };
    localStorage.setItem("currentUser", JSON.stringify(sessionUser));
  }
};

// Clear session on logout
export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
};

// Helper to normalize unwrap array or entity from API response
export const unwrapData = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.Data)) return resData.Data;
  return resData;
};

// Robust fetch wrapper with automatic token attachment & port fallback
export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    Accept: "application/json",
    ...(options.body && typeof options.body === "string"
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(`${PRIMARY_API_BASE}${endpoint}`, config);
  } catch (errPrimary) {
    try {
      response = await fetch(`${FALLBACK_API_BASE}${endpoint}`, config);
    } catch (errFallback) {
      throw new Error(
        `Unable to reach .NET backend on http://localhost:5239 or https://localhost:7145. Ensure backend is running.`
      );
    }
  }

  return response;
}

// Authentication API
export const authApi = {
  login: async (email, password) => {
    const res = await apiRequest("/User/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let errMsg = "Invalid email or password";
      try {
        const errJson = await res.json();
        errMsg = errJson.message || errJson.Message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    const token = data.token || data.Token;
    const user = data.user || data.User;
    setAuthSession(user, token);
    return { token, user };
  },
};

// Users API
export const usersApi = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    searchParams.set("pageSize", "1000");
    if (params.search) searchParams.set("search", params.search);
    if (params.roleId) searchParams.set("roleId", params.roleId);
    if (params.isActive !== undefined) searchParams.set("isActive", params.isActive);

    const res = await apiRequest(`/User?${searchParams.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch users (Status: ${res.status})`);
    const json = await res.json();
    return unwrapData(json);
  },
  getById: async (id) => {
    const res = await apiRequest(`/User/${id}`);
    if (!res.ok) throw new Error(`User ${id} not found`);
    return await res.json();
  },
  create: async (userData) => {
    const res = await apiRequest("/User", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.errors?.join(", ") || err.message || "Failed to create user";
      throw new Error(msg);
    }
    return await res.json();
  },
  update: async (id, userData) => {
    const res = await apiRequest(`/User/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.errors?.join(", ") || err.message || "Failed to update user";
      throw new Error(msg);
    }
    return true;
  },
  delete: async (id) => {
    const res = await apiRequest(`/User/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete user");
    return true;
  },
};

// Projects API
export const projectsApi = {
  getAll: async () => {
    const res = await apiRequest("/Project");
    if (!res.ok) throw new Error(`Failed to fetch projects (Status: ${res.status})`);
    const json = await res.json();
    return unwrapData(json);
  },
  getById: async (id) => {
    const res = await apiRequest(`/Project/${id}`);
    if (!res.ok) throw new Error(`Project ${id} not found`);
    return await res.json();
  },
  create: async (projectData) => {
    const res = await apiRequest("/Project", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.errors?.join(", ") || err.message || "Failed to create project";
      throw new Error(msg);
    }
    return await res.json();
  },
  update: async (id, projectData) => {
    const res = await apiRequest(`/Project/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.errors?.join(", ") || err.message || "Failed to update project";
      throw new Error(msg);
    }
    return true;
  },
  delete: async (id) => {
    const res = await apiRequest(`/Project/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete project");
    return true;
  },
};

// Tasks API
export const tasksApi = {
  getAll: async () => {
    const res = await apiRequest("/Task");
    if (!res.ok) throw new Error(`Failed to fetch tasks (Status: ${res.status})`);
    const json = await res.json();
    return unwrapData(json);
  },
  getById: async (id) => {
    const res = await apiRequest(`/Task/${id}`);
    if (!res.ok) throw new Error(`Task ${id} not found`);
    const json = await res.json();
    return json.data || json;
  },
  create: async (taskData) => {
    const res = await apiRequest("/Task", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.errors?.join(", ") || err.message || "Failed to create task";
      throw new Error(msg);
    }
    return await res.json();
  },
  update: async (id, taskData) => {
    const res = await apiRequest(`/Task/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.errors?.join(", ") || err.message || "Failed to update task";
      throw new Error(msg);
    }
    return true;
  },
  delete: async (id) => {
    const res = await apiRequest(`/Task/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete task");
    return true;
  },
};

// Roles, Statuses, Priorities API
export const rolesApi = {
  getAll: async () => {
    const res = await apiRequest("/Role");
    if (!res.ok) return [];
    return unwrapData(await res.json());
  },
  create: async (roleData) => {
    const res = await apiRequest("/Role", {
      method: "POST",
      body: JSON.stringify(roleData),
    });
    if (!res.ok) throw new Error("Failed to create role");
    return await res.json();
  },
  delete: async (id) => {
    const res = await apiRequest(`/Role/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete role");
    return true;
  },
};

export const statusesApi = {
  getAll: async () => {
    const res = await apiRequest("/Status");
    if (!res.ok) return [];
    return unwrapData(await res.json());
  },
};

export const prioritiesApi = {
  getAll: async () => {
    const res = await apiRequest("/Priority");
    if (!res.ok) return [];
    return unwrapData(await res.json());
  },
};

// Dashboard API
export const dashboardApi = {
  getStudentCount: async () => {
    const res = await apiRequest("/Dashboard/StudentCount");
    if (!res.ok) return 0;
    const json = await res.json();
    return json.totalStudents ?? json.TotalStudents ?? 0;
  },
  getFacultyCount: async () => {
    const res = await apiRequest("/Dashboard/FacultyCount");
    if (!res.ok) return 0;
    const json = await res.json();
    return json.totalFaculty ?? json.TotalFaculty ?? 0;
  },
  getProjectCount: async () => {
    const res = await apiRequest("/Dashboard/ProjectCount");
    if (!res.ok) return 0;
    const json = await res.json();
    return json.totalProjects ?? json.TotalProjects ?? 0;
  },
  getTasksByStatus: async () => {
    const res = await apiRequest("/Dashboard/TasksByStatus");
    if (!res.ok) return [];
    return await res.json();
  },
  getTasksByPriority: async () => {
    const res = await apiRequest("/Dashboard/TasksByPriority");
    if (!res.ok) return [];
    return await res.json();
  },
  getMonthlyCompletedTasks: async () => {
    const res = await apiRequest("/Dashboard/MonthlyCompletedTasks");
    if (!res.ok) return [];
    return await res.json();
  },
};
