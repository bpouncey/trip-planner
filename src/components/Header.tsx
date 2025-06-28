import type { Trip } from '../types';
import { formatDate } from '../lib/utils';

interface HeaderProps {
  selectedTrip: Trip | null;
  onNewTrip: () => void;
}

export function Header({ selectedTrip, onNewTrip }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {selectedTrip ? (
            <>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {selectedTrip.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedTrip.destination} • {formatDate(selectedTrip.startDate)} - {formatDate(selectedTrip.endDate)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedTrip.status === 'planning' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : selectedTrip.status === 'booked'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTrip.status.charAt(0).toUpperCase() + selectedTrip.status.slice(1)}
                </span>
              </div>
            </>
          ) : (
            <h1 className="text-2xl font-semibold text-gray-900">
              Trip Planner
            </h1>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedTrip && (
            <>
              <button className="btn-secondary flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
              <button className="btn-secondary flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </>
          )}
          <button onClick={onNewTrip} className="btn-primary flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Trip
          </button>
        </div>
      </div>
    </header>
  );
} 