import React from 'react';
import { TaskType } from '../../utils/taskUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  filter: "ALL" | TaskType;
  onFilterChange: (filter: "ALL" | TaskType) => void;
  onAddTask: () => void;
  onToggleView: () => void;
  isCalendarView: boolean;
  onBack: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  filter,
  onFilterChange,
  onAddTask,
  onToggleView,
  isCalendarView,
  onBack
}) => {
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const filterOptions = [
    { value: "ALL", label: "Toutes les tâches" },
    { value: "DIAGNOSTIC_FOLLOWUP", label: "Suivi diagnostic" },
    { value: "PAYMENT_REMINDER", label: "Rappel paiement" },
    { value: "CNAM_FOLLOWUP", label: "Suivi CNAM" },
    { value: "MANUAL", label: "Tâches manuelles" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Main Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {isCalendarView ? 'Calendrier des Tâches' : 'Liste des Tâches'}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={onAddTask}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isCalendarView ? 'Nouvelle tâche' : 'Ajouter une tâche'}
          </button>
          <button
            onClick={onToggleView}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
          >
            {isCalendarView ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Liste
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendrier
              </>
            )}
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au tableau de bord
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      {isCalendarView && (
        <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={onPrevMonth}
              className="p-3 hover:bg-white rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-800 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-slate-800 min-w-64 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={onNextMonth}
              className="p-3 hover:bg-white rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-800 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Aujourd&apos;hui
            </button>
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as "ALL" | TaskType)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filter Bar for List View */}
      {!isCalendarView && (
        <div className="flex flex-wrap gap-3 bg-slate-50 p-4 rounded-lg">
          {filterOptions.map(filterOption => (
            <button
              key={filterOption.value}
              onClick={() => onFilterChange(filterOption.value as "ALL" | TaskType)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md ${
                filter === filterOption.value
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarHeader; 