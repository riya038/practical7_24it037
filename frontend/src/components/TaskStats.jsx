import React from 'react';
import { CheckCircle2, Clock, Flame, ListTodo } from 'lucide-react';

export default function TaskStats({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => t.priority === 'high' && !t.completed).length;
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrap total">
          <ListTodo size={20} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Your Tasks</span>
          <span className="stat-value">{total}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap pending">
          <Clock size={20} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{pending}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap completed">
          <CheckCircle2 size={20} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{completed}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap high">
          <Flame size={20} />
        </div>
        <div className="stat-info">
          <span className="stat-label">High Priority</span>
          <span className="stat-value">{highPriority}</span>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="stat-card progress-card">
        <div className="progress-header">
          <span className="progress-title">Your Progress</span>
          <span className="progress-percent">{completionPercentage}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
