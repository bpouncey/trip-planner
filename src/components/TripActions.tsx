import type { Trip } from '../types';

interface TripActionsProps {
  trip: Trip;
  onDeleteTrip: (tripId: string) => void;
  onEditTrip: () => void;
}

// Mock data for actions/tasks
const mockTasks = [
  {
    id: '1',
    title: 'Book flights',
    description: 'Research and book flights to Tokyo',
    status: 'completed' as const,
    priority: 'high' as const,
    dueDate: '2024-02-15',
  },
  {
    id: '2',
    title: 'Book hotel',
    description: 'Reserve hotel in Tokyo',
    status: 'completed' as const,
    priority: 'high' as const,
    dueDate: '2024-02-20',
  },
  {
    id: '3',
    title: 'Get travel insurance',
    description: 'Purchase travel insurance for the trip',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: '2024-03-01',
  },
  {
    id: '4',
    title: 'Book activities',
    description: 'Reserve tours and activities',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: '2024-03-15',
  },
  {
    id: '5',
    title: 'Apply for visa',
    description: 'Check if visa is required and apply',
    status: 'pending' as const,
    priority: 'high' as const,
    dueDate: '2024-02-01',
  },
];

export function TripActions({ trip, onDeleteTrip, onEditTrip }: TripActionsProps) {
  const completedTasks = mockTasks.filter(task => task.status === 'completed');
  const pendingTasks = mockTasks.filter(task => task.status === 'pending');
  const highPriorityTasks = mockTasks.filter(task => task.priority === 'high' && task.status === 'pending');

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              Trip Actions
            </h2>
            <p className="text-gray-600">
              Manage tasks, reminders, and quick actions for your trip
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <button
              className="btn px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              onClick={onEditTrip}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4 1 1-4 13.362-13.362z" />
              </svg>
              Edit
            </button>
            <button
              className="btn px-3 py-1.5 rounded-lg border border-red-500 text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2 text-sm"
              onClick={() => onDeleteTrip(trip.id)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete Trip
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full btn-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Activity
              </button>
              
              <button className="w-full btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Add Flight
              </button>
              
              <button className="w-full btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Add Hotel
              </button>
              
              <button className="w-full btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Add Task
              </button>
            </div>
          </div>

          {/* High Priority Tasks */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">High Priority Tasks</h3>
            
            {highPriorityTasks.length > 0 ? (
              <div className="space-y-3">
                {highPriorityTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900">{task.title}</h4>
                      <p className="text-sm text-red-700">{task.description}</p>
                      <p className="text-xs text-red-600 mt-1">Due: {task.dueDate}</p>
                    </div>
                    <button className="ml-3 text-red-600 hover:text-red-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">✅</div>
                <p>No high priority tasks</p>
              </div>
            )}
          </div>

          {/* All Tasks */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
              <div className="flex space-x-2">
                <span className="text-sm text-gray-600">
                  {completedTasks.length} completed
                </span>
                <span className="text-sm text-gray-600">
                  {pendingTasks.length} pending
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {mockTasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  task.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <button className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}>
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        task.status === 'completed' ? 'text-green-900 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h4>
                      <p className={`text-sm ${
                        task.status === 'completed' ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-500">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Current Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  trip.status === 'planning' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : trip.status === 'booked'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Days Until Trip</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Planning Progress</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round((completedTasks.length / mockTasks.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Reminders */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminders</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-blue-600">🔔</span>
                  <span className="text-sm font-medium text-blue-900">Visa Application</span>
                </div>
                <p className="text-sm text-blue-700">Apply for visa at least 30 days before departure</p>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-yellow-600">📅</span>
                  <span className="text-sm font-medium text-yellow-900">Check-in Reminder</span>
                </div>
                <p className="text-sm text-yellow-700">Online check-in opens 24 hours before flight</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 