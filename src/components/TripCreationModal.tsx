import { useState, useEffect } from 'react'
import type { CreateTripForm } from '../types'

interface TripCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (tripData: CreateTripForm) => void
  initialData?: CreateTripForm
  mode?: 'create' | 'edit'
}

export function TripCreationModal({ isOpen, onClose, onSubmit, initialData, mode = 'create' }: TripCreationModalProps) {
  const [formData, setFormData] = useState<CreateTripForm>({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1 as number,
    notes: undefined
  } as CreateTripForm)
  
  const [errors, setErrors] = useState<{ [K in keyof CreateTripForm]?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData)
    } else if (isOpen && !initialData) {
      setFormData({
        name: '',
        destination: '',
        startDate: '',
        endDate: '',
        travelers: 1 as number,
        notes: undefined
      })
    }
  }, [isOpen, initialData])

  const validateForm = (): boolean => {
    const newErrors: { [K in keyof CreateTripForm]?: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required'
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (formData.travelers < 1) {
      newErrors.travelers = 'Must have at least 1 traveler'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    console.log('Form validation passed, calling onSubmit')
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      console.log('onSubmit completed successfully')
      handleClose()
    } catch (error) {
      console.error('Error creating trip:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      travelers: 1 as number,
      notes: undefined
    })
    setErrors({})
    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{mode === 'edit' ? 'Edit Trip' : 'Create New Trip'}</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trip Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Trip Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
              }}
              className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., Summer Vacation 2024"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Destination */}
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
              Destination *
            </label>
            <input
              type="text"
              id="destination"
              value={formData.destination}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, destination: e.target.value }))
                if (errors.destination) setErrors(prev => ({ ...prev, destination: undefined }))
              }}
              className={`input-field ${errors.destination ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., Tokyo, Japan"
              disabled={isSubmitting}
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, startDate: e.target.value }))
                  if (errors.startDate) setErrors(prev => ({ ...prev, startDate: undefined }))
                }}
                className={`input-field ${errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, endDate: e.target.value }))
                  if (errors.endDate) setErrors(prev => ({ ...prev, endDate: undefined }))
                }}
                className={`input-field ${errors.endDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Number of Travelers */}
          <div>
            <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Travelers *
            </label>
            <input
              type="number"
              id="travelers"
              min="1"
              max="20"
              value={formData.travelers}
              onChange={e => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, travelers: value === '' ? 1 : Number(value) }));
                if (errors.travelers) setErrors(prev => ({ ...prev, travelers: undefined }));
              }}
              className={`input-field ${errors.travelers ? 'border-red-500 focus:ring-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.travelers && (
              <p className="mt-1 text-sm text-red-600">{errors.travelers}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, notes: e.target.value }))
                if (errors.notes) setErrors(prev => ({ ...prev, notes: undefined }))
              }}
              className="input-field resize-none h-24"
              placeholder="Any additional notes about this trip..."
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'edit' ? 'Saving...' : 'Creating...'}
                </div>
              ) : (
                mode === 'edit' ? 'Save Changes' : 'Create Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 