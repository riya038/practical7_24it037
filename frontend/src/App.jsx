import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import AuthCard from './components/AuthCard';
import TaskStats from './components/TaskStats';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import TaskItem from './components/TaskItem';
import EditTaskModal from './components/EditTaskModal';
import Toast from './components/Toast';
import { useAuth } from './context/AuthContext';
import {
  checkServerHealth,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from './api/taskApi';
import {
  ListTodo,
  AlertCircle,
  RefreshCw,
  Loader2,
  Inbox,
  ShieldAlert,
} from 'lucide-react';
import './App.css';

export default function App() {
  const { token, user, isAuthenticated, loading: authLoading, authError } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Server Connection Status
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'priority' | 'alpha'

  // Modal State for Editing
  const [editingTask, setEditingTask] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Ping backend server
  const checkHealth = async () => {
    setIsCheckingServer(true);
    const health = await checkServerHealth();
    setIsServerOnline(health.online);
    setIsCheckingServer(false);
    return health.online;
  };

  // Load tasks for logged-in user
  const loadTasks = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const online = await checkHealth();
      if (!online) {
        setLoading(false);
        showToast('Backend server is offline. Please run "npm run dev" in backend.', 'error');
        return;
      }
      const data = await fetchTasks(token);
      setTasks(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load user tasks from MongoDB.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [isAuthenticated, token]);

  // Handle Add Task
  const handleAddTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      const newTask = await createTask(taskData, token);
      setTasks((prev) => [newTask, ...prev]);
      showToast(`Task "${newTask.title}" saved to MongoDB!`, 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Could not create task.', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Complete
  const handleToggleComplete = async (id, newCompletedStatus) => {
    try {
      setUpdatingTaskId(id);
      const updated = await updateTask(id, { completed: newCompletedStatus }, token);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      showToast(
        newCompletedStatus ? 'Task completed!' : 'Task reopened!',
        'info'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update task status.', 'error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Handle Save Edited Task
  const handleSaveEdit = async (id, updateData) => {
    try {
      setIsSavingEdit(true);
      const updated = await updateTask(id, updateData, token);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      showToast('Task updated successfully in MongoDB!', 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to update task.', 'error');
      return false;
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (id) => {
    try {
      setDeletingTaskId(id);
      await deleteTask(id, token);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('Task removed from MongoDB!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete task.', 'error');
    } finally {
      setDeletingTaskId(null);
    }
  };

  // Filter & Sort Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && !task.completed) ||
          (statusFilter === 'completed' && task.completed);

        const matchesPriority =
          priorityFilter === 'all' || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'priority') {
          const weights = { high: 3, medium: 2, low: 1 };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        }
        if (sortBy === 'alpha') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('newest');
  };

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <Loader2 size={36} className="spinner large" />
        <p>Verifying JWT Authentication Session...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <Header
        isServerOnline={isServerOnline}
        isCheckingServer={isCheckingServer}
        onCheckServer={() => {
          checkHealth();
          if (isAuthenticated) loadTasks();
        }}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {!isServerOnline && (
          <div className="server-alert-banner">
            <AlertCircle size={20} />
            <div className="server-alert-text">
              <strong>Backend Server is Disconnected:</strong> Ensure your Express backend is running on{' '}
              <code>http://localhost:5000</code> with MongoDB and JWT configured.
            </div>
            <button className="btn-retry" onClick={checkHealth}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Unauthenticated View: Login / Register Card */}
        {!isAuthenticated ? (
          <div className="auth-view-wrapper">
            <AuthCard
              onAuthSuccess={(mode) =>
                showToast(
                  mode === 'login'
                    ? 'Logged in successfully with JWT token!'
                    : 'Account registered and authenticated!',
                  'success'
                )
              }
            />
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <>
            {/* Top Summary Statistics */}
            <TaskStats tasks={tasks} />

            {/* 2-Column Responsive Dashboard Grid */}
            <div className="dashboard-grid">
              {/* Left Column: Create Task Form */}
              <aside className="form-column">
                <TaskForm onAddTask={handleAddTask} isSubmitting={isSubmitting} />
              </aside>

              {/* Right Column: Search, Filters & Task List */}
              <section className="list-column">
                <TaskFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  priorityFilter={priorityFilter}
                  onPriorityFilterChange={setPriorityFilter}
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  onResetFilters={handleResetFilters}
                  totalMatching={filteredTasks.length}
                />

                {/* Task List Header */}
                <div className="task-list-header">
                  <div className="task-list-title-wrap">
                    <ListTodo size={18} />
                    <h2>Your Protected Tasks</h2>
                    <span className="task-count-badge">
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  <button
                    className="btn-refresh-list"
                    onClick={loadTasks}
                    disabled={loading}
                    title="Reload tasks from MongoDB"
                  >
                    <RefreshCw size={14} className={loading ? 'spinner' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Task List Views */}
                {loading ? (
                  <div className="loading-state-card">
                    <Loader2 className="spinner large" size={32} />
                    <p>Fetching user tasks with Bearer token...</p>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon-wrap">
                      <Inbox size={42} />
                    </div>
                    <h3>No tasks found</h3>
                    <p>
                      {tasks.length === 0
                        ? `Welcome, ${user?.name || 'User'}! You haven't added any tasks yet. Use the form on the left to create your first JWT-secured task.`
                        : 'No tasks match your current search and filter criteria.'}
                    </p>
                    {tasks.length > 0 && (
                      <button className="btn-reset-empty" onClick={handleResetFilters}>
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="tasks-container">
                    {filteredTasks.map((task) => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onEditTask={(taskToEdit) => setEditingTask(taskToEdit)}
                        onDeleteTask={handleDeleteTask}
                        isUpdating={updatingTaskId === task._id}
                        isDeleting={deletingTaskId === task._id}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
        isSaving={isSavingEdit}
      />

      {/* Footer */}
      
    </div>
  );
}
