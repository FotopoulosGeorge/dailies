import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, Check } from 'lucide-react';

// Utility functions for date handling
const formatDate = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[date.getDay()];
  return `${day} ${date.getDate()}/${date.getMonth() + 1}`;
};

const getDateKey = (date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

// Task component
const Task = ({ task, onToggle, onDelete }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
    <button
      onClick={() => onToggle(task.id)}
      className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${
        task.completed 
          ? 'bg-green-500 border-green-500' 
          : 'border-gray-400 hover:border-gray-600'
      }`}
    >
      {task.completed && <Check size={16} className="text-white" />}
    </button>
    <span className={`flex-1 break-words ${task.completed ? 'line-through text-gray-500' : ''}`}>
      {task.text}
    </span>
    <button
      onClick={() => onDelete(task.id)}
      className="text-red-500 hover:text-red-700 transition-colors"
    >
      <X size={20} />
    </button>
  </div>
);

// Month view component
const MonthView = ({ currentDate, onSelectDate, onClose }) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };
  
  const handleMonthChange = (direction) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + direction);
    setViewDate(newDate);
  };
  
  const handleDayClick = (day) => {
    if (day) {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      onSelectDate(newDate);
      onClose();
    }
  };
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-bold text-lg">
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h3>
          <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-sm font-semibold text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(viewDate).map((day, i) => (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className={`p-2 text-center rounded hover:bg-blue-100 transition-colors ${
                day ? 'cursor-pointer' : ''
              } ${
                day === currentDate.getDate() && 
                viewDate.getMonth() === currentDate.getMonth() && 
                viewDate.getFullYear() === currentDate.getFullYear()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : ''
              }`}
              disabled={!day}
            >
              {day || ''}
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main App component
const DailyTaskApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [showMonthView, setShowMonthView] = useState(false);
  
  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  const dateKey = getDateKey(currentDate);
  const currentTasks = tasks[dateKey] || [];
  
  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };
  
  const addTask = () => {
    if (inputValue.trim()) {
      const newTask = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      };
      
      setTasks(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newTask]
      }));
      setInputValue('');
    }
  };
  
  const toggleTask = (taskId) => {
    setTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };
  
  const deleteTask = (taskId) => {
    setTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(task => task.id !== taskId)
    }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-gray-800" 
             style={{ minHeight: '600px', position: 'relative' }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{formatDate(currentDate)}</h2>
              <button
                onClick={() => setShowMonthView(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Calendar size={20} />
              </button>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                Today
              </button>
            </div>
            
            <button 
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Task Input */}
          <div className="mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTask();
                }
              }}
              placeholder="Add a new task..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          {/* Task List */}
          <div className="space-y-3">
            {currentTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No tasks for this day</p>
            ) : (
              currentTasks.map(task => (
                <Task
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Month View Modal */}
      {showMonthView && (
        <MonthView
          currentDate={currentDate}
          onSelectDate={setCurrentDate}
          onClose={() => setShowMonthView(false)}
        />
      )}
    </div>
  );
};

export default DailyTaskApp;