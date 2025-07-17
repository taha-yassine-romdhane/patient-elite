import React from 'react';
import { Task } from '../../utils/taskUtils';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onToggleTask,
  onDeleteTask
}) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion status first (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by priority
    const priorityOrder = { "URGENT": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by date
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-500">Commencez par ajouter une nouvelle tâche ou ajustez vos filtres.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Liste des tâches ({tasks.filter(t => !t.completed).length} actives)
        </h2>
        <div className="flex gap-2 text-sm text-gray-600">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1"></div>
            Urgent
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-1"></div>
            Élevée
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-1"></div>
            Moyenne
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></div>
            Faible
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedTasks.map(task => (
          <div key={task.id} className="relative">
            <TaskItem
              task={task}
              onClick={() => onTaskClick(task)}
              onToggle={() => onToggleTask(task.id)}
              showPatient={true}
            />
            
            {/* Delete button for manual tasks */}
            {task.type === "MANUAL" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors"
                title="Supprimer cette tâche"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.length}
            </div>
            <div className="text-sm text-blue-800">Total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.completed).length}
            </div>
            <div className="text-sm text-green-800">Terminées</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(t => !t.completed).length}
            </div>
            <div className="text-sm text-yellow-800">En cours</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => !t.completed && (t.priority === "URGENT" || t.priority === "HIGH")).length}
            </div>
            <div className="text-sm text-red-800">Prioritaires</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList; 