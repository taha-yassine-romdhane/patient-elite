import React from 'react';
import { Task, TaskType } from '../../utils/taskUtils';

interface TaskItemProps {
  task: Task;
  isCompact?: boolean;
  onClick?: () => void;
  onToggle?: () => void;
  showPatient?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isCompact = false,
  onClick,
  onToggle,
  showPatient = false
}) => {
  const getTaskColor = (task: Task) => {
    if (task.completed) return "bg-gray-100 text-gray-600 border-gray-200";
    
    switch (task.priority) {
      case "URGENT": return "bg-red-100 text-red-800 border-red-300";
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LOW": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getTypeIcon = (type: TaskType) => {
    const iconClass = isCompact ? "w-3 h-3" : "w-4 h-4";
    
    switch (type) {
      case "DIAGNOSTIC_FOLLOWUP":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "PAYMENT_REMINDER":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case "CNAM_FOLLOWUP":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "MANUAL":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "URGENT": return "Urgent";
      case "HIGH": return "Élevée";
      case "MEDIUM": return "Moyenne";
      case "LOW": return "Faible";
      default: return priority;
    }
  };

  if (isCompact) {
    return (
      <div
        className={`
          border rounded px-2 py-1 cursor-pointer transition-all hover:shadow-sm
          ${getTaskColor(task)}
          ${task.completed ? "opacity-60" : ""}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            {getTypeIcon(task.type)}
            <span className={`ml-1 text-xs font-medium truncate ${task.completed ? "line-through" : ""}`}>
              {task.title}
            </span>
          </div>
          {onToggle && (
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="ml-1 h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
            />
          )}
        </div>
        {showPatient && task.patientName && (
          <div className="text-xs text-gray-600 mt-1 truncate">
            {task.patientName}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
        ${getTaskColor(task)}
        ${task.completed ? "opacity-60" : ""}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0">
          {onToggle && (
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
          )}
          <div className="flex items-center min-w-0">
            {getTypeIcon(task.type)}
            <h3 className={`ml-2 font-medium ${task.completed ? "line-through" : ""}`}>
              {task.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTaskColor(task)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          <span className="text-sm text-gray-600">
            {new Date(task.date).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="mt-2 text-sm text-gray-600">{task.description}</p>
      )}
      
      {showPatient && task.patientName && (
        <p className="mt-1 text-sm text-blue-600 font-medium">
          Patient: {task.patientName}
        </p>
      )}
    </div>
  );
};

export default TaskItem; 