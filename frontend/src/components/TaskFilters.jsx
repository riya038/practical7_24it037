import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

export default function TaskFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  totalMatching,
}) {
  const isFiltered =
    searchTerm !== '' || statusFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'newest';

  return (
    <div className="filters-card">
      <div className="search-bar-wrap">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search your JWT-secured tasks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="btn-clear-search"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="filter-controls-row">
        {/* Status Filter Buttons */}
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <div className="filter-tabs">
            {['all', 'active', 'completed'].map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => onStatusFilterChange(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <span className="filter-label">Priority:</span>
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <span className="filter-label">Sort:</span>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority (High to Low)</option>
            <option value="alpha">Title (A-Z)</option>
          </select>
        </div>

        {isFiltered && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
