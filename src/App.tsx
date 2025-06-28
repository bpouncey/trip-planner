import { useState, useEffect } from 'react'
import { TripList } from './components/TripList'
import { TripView } from './components/TripView'
import { Header } from './components/Header'
import { TripCreationModal } from './components/TripCreationModal'
import { createTrip, getTrips } from './lib/tripService'
import type { Trip, CreateTripForm } from './types'

function App() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load trips from Firebase on component mount
  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedTrips = await getTrips()
      setTrips(fetchedTrips)
      
      // If no trip is selected and we have trips, select the first one
      if (!selectedTrip && fetchedTrips.length > 0) {
        setSelectedTrip(fetchedTrips[0])
      }
    } catch (err) {
      console.error('Error loading trips:', err)
      setError('Failed to load trips. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTrip = async (tripData: CreateTripForm) => {
    try {
      const newTrip = await createTrip(tripData)
      setTrips(prevTrips => [newTrip, ...prevTrips])
      setSelectedTrip(newTrip)
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Error creating trip:', err)
      // You could show an error toast here
      throw err // Re-throw to let the modal handle the error
    }
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
          trips={trips}
          selectedTrip={selectedTrip}
          onSelectTrip={setSelectedTrip}
          sidebarOpen={sidebarOpen}
          onNewTrip={() => setIsCreateModalOpen(true)}
          isLoading={isLoading}
          error={error}
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
                  {isLoading 
                    ? 'Loading your trips...' 
                    : trips.length === 0 
                      ? 'Create your first trip to get started'
                      : 'Select a trip from the sidebar to view details'
                  }
                </p>
                {!isLoading && trips.length === 0 && (
                  <button 
                    className="btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create New Trip
                  </button>
                )}
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
