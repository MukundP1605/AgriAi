import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const CropReminderScheduler = ({ sessionId }) => {
  const { getToken } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedulingReminders, setSchedulingReminders] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    fetchReminders();
  }, [sessionId]);
  
  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      
      // Attempt to fetch existing reminders
      const response = await axios.get(
        `http://127.0.0.1:8000/api/crop-management/reminders/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        setReminders(response.data);
      }
    } catch (err) {
      // If error is 404, it likely means reminders haven't been scheduled yet
      if (err.response?.status === 404) {
        setReminders([]);
      } else {
        console.error('Error fetching reminders:', err);
        setError(err.response?.data?.detail || 'Failed to fetch reminders. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const scheduleReminders = async () => {
    try {
      setSchedulingReminders(true);
      setError(null);
      
      const token = getToken();
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/crop-management/reminders/${sessionId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        setReminders(response.data);
      }
    } catch (err) {
      console.error('Error scheduling reminders:', err);
      setError(err.response?.data?.detail || 'Failed to schedule reminders. Please try again.');
    } finally {
      setSchedulingReminders(false);
    }
  };
  
  const updateReminderStatus = async (reminderId, status) => {
    try {
      const token = getToken();
      
      // In a real app, you would have an API endpoint to update the reminder status
      // For now, we'll just update the UI
      setReminders(prevReminders => 
        prevReminders.map(reminder => 
          reminder.id === reminderId ? { ...reminder, status } : reminder
        )
      );
    } catch (err) {
      console.error('Error updating reminder status:', err);
    }
  };
  
  // Get calendar days for selected month
  const getCalendarDays = () => {
    const date = new Date(selectedYear, selectedMonth, 1);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    const firstDayOfMonth = date.getDay();
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(selectedYear, selectedMonth, i));
    }
    
    return days;
  };
  
  // Filter reminders for a specific date
  const getRemindersForDate = (date) => {
    if (!date) return [];
    
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.due_date);
      return (
        reminderDate.getDate() === date.getDate() &&
        reminderDate.getMonth() === date.getMonth() &&
        reminderDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  // Navigate to next month
  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  // Group reminders by month for list view
  const remindersByMonth = reminders.reduce((acc, reminder) => {
    const date = new Date(reminder.due_date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(reminder);
    return acc;
  }, {});
  
  // Sort months chronologically
  const sortedMonths = Object.keys(remindersByMonth).sort();
  
  // Month names for calendar
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Task Reminders</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {reminders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Reminders Scheduled</h3>
          <p className="text-gray-600 mb-6">
            Schedule reminders for important tasks like watering, fertilizing, and pest control.
          </p>
          <button
            onClick={scheduleReminders}
            disabled={schedulingReminders}
            className={`px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors ${
              schedulingReminders ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {schedulingReminders ? 'Scheduling Reminders...' : 'Auto-Schedule Reminders'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Calendar View */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Calendar View</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-gray-700 font-medium">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                <div className="py-2 text-center text-sm font-medium text-gray-700">Sun</div>
                <div className="py-2 text-center text-sm font-medium text-gray-700">Mon</div>
                <div className="py-2 text-center text-sm font-medium text-gray-700">Tue</div>
                <div className="py-2 text-center text-sm font-medium text-gray-700">Wed</div>
                <div className="py-2 text-center text-sm font-medium text-gray-700">Thu</div>
                <div className="py-2 text-center text-sm font-medium text-gray-700">Fri</div>
                <div className="py-2 text-center text-sm font-medium text-gray-700">Sat</div>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {getCalendarDays().map((day, index) => {
                  const dayReminders = day ? getRemindersForDate(day) : [];
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[100px] p-2 border-t border-r ${
                        index % 7 === 0 ? 'border-l' : ''
                      } ${
                        isToday ? 'bg-emerald-50' : 'bg-white'
                      }`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium ${
                            isToday ? 'text-emerald-700' : 'text-gray-700'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="mt-1 space-y-1">
                            {dayReminders.slice(0, 3).map(reminder => (
                              <div 
                                key={reminder.id}
                                className={`text-xs p-1 rounded ${
                                  reminder.status === 'completed' ? 'bg-gray-100 text-gray-500 line-through' :
                                  reminder.status === 'dismissed' ? 'bg-gray-100 text-gray-500' :
                                  reminder.type === 'fertilizer' ? 'bg-emerald-100 text-emerald-800' :
                                  reminder.type === 'irrigation' ? 'bg-blue-100 text-blue-800' :
                                  reminder.type === 'pest' ? 'bg-red-100 text-red-800' :
                                  reminder.type === 'harvest' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {reminder.title}
                              </div>
                            ))}
                            {dayReminders.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{dayReminders.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* List View */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">All Reminders</h3>
            
            <div className="space-y-6">
              {sortedMonths.map(monthKey => {
                const [year, month] = monthKey.split('-').map(Number);
                
                return (
                  <div key={monthKey}>
                    <h4 className="text-md font-medium text-gray-700 mb-2">
                      {monthNames[month - 1]} {year}
                    </h4>
                    
                    <div className="divide-y border rounded-lg overflow-hidden">
                      {remindersByMonth[monthKey]
                        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                        .map(reminder => (
                          <div key={reminder.id} className="flex items-center p-4 bg-white">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              reminder.type === 'fertilizer' ? 'bg-emerald-100 text-emerald-600' :
                              reminder.type === 'irrigation' ? 'bg-blue-100 text-blue-600' :
                              reminder.type === 'pest' ? 'bg-red-100 text-red-600' :
                              reminder.type === 'harvest' ? 'bg-yellow-100 text-yellow-600' :
                              reminder.type === 'preparation' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {reminder.type === 'fertilizer' ? '🌱' :
                               reminder.type === 'irrigation' ? '💧' :
                               reminder.type === 'pest' ? '🐛' :
                               reminder.type === 'harvest' ? '🌾' :
                               reminder.type === 'preparation' ? '🛠️' :
                               '📝'}
                            </div>
                            
                            <div className="ml-4 flex-grow">
                              <div className={`font-medium ${
                                reminder.status === 'completed' ? 'text-gray-500 line-through' :
                                reminder.status === 'dismissed' ? 'text-gray-500' :
                                'text-gray-800'
                              }`}>
                                {reminder.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                Due: {new Date(reminder.due_date).toLocaleDateString()}
                              </div>
                              {reminder.description && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {reminder.description}
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-4 flex-shrink-0">
                              {reminder.status === 'pending' ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => updateReminderStatus(reminder.id, 'completed')}
                                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md text-sm hover:bg-emerald-200"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => updateReminderStatus(reminder.id, 'dismissed')}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              ) : (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  reminder.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end mt-6">
            <button
              onClick={scheduleReminders}
              disabled={schedulingReminders}
              className={`px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors ${
                schedulingReminders ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {schedulingReminders ? 'Rescheduling...' : 'Regenerate Reminders'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropReminderScheduler;
