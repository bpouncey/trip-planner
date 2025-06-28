import { useState } from 'react'
import { TripList } from './components/TripList'
import { TripView } from './components/TripView'
import { Header } from './components/Header'
import { TripCreationModal } from './components/TripCreationModal'
import type { Trip, CreateTripForm } from './types'

function App() {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreateTrip = async (tripData: CreateTripForm) => {
    // TODO: Add Firebase integration here
    console.log('Creating trip:', tripData)
    
    // For now, create a mock trip
    const newTrip: Trip = {
      id: Date.now().toString(),
      ...tripData,
      status: 'planning',
      viewMode: 'timeline',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // TODO: Save to Firebase and update state
    console.log('Created trip:', newTrip)
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-semibold text-gray-900">Trip Planner</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <TripList 
          selectedTrip={selectedTrip}
          onSelectTrip={setSelectedTrip}
          sidebarOpen={sidebarOpen}
          onNewTrip={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header 
          selectedTrip={selectedTrip}
          onNewTrip={() => setIsCreateModalOpen(true)}
        />
        
        <main className="flex-1 overflow-auto">
          {selectedTrip ? (
            <TripView trip={selectedTrip} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to Trip Planner
                </h2>
                <p className="text-gray-600 mb-6">
                  Select a trip from the sidebar or create a new one to get started
                </p>
                <button 
                  className="btn-primary"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create New Trip
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Trip Creation Modal */}
      <TripCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
    </div>
  )
}

export default App
