import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Edit3 } from 'lucide-react';

export default function EditTaskModal({ task, isOpen, onClose, onSave, isSaving }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setCompleted(task.completed || false);
      setError('');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const success = await onSave(task._id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      completed,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Edit3 size={18} className="modal-icon" />
            <h3>Edit Task</h3>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-group">
            <label htmlFor="edit-title" className="form-label">
              Title <span className="required-star">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              disabled={isSaving}
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-desc" className="form-label">
              Description
            </label>
            <textarea
              id="edit-desc"
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="form-row-priority">
            <label className="form-label">Priority</label>
            <div className="priority-chips">
              {['low', 'medium', 'high'].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  className={`priority-chip ${lvl} ${priority === lvl ? 'selected' : ''}`}
                  onClick={() => setPriority(lvl)}
                  disabled={isSaving}
                >
                  <span className="dot"></span>
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                disabled={isSaving}
              />
              <span className="checkbox-text">Mark as Completed</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-save"
              disabled={isSaving || !title.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="spinner" size={16} />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
