import React, { useState } from 'react';
import { PlusCircle, Loader2, Sparkles, Tag, AlignLeft } from 'lucide-react';

export default function TaskForm({ onAddTask, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required by server-side validation.');
      return;
    }

    setError('');
    const success = await onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false,
    });

    if (success) {
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  };

  return (
    <div className="task-form-card">
      <div className="form-header">
        <div className="form-title-wrap">
          <Sparkles className="form-icon" size={18} />
          <h2>Create New Task</h2>
        </div>
        <span className="form-hint">Scoped to your account</span>
      </div>

      <form onSubmit={handleSubmit} className="task-form">
        {error && <div className="form-error-banner">{error}</div>}

        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            placeholder="e.g., Implement input validation middleware..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            disabled={isSubmitting}
            maxLength={120}
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-desc" className="form-label">
            <AlignLeft size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Description (Optional)
          </label>
          <textarea
            id="task-desc"
            className="form-textarea"
            placeholder="Add detailed task notes or sub-tasks..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row-priority">
          <label className="form-label">
            <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Priority Level
          </label>
          <div className="priority-chips">
            {['low', 'medium', 'high'].map((lvl) => (
              <button
                type="button"
                key={lvl}
                className={`priority-chip ${lvl} ${priority === lvl ? 'selected' : ''}`}
                onClick={() => setPriority(lvl)}
                disabled={isSubmitting}
              >
                <span className="dot"></span>
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn-submit-task"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="spinner" size={18} />
              <span>Saving with JWT Auth...</span>
            </>
          ) : (
            <>
              <PlusCircle size={18} />
              <span>Add Task</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
