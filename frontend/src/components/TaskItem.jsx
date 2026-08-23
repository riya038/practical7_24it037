import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Pencil,
  Trash2,
  Loader2,
  Lock,
} from 'lucide-react';

export default function TaskItem({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  isUpdating,
  isDeleting,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const priorityLabels = {
    low: { label: 'Low', class: 'priority-low' },
    medium: { label: 'Medium', class: 'priority-med' },
    high: { label: 'High', class: 'priority-high' },
  };

  const currentPriority = priorityLabels[task.priority] || priorityLabels.medium;

  return (
    <div className={`task-card ${task.completed ? 'task-completed' : ''}`}>
      <div className="task-card-left">
        {/* Toggle Complete Checkbox */}
        <button
          type="button"
          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={() => onToggleComplete(task._id, !task.completed)}
          disabled={isUpdating}
          title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
          aria-label="Toggle completion status"
        >
          {isUpdating ? (
            <Loader2 className="spinner-subtle" size={14} />
          ) : (
            task.completed && <Check size={14} strokeWidth={3} />
          )}
        </button>
      </div>

      <div className="task-card-body">
        <div className="task-header-row">
          <h3 className={`task-title ${task.completed ? 'completed-text' : ''}`}>
            {task.title}
          </h3>
          <span className={`priority-badge ${currentPriority.class}`}>
            <span className="badge-dot"></span>
            {currentPriority.label}
          </span>
        </div>

        {task.description && (
          <p className={`task-description ${task.completed ? 'completed-desc' : ''}`}>
            {task.description}
          </p>
        )}

        <div className="task-meta-row">
          <div className="task-date">
            <Calendar size={13} />
            <span>{formatDate(task.createdAt)}</span>
          </div>

          <div className="task-status-tag">
            {task.completed ? (
              <span className="status-completed-pill">Done</span>
            ) : (
              <span className="status-pending-pill">Pending</span>
            )}
          </div>

          <div className="task-secured-tag">
            <Lock size={11} />
            <span>User Scoped</span>
          </div>
        </div>
      </div>

      <div className="task-card-actions">
        {confirmDelete ? (
          <div className="delete-confirm-box">
            <span className="confirm-text">Delete?</span>
            <button
              type="button"
              className="btn-confirm-yes"
              onClick={() => onDeleteTask(task._id)}
              disabled={isDeleting}
              title="Yes, delete"
            >
              {isDeleting ? <Loader2 size={12} className="spinner" /> : 'Yes'}
            </button>
            <button
              type="button"
              className="btn-confirm-no"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
              title="Cancel"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="btn-action-icon edit"
              onClick={() => onEditTask(task)}
              title="Edit task"
              aria-label="Edit task"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              className="btn-action-icon delete"
              onClick={() => setConfirmDelete(true)}
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
