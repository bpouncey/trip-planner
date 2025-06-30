import React, { useState, useEffect } from 'react';
import type { Hotel, CreateHotelForm, PaymentMethod } from '../types';

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hotelData: CreateHotelForm) => void;
  hotel?: Hotel; // For editing mode
  tripId: string;
}

const defaultForm: CreateHotelForm = {
  name: '',
  address: '',
  bookingSite: '',
  checkInDate: '',
  checkOutDate: '',
  roomType: '',
  pricePerNight: 0,
  totalCost: 0,
  paymentMethod: 'cash',
  confirmationNumber: '',
  notes: '',
};

export default function HotelModal({ isOpen, onClose, onSubmit, hotel, tripId }: HotelModalProps) {
  const [formData, setFormData] = useState<CreateHotelForm>(defaultForm);

  useEffect(() => {
    if (isOpen) {
      if (hotel) {
        setFormData({
          name: hotel.name || '',
          address: hotel.address || '',
          bookingSite: hotel.bookingSite || '',
          checkInDate: hotel.checkInDate || '',
          checkOutDate: hotel.checkOutDate || '',
          roomType: hotel.roomType || '',
          pricePerNight: hotel.pricePerNight || 0,
          totalCost: hotel.totalCost?.cash || 0,
          paymentMethod: hotel.paymentMethod || 'cash',
          confirmationNumber: hotel.confirmationNumber || '',
          notes: hotel.notes || '',
        });
      } else {
        setFormData(defaultForm);
      }
    }
  }, [isOpen, hotel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      paymentMethod: 'cash',
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, paymentMethod: 'cash' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-0 relative max-h-[90vh] flex flex-col justify-center">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Add Hotel</h2>
          <button className="text-2xl text-gray-400 hover:text-gray-700 focus:outline-none" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        {/* Modal Body */}
        <div className="px-6 py-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hotel Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Booking Site</label>
              <input type="text" name="bookingSite" value={formData.bookingSite} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Check-In Date</label>
                <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Check-Out Date</label>
                <input type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room Type</label>
              <input type="text" name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Price Per Night</label>
                <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleNumberChange} className="w-full border rounded px-3 py-2" min="0" step="0.01" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Total Cost</label>
                <input type="number" name="totalCost" value={formData.totalCost} onChange={handleNumberChange} className="w-full border rounded px-3 py-2" min="0" step="0.01" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmation Number</label>
              <input type="text" name="confirmationNumber" value={formData.confirmationNumber} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full border rounded px-3 py-2" rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-4">
              <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={onClose}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Hotel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 