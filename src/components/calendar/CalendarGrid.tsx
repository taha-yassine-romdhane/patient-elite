import React from 'react';
import { Task } from '../../utils/taskUtils';
import CalendarDay from './CalendarDay';

interface CalendarGridProps {
  currentDate: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDayClick: (date: string) => void;
  onToggleTask: (taskId: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  tasks,
  onTaskClick,
  onDayClick,
  onToggleTask
}) => {
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    // const lastDay = new Date(year, month + 1, 0);
    
    // Days from previous month to fill the grid
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    startDate.setDate(startDate.getDate() - daysBack);
    
    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 42); // 6 weeks = 42 days
    
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => task.date === dateString);
      
      days.push({
        date: new Date(d),
        dateString,
        isCurrentMonth: d.getMonth() === month,
        isToday: d.toDateString() === new Date().toDateString(),
        tasks: dayTasks
      });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <h2 className="text-3xl font-bold text-center">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        {dayNames.map(day => (
          <div key={day} className="p-4 text-center font-semibold text-slate-700 text-sm border-r border-slate-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0">
        {calendarDays.map((day) => (
          <CalendarDay
            key={day.dateString}
            date={day.date}
            dateString={day.dateString}
            isCurrentMonth={day.isCurrentMonth}
            isToday={day.isToday}
            tasks={day.tasks}
            onTaskClick={onTaskClick}
            onDayClick={onDayClick}
            onToggleTask={onToggleTask}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid; 