import React from 'react';
import { Task } from '../../utils/taskUtils';
import TaskItem from './TaskItem';

interface NotificationBarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDismiss: () => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({
  tasks,
  onTaskClick,
  onToggleTask,
  onDismiss
}) => {
  const upcomingTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    const today = new Date();
    const daysBefore = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysBefore <= 3 && daysBefore >= 0 && !task.completed;
  });

  const urgentTasks = upcomingTasks.filter(task => task.priority === "URGENT" || task.priority === "HIGH");

  if (upcomingTasks.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-yellow-800 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Notifications ({upcomingTasks.length} tâches à venir)
        </h3>
        <button
          onClick={onDismiss}
          className="text-yellow-600 hover:text-yellow-800 transition-colors"
          title="Masquer les notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2">
        {urgentTasks.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Tâches prioritaires ({urgentTasks.length})
            </h4>
            <div className="space-y-1">
              {urgentTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isCompact={true}
                  onClick={() => onTaskClick(task)}
                  onToggle={() => onToggleTask(task.id)}
                  showPatient={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {upcomingTasks.filter(task => task.priority !== "URGENT" && task.priority !== "HIGH").length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Autres tâches à venir ({upcomingTasks.filter(task => task.priority !== "URGENT" && task.priority !== "HIGH").length})
            </h4>
            <div className="space-y-1">
              {upcomingTasks
                .filter(task => task.priority !== "URGENT" && task.priority !== "HIGH")
                .slice(0, 3)
                .map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isCompact={true}
                    onClick={() => onTaskClick(task)}
                    onToggle={() => onToggleTask(task.id)}
                    showPatient={true}
                  />
                ))}
              {upcomingTasks.filter(task => task.priority !== "URGENT" && task.priority !== "HIGH").length > 3 && (
                <div className="text-xs text-yellow-700 text-center py-2">
                  +{upcomingTasks.filter(task => task.priority !== "URGENT" && task.priority !== "HIGH").length - 3} autres tâches...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-yellow-200">
        <div className="flex justify-between items-center text-sm text-yellow-700">
          <span>Prochaines échéances dans les 3 prochains jours</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              Urgent ({urgentTasks.length})
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
              Normal ({upcomingTasks.length - urgentTasks.length})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar; 