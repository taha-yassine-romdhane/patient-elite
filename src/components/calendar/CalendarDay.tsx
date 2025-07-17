import React from 'react';
import { Task } from '../../utils/taskUtils';
import TaskItem from './TaskItem';

interface CalendarDayProps {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDayClick: (date: string) => void;
  onToggleTask: (taskId: string) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  dateString,
  isCurrentMonth,
  isToday,
  tasks,
  onTaskClick,
  onDayClick,
  onToggleTask
}) => {
  const dayNumber = date.getDate();
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const handleDayClick = (e: React.MouseEvent) => {
    // Only trigger add task if clicking on empty space (not on tasks)
    if (e.target === e.currentTarget) {
      onDayClick(dateString);
    }
  };

  return (
    <div
      className={`
        min-h-36 p-3 border-r border-b border-slate-200 hover:bg-slate-50 transition-all duration-200 relative cursor-pointer
        ${!isCurrentMonth ? 'bg-slate-100 text-slate-400' : 'bg-white'}
        ${isToday ? 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-300 shadow-md' : ''}
      `}
      onClick={handleDayClick}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`
            text-sm font-semibold
            ${isToday ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm' : ''}
            ${!isCurrentMonth ? 'text-slate-400' : 'text-slate-900'}
          `}
        >
          {dayNumber}
        </span>
        <div className="flex items-center space-x-1">
          {tasks.length > 0 && (
            <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 py-0.5 rounded-full font-medium shadow-sm">
              {incompleteTasks.length}
            </span>
          )}
          {isCurrentMonth && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDayClick(dateString);
              }}
              className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 opacity-70 hover:opacity-100 shadow-sm hover:shadow-md"
              title="Ajouter une tâche"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
        {incompleteTasks.slice(0, 3).map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isCompact={true}
            onClick={() => onTaskClick(task)}
            onToggle={() => onToggleTask(task.id)}
          />
        ))}
        
        {incompleteTasks.length > 3 && (
          <div className="text-xs text-slate-500 text-center py-1 bg-slate-50 rounded-md">
            +{incompleteTasks.length - 3} autres
          </div>
        )}
        
        {completedTasks.length > 0 && (
          <div className="text-xs text-slate-400 text-center py-1 bg-green-50 text-green-700 rounded-md">
            ✓ {completedTasks.length} terminée{completedTasks.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay; 