import { useState, useEffect } from 'react'
import type { CreateActivityForm, Activity, ActivityCategory } from '../types'

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (activityData: CreateActivityForm) => void
  initialData?: CreateActivityForm
  mode?: 'create' | 'edit'
  tripStartDate?: string
  tripEndDate?: string
}

const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: 'tour', label: 'Tour' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'museum', label: 'Museum' },
  { value: 'rest', label: 'Rest & Relaxation' },
  { value: 'explore', label: 'Explore' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
]

export function ActivityModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode = 'create',
  tripStartDate,
  tripEndDate 
}: ActivityModalProps) {
  console.log('ActivityModal rendered. isOpen:', isOpen, 'initialData:', initialData, 'mode:', mode);
  const [formData, setFormData] = useState<CreateActivityForm>({
    title: '',
    bookingUrl: '',
    description: '',
    category: 'explore',
    costPerPerson: 0,
    groupSize: undefined,
    date: tripStartDate || '',
    time: '',
    duration: undefined,
    location: '',
    notes: ''
  })
  
  const [errors, setErrors] = useState<{ [K in keyof CreateActivityForm]?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData)
    } else if (isOpen && !initialData) {
      setFormData({
        title: '',
        bookingUrl: '',
        description: '',
        category: 'explore',
        costPerPerson: 0,
        groupSize: undefined,
        date: tripStartDate || '',
        time: '',
        duration: undefined,
        location: '',
        notes: ''
      })
    }
  }, [isOpen, initialData, tripStartDate])

  const validateForm = (): boolean => {
    const newErrors: { [K in keyof CreateActivityForm]?: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Activity title is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (tripStartDate && tripEndDate && formData.date) {
      if (formData.date < tripStartDate || formData.date > tripEndDate) {
        newErrors.date = 'Date must be within trip dates'
      }
    }

    if (formData.costPerPerson < 0) {
      newErrors.costPerPerson = 'Cost cannot be negative'
    }

    if (formData.duration && formData.duration < 0) {
      newErrors.duration = 'Duration cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('ActivityModal handleSubmit called with:', formData);
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      handleClose()
    } catch (error) {
      console.error('Error creating activity:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      bookingUrl: '',
      description: '',
      category: 'explore',
      costPerPerson: 0,
      groupSize: undefined,
      date: tripStartDate || '',
      time: '',
      duration: undefined,
      location: '',
      notes: ''
    })
    setErrors({})
    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-0 relative max-h-[90vh] flex flex-col justify-center">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{mode === 'edit' ? 'Edit Activity' : 'Add Activity'}</h2>
          <button className="text-2xl text-gray-400 hover:text-gray-700 focus:outline-none" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        {/* Modal Body */}
        <div className="px-6 py-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Activity Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Activity Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                  if (errors.title) setErrors(prev => ({ ...prev, title: undefined }))
                }}
                className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., Visit Tokyo Tower"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, category: e.target.value as ActivityCategory }))
                }}
                className="input-field"
                disabled={isSubmitting}
              >
                {ACTIVITY_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, date: e.target.value }))
                    if (errors.date) setErrors(prev => ({ ...prev, date: undefined }))
                  }}
                  min={tripStartDate}
                  max={tripEndDate}
                  className={`input-field ${errors.date ? 'border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time (Optional)
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, time: e.target.value }))
                  }}
                  className="input-field"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Duration and Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  min="0"
                  value={formData.duration || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      duration: value === '' ? undefined : Number(value) 
                    }))
                    if (errors.duration) setErrors(prev => ({ ...prev, duration: undefined }))
                  }}
                  className={`input-field ${errors.duration ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="120"
                  disabled={isSubmitting}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
              </div>

              <div>
                <label htmlFor="costPerPerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Cost per Person
                </label>
                <input
                  type="number"
                  id="costPerPerson"
                  min="0"
                  step="0.01"
                  value={formData.costPerPerson}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, costPerPerson: Number(e.target.value) }))
                    if (errors.costPerPerson) setErrors(prev => ({ ...prev, costPerPerson: undefined }))
                  }}
                  className={`input-field ${errors.costPerPerson ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
                {errors.costPerPerson && (
                  <p className="mt-1 text-sm text-red-600">{errors.costPerPerson}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, location: e.target.value }))
                }}
                className="input-field"
                placeholder="e.g., Tokyo Tower, Minato City"
                disabled={isSubmitting}
              />
            </div>

            {/* Booking URL */}
            <div>
              <label htmlFor="bookingUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Booking URL (Optional)
              </label>
              <input
                type="url"
                id="bookingUrl"
                value={formData.bookingUrl}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, bookingUrl: e.target.value }))
                }}
                className="input-field"
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }}
                className="input-field resize-none h-20"
                placeholder="Brief description of the activity..."
                disabled={isSubmitting}
              />
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
                }}
                className="input-field resize-none h-20"
                placeholder="Any additional notes..."
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
                  mode === 'edit' ? 'Save Changes' : 'Add Activity'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 