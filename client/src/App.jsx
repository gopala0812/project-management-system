import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  SquarePen,
  Trash2,
  UserRound
} from 'lucide-react';
import { apiRequest, queryString } from './api.js';

const projectStatuses = [
  ['NOT_STARTED', 'Not Started'],
  ['IN_PROGRESS', 'In Progress'],
  ['COMPLETED', 'Completed']
];

const taskStatuses = [
  ['PENDING', 'Pending'],
  ['IN_PROGRESS', 'In Progress'],
  ['COMPLETED', 'Completed']
];

const priorities = [
  ['LOW', 'Low'],
  ['MEDIUM', 'Medium'],
  ['HIGH', 'High']
];

const emptyProject = {
  name: '',
  description: '',
  status: 'NOT_STARTED',
  startDate: '',
  endDate: ''
};

const emptyTask = {
  projectId: '',
  name: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING',
  dueDate: ''
};

function getPath() {
  return window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
}

function toDateInput(value) {
  return value ? value.slice(0, 10) : '';
}

function prettyDate(value, fallback = 'Not set') {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function shortDate(value) {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(new Date(value));
}

function labelFor(options, value) {
  return options.find(([key]) => key === value)?.[1] || value;
}

function toneForStatus(status) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'IN_PROGRESS') return 'info';
  return 'neutral';
}

function toneForPriority(priority) {
  if (priority === 'HIGH') return 'danger';
  if (priority === 'MEDIUM') return 'warning';
  return 'neutral';
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-only" onClick={onClose} aria-label="Close">x</button>
        </div>
        {children}
      </section>
    </div>
  );
}

function AuthPage({ mode, navigate, onAuth }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (isRegister && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = isRegister
        ? { fullName: form.fullName, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const data = await apiRequest(`/auth/${mode}`, { method: 'POST', body: payload });
      localStorage.setItem('pms_token', data.token);
      onAuth(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <main className="auth-shell">
    <section className="auth-card">
      <div className="brand-mark">
        <FolderKanban size={24} />
      </div>

      <div className="auth-header">
        <p className="eyebrow">PROJECT MANAGEMENT SYSTEM</p>
        <h1>{isRegister ? 'Create Account' : 'Login'}</h1>
      </div>

      <form className="form-stack" onSubmit={submit}>
        {isRegister && (
          <label>
            Full Name
            <input
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={(event) =>
                setForm({ ...form, fullName: event.target.value })
              }
              required
              minLength="2"
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            placeholder="name@company.com"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
            minLength={isRegister ? 8 : 1}
          />
        </label>

        {isRegister && (
          <label>
            Confirm Password
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm({
                  ...form,
                  confirmPassword: event.target.value
                })
              }
              required
              minLength="8"
            />
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <button className="primary auth-btn" disabled={loading}>
          {loading
            ? 'Please wait...'
            : isRegister
            ? 'Register'
            : 'Login'}
        </button>
      </form>

      <p className="auth-switch">
        {isRegister
          ? 'Already have an account?'
          : "Don't have an account?"}

        <button
          type="button"
          onClick={() =>
            navigate(isRegister ? '/login' : '/register')
          }
        >
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </section>
  </main>
);
}

function Shell({ user, path, navigate, logout, children }) {
  const navItems = [
    ['/dashboard', LayoutDashboard, 'Dashboard'],
    ['/projects', FolderKanban, 'Projects'],
    ['/profile', UserRound, 'Profile']
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small"><FolderKanban size={22} /></div>
          <div>
            <strong>Project Management</strong>
            <span>Workspace</span>
          </div>
        </div>
        <nav className="side-nav">
          {navItems.map(([href, Icon, label]) => (
            <button key={href} className={path.startsWith(href) ? 'active' : ''} onClick={() => navigate(href)}>
              <Icon size={18} /> {label}
            </button>
          ))}
          <button onClick={logout}><LogOut size={18} /> Logout</button>
        </nav>
        <div className="user-chip">
          <strong>{user.fullName}</strong>
          <span>{user.email}</span>
        </div>
      </aside>
      <section className="content">{children}</section>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <article className="stat-card">
      <div className="icon-tile"><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PageHeader({ eyebrow, title, action }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </header>
  );
}

function ProjectForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || emptyProject);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form className="form-stack" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <label>
        Project Name
        <input value={form.name} onChange={(event) => update('name', event.target.value)} required />
      </label>
      <label>
        Description
        <textarea rows="4" value={form.description || ''} onChange={(event) => update('description', event.target.value)} />
      </label>
      <div className="grid-3">
        <label>
          Status
          <select value={form.status} onChange={(event) => update('status', event.target.value)}>
            {projectStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Start Date
          <input type="date" value={form.startDate || ''} onChange={(event) => update('startDate', event.target.value)} />
        </label>
        <label>
          End Date
          <input type="date" value={form.endDate || ''} onChange={(event) => update('endDate', event.target.value)} />
        </label>
      </div>
      <button className="primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
    </form>
  );
}

function TaskForm({ projectId, initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || { ...emptyTask, projectId });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form className="form-stack" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, projectId }); }}>
      <label>
        Task Name
        <input value={form.name} onChange={(event) => update('name', event.target.value)} required />
      </label>
      <label>
        Description
        <textarea rows="4" value={form.description || ''} onChange={(event) => update('description', event.target.value)} />
      </label>
      <div className="grid-3">
        <label>
          Priority
          <select value={form.priority} onChange={(event) => update('priority', event.target.value)}>
            {priorities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Status
          <select value={form.status} onChange={(event) => update('status', event.target.value)}>
            {taskStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Due Date
          <input type="date" value={form.dueDate || ''} onChange={(event) => update('dueDate', event.target.value)} />
        </label>
      </div>
      <button className="primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
    </form>
  );
}

function DashboardPage({ user, navigate }) {
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [statsData, projectData] = await Promise.all([
          apiRequest('/dashboard/stats'),
          apiRequest('/projects?limit=3&sortBy=createdAt&sortOrder=desc')
        ]);
        setStats(statsData);
        setProjects(projectData.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    ['Total Projects', stats.totalProjects || 0, FolderKanban],
    ['Total Tasks', stats.totalTasks || 0, ClipboardList],
    ['Completed Tasks', stats.completedTasks || 0, CheckCircle2],
    ['Pending Tasks', stats.pendingTasks || 0, SquarePen],
    ['Projects In Progress', stats.projectsInProgress || 0, BarChart3]
  ];

  return (
    <>
      <PageHeader eyebrow="Dashboard" title={`Welcome ${user.fullName}`} />
      {error && <p className="error">{error}</p>}
      {loading && <div className="loading-bar" />}
      <section className="stats-grid">
        {statCards.map(([label, value, Icon]) => <StatCard key={label} label={label} value={value} icon={Icon} />)}
      </section>
      <section className="panel">
        <div className="panel-head">
          <h3>Recent Projects</h3>
          <button className="secondary" onClick={() => navigate('/projects')}>View all</button>
        </div>
        <div className="simple-list">
          {projects.map((project) => (
            <button key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
              <span>{project.name}</span>
              <Badge tone={toneForStatus(project.status)}>{labelFor(projectStatuses, project.status)}</Badge>
            </button>
          ))}
          {!projects.length && <p className="empty">No projects yet.</p>}
        </div>
      </section>
    </>
  );
}

function ProjectsPage({ navigate }) {
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest(`/projects${queryString(filters)}`);
      setProjects(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters]);

  async function saveProject(form) {
    setLoading(true);
    try {
      const editing = Boolean(editor?.id);
      await apiRequest(editing ? `/projects/${editor.id}` : '/projects', {
        method: editing ? 'PUT' : 'POST',
        body: form
      });
      setEditor(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(projectId) {
    if (!confirm('Delete this project and its tasks?')) return;
    await apiRequest(`/projects/${projectId}`, { method: 'DELETE' });
    await load();
  }

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Manage projects"
        action={<button className="primary icon-button" onClick={() => setEditor(emptyProject)}><Plus size={17} /> Create Project</button>}
      />
      {error && <p className="error">{error}</p>}
      {loading && <div className="loading-bar" />}
      <section className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input placeholder="Search Projects..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        </label>
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">All</option>
          {projectStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>
      <section className="card-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.id}>
            <div className="card-topline">
              <h3>{project.name}</h3>
              <Badge tone={toneForStatus(project.status)}>{labelFor(projectStatuses, project.status)}</Badge>
            </div>
            <p>{project.description || 'No description added.'}</p>
            <div className="meta-grid">
              <span>Status:<strong>{labelFor(projectStatuses, project.status)}</strong></span>
              <span>Start:<strong>{prettyDate(project.startDate)}</strong></span>
              <span>End:<strong>{prettyDate(project.endDate)}</strong></span>
              <span>Created:<strong>{prettyDate(project.createdAt)}</strong></span>
            </div>
            <div className="card-actions">
              <button className="secondary" onClick={() => navigate(`/projects/${project.id}`)}>View</button>
              <button className="secondary" onClick={() => setEditor({ ...project, startDate: toDateInput(project.startDate), endDate: toDateInput(project.endDate) })}>Edit</button>
              <button className="danger-button" onClick={() => deleteProject(project.id)}>Delete</button>
            </div>
          </article>
        ))}
        {!projects.length && <p className="empty">No projects found.</p>}
      </section>
      {editor && (
        <Modal title={editor.id ? 'Edit Project' : 'Create Project'} onClose={() => setEditor(null)}>
          <ProjectForm initial={editor} loading={loading} onSubmit={saveProject} />
        </Modal>
      )}
    </>
  );
}

function ProjectDetailsPage({ projectId, navigate }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [projectData, taskData] = await Promise.all([
        apiRequest(`/projects/${projectId}`),
        apiRequest(`/tasks${queryString({ ...filters, projectId })}`)
      ]);
      setProject(projectData);
      setTasks(taskData.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectId, filters]);

  async function saveTask(form) {
    setLoading(true);
    try {
      const editing = Boolean(editor?.id);
      await apiRequest(editing ? `/tasks/${editor.id}` : '/tasks', {
        method: editing ? 'PUT' : 'POST',
        body: form
      });
      setEditor(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
    await load();
  }

  async function completeTask(task) {
    await apiRequest(`/tasks/${task.id}`, {
      method: 'PUT',
      body: { status: 'COMPLETED' }
    });
    await load();
  }

  if (!project && loading) return <div className="loading-page subtle">Loading...</div>;

  return (
    <>
      <PageHeader
        eyebrow="Project Details"
        title={project?.name || 'Project'}
        action={<button className="secondary" onClick={() => navigate('/projects')}>Back to Projects</button>}
      />
      {error && <p className="error">{error}</p>}
      {loading && <div className="loading-bar" />}
      {project && (
        <section className="detail-hero">
          <div>
            <h3>{project.name}</h3>
            <p>{project.description || 'No description added.'}</p>
          </div>
          <div className="detail-meta">
            <span>Status:<strong>{labelFor(projectStatuses, project.status)}</strong></span>
            <span>Start Date:<strong>{prettyDate(project.startDate)}</strong></span>
            <span>End Date:<strong>{prettyDate(project.endDate)}</strong></span>
          </div>
        </section>
      )}
      <section className="panel">
        <div className="panel-head">
          <h3>Tasks</h3>
          <button className="primary icon-button" onClick={() => setEditor({ ...emptyTask, projectId })}><Plus size={17} /> Add Task</button>
        </div>
        <div className="toolbar">
          <label className="search-field">
            <Search size={17} />
            <input placeholder="Search Tasks" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
          </label>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All Status</option>
            {taskStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
            <option value="">All Priority</option>
            {priorities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="task-list">
          {tasks.map((task) => (
            <article className="task-card" key={task.id}>
              <div>
                <div className="card-topline">
                  <h4>{task.name}</h4>
                  <Badge tone={toneForPriority(task.priority)}>{labelFor(priorities, task.priority)}</Badge>
                </div>
                <p>{task.description || 'No description added.'}</p>
                <span><CalendarDays size={15} /> Due: {shortDate(task.dueDate)} · Status: {labelFor(taskStatuses, task.status)}</span>
              </div>
              <div className="card-actions">
                <button className="secondary" onClick={() => setEditor({ ...task, dueDate: toDateInput(task.dueDate) })}>Edit</button>
                <button className="danger-button" onClick={() => deleteTask(task.id)}>Delete</button>
                {task.status !== 'COMPLETED' && <button className="primary" onClick={() => completeTask(task)}>Mark Complete</button>}
              </div>
            </article>
          ))}
          {!tasks.length && <p className="empty">No tasks found.</p>}
        </div>
      </section>
      {editor && (
        <Modal title={editor.id ? 'Edit Task' : 'Add Task'} onClose={() => setEditor(null)}>
          <TaskForm projectId={projectId} initial={editor} loading={loading} onSubmit={saveTask} />
        </Modal>
      )}
    </>
  );
}

function ProfilePage({ user, logout }) {
  return (
    <>
      <PageHeader eyebrow="Profile" title="Account Information" />

      <section className="profile-card">
        <div className="avatar">
          {user.fullName?.slice(0, 1).toUpperCase()}
        </div>

        <div className="profile-fields">
          <span>
            Name
            <strong>{user.fullName}</strong>
          </span>

          <span>
            Email
            <strong>{user.email}</strong>
          </span>

          <span>
            Account Status
            <strong>Active</strong>
          </span>
        </div>

        <button
          className="primary icon-button"
          onClick={logout}
        >
          <LogOut size={17} />
          Logout
        </button>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Projects</span>
          <strong>Manage</strong>
        </div>

        <div className="stat-card">
          <span>Tasks</span>
          <strong>Track</strong>
        </div>

        <div className="stat-card">
          <span>Security</span>
          <strong>JWT</strong>
        </div>

        <div className="stat-card">
          <span>Database</span>
          <strong>PostgreSQL</strong>
        </div>

        <div className="stat-card">
          <span>Status</span>
          <strong>Online</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>About This Account</h3>
        </div>

        <p>
          This account can create projects, manage tasks, track project
          progress, search projects and tasks, and view dashboard statistics.
        </p>
      </section>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [path, setPath] = useState(getPath());
  const [booting, setBooting] = useState(true);

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath);
    setPath(getPath());
  }

  useEffect(() => {
    function syncPath() {
      setPath(getPath());
    }
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  useEffect(() => {
    async function boot() {
      const token = localStorage.getItem('pms_token');
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const data = await apiRequest('/auth/me');
        setUser(data.user);
        if (path === '/login' || path === '/register' || path === '/') navigate('/dashboard');
      } catch {
        localStorage.removeItem('pms_token');
      } finally {
        setBooting(false);
      }
    }
    boot();
  }, []);

  function logout() {
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('pms_token');
    setUser(null);
    navigate('/login');
  }

  const projectDetailMatch = useMemo(() => path.match(/^\/projects\/([^/]+)$/), [path]);

  if (booting) return <div className="loading-page subtle">Loading...</div>;

  if (!user) {
    if (path !== '/register' && path !== '/login') {
      window.history.replaceState({}, '', '/login');
    }
    return <AuthPage mode={path === '/register' ? 'register' : 'login'} navigate={navigate} onAuth={setUser} />;
  }

  let page = <DashboardPage user={user} navigate={navigate} />;
  if (path === '/projects') page = <ProjectsPage navigate={navigate} />;
  if (projectDetailMatch) page = <ProjectDetailsPage projectId={projectDetailMatch[1]} navigate={navigate} />;
  if (path === '/profile') page = <ProfilePage user={user} logout={logout} />;

  return (
    <Shell user={user} path={path} navigate={navigate} logout={logout}>
      {page}
    </Shell>
  );
}

export default App;
