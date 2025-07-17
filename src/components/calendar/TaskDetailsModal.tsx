import React from 'react';
import { Task, TaskType } from '../../utils/taskUtils';

export interface RelatedData {
  amount?: number;
  paymentType?: string;
  iahResult?: string | number;
}

interface TaskDetailsModalProps {
  task: (Task & { 
    relatedData?: RelatedData
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  onToggle: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onToggle,
  onDelete
}) => {
  if (!isOpen || !task) return null;

  const getTaskTypeLabel = (type: TaskType) => {
    switch (type) {
      case "DIAGNOSTIC_FOLLOWUP":
        return "Suivi diagnostic";
      case "PAYMENT_REMINDER":
        return "Rappel de paiement";
      case "CNAM_FOLLOWUP":
        return "Suivi CNAM";
      case "MANUAL":
        return "Tâche manuelle";
      default:
        return type;
    }
  };

  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case "DIAGNOSTIC_FOLLOWUP":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "PAYMENT_REMINDER":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case "CNAM_FOLLOWUP":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "MANUAL":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "Urgent";
      case "HIGH":
        return "Élevée";
      case "MEDIUM":
        return "Moyenne";
      case "LOW":
        return "Faible";
      default:
        return priority;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                {getTaskTypeIcon(task.type) as React.ReactElement}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{task.title}</h2>
                <p className="text-blue-100 text-sm">{getTaskTypeLabel(task.type)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-30 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 hover:scale-110 transition-transform duration-200 cursor-pointer"
              />
              <span className={`text-sm font-medium ${task.completed ? 'text-green-600' : 'text-slate-700'}`}>
                {task.completed ? 'Terminée' : 'En cours'}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
              Priorité {getPriorityLabel(task.priority)}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date d&apos;échéance
              </h3>
              <p className="text-blue-800 font-medium">{formatDate(task.dueDate)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Créée le
              </h3>
              <p className="text-slate-600">{formatDateTime(task.createdAt)}</p>
            </div>
          </div>

          {/* Patient Information */}
          {task.patientName && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient concerné
              </h3>
              <p className="text-green-800 font-medium">{task.patientName}</p>
            </div>
          )}

          {/* Related Data */}
          {task.relatedData && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations complémentaires
              </h3>
              <div className="space-y-2">
                {task.relatedData.amount && (
                  <div className="flex justify-between">
                    <span className="text-purple-600">Montant:</span>
                    <span className="text-purple-800 font-medium">{(task.relatedData as RelatedData).amount?.toFixed(2)} TND</span>
                  </div>
                )}
                {task.relatedData.paymentType && (
                  <div className="flex justify-between">
                    <span className="text-purple-600">Type:</span>
                    <span className="text-purple-800 font-medium">{(task.relatedData as RelatedData).paymentType}</span>
                  </div>
                )}
                {task.relatedData.iahResult && (
                  <div className="flex justify-between">
                    <span className="text-purple-600">Résultat IAH:</span>
                    <span className="text-purple-800 font-medium">{(task.relatedData as RelatedData).iahResult}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          {task.notifications.enabled && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
              </h3>
              <div className="space-y-1">
                <p className="text-yellow-800">
                  <span className="font-medium">Statut:</span> {task.notifications.enabled ? 'Activées' : 'Désactivées'}
                </p>
                {task.notifications.reminderDate && (
                  <p className="text-yellow-800">
                    <span className="font-medium">Rappel:</span> {formatDate(task.notifications.reminderDate)}
                  </p>
                )}
                {task.notifications.reminderSent && (
                  <p className="text-yellow-800">
                    <span className="font-medium">Rappel envoyé:</span> Oui
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-between items-center">
          <div className="text-sm text-slate-500">
            ID: {task.id}
          </div>
          <div className="flex space-x-3">
            {task.type === "MANUAL" && onDelete && (
              <button
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-800 transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal; 