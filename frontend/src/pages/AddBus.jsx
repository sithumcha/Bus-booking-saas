import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Plus, X, Check, AlertCircle, Upload, Image } from 'lucide-react';

const BUS_IMAGE_PRESETS = [
  { name: 'AC Luxury Coach (Blue)', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop' },
  { name: 'Sleek Cruiser (White)', url: 'https://images.unsplash.com/photo-1626125345510-4603468eedfb?w=500&auto=format&fit=crop' },
  { name: 'Modern Sleeper (Red)', url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop' },
  { name: 'Urban Double Decker', url: 'https://images.unsplash.com/photo-1562620644-66bdc0e97d1b?w=500&auto=format&fit=crop' }
];

const AddBus = ({ onComplete }) => {
  const { user } = useContext(AuthContext);
  const [busForm, setBusForm] = useState({
    registrationNumber: '',
    type: 'AC Luxury',
    totalSeats: 40,
    seatLayout: '2x2',
    amenities: [],
    brand: '',
    image: BUS_IMAGE_PRESETS[0].url,
    description: ''
  });
  const [busError, setBusError] = useState('');
  const [imageSourceTab, setImageSourceTab] = useState('upload');

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setBusError('Please select a valid image file.');
      return;
    }
    try {
      const compressedBase64 = await compressImage(file);
      setBusForm((prev) => ({ ...prev, image: compressedBase64 }));
    } catch (err) {
      console.error('Failed to process image', err);
      setBusError('Failed to process uploaded image.');
    }
  };

  const toggleAmenity = (amenity) => {
    setBusForm((prev) => {
      const list = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: list };
    });
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    setBusError('');
    if (!busForm.registrationNumber.trim()) {
      setBusError('Registration number is required.');
      return;
    }
    try {
      const { data } = await api.post('/buses', busForm);
      if (onComplete) onComplete();
    } catch (error) {
      setBusError(error.response?.data?.message || 'Failed to save bus details.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-[#0E0E12] rounded-3xl shadow-md border border-gray-100 dark:border-white/5 transition-colors duration-300">
      <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-4">Add New Bus to Fleet</h2>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Enter vehicle details and upload an image.</p>
      {busError && (
        <div className="mb-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100 dark:border-red-500/20 font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{busError}</span>
        </div>
      )}
      <form onSubmit={handleBusSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Registration Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WP ND-4567"
              className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-bold text-gray-800 dark:text-white bg-white dark:bg-slate-900"
              value={busForm.registrationNumber}
              onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Vehicle Brand / Model
            </label>
            <input
              type="text"
              placeholder="e.g. Volvo B11R"
              className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-900"
              value={busForm.brand}
              onChange={(e) => setBusForm({ ...busForm, brand: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Bus Type
            </label>
            <select
              className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900"
              value={busForm.type}
              onChange={(e) => setBusForm({ ...busForm, type: e.target.value })}
            >
              <option value="AC Luxury">AC Luxury</option>
              <option value="Non-AC">Non-AC</option>
              <option value="Sleeper">Sleeper</option>
              <option value="Semi-Sleeper">Semi-Sleeper</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Seat Layout
            </label>
            <select
              className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900"
              value={busForm.seatLayout}
              onChange={(e) => setBusForm({ ...busForm, seatLayout: e.target.value })}
            >
              <option value="2x2">Standard (2x2)</option>
              <option value="3x2">High Capacity (3x2)</option>
              <option value="2x1">Comfort (2x1)</option>
              <option value="1x1">Premium Sleeper (1x1)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Total Passenger Seats
            </label>
            <input
              type="number"
              required
              min="10"
              max="60"
              placeholder="e.g. 40"
              className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-900"
              value={busForm.totalSeats}
              onChange={(e) => setBusForm({ ...busForm, totalSeats: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Bus Image Source
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setImageSourceTab('upload')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  imageSourceTab === 'upload'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white dark:bg-white/5 text-gray-550 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageSourceTab('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  imageSourceTab === 'url'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white dark:bg-white/5 text-gray-550 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                }`}
              >
                Image URL
              </button>
            </div>
            {imageSourceTab === 'upload' ? (
              <div className="relative border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/40 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer group min-h-[50px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  {busForm.image && busForm.image.startsWith('data:') ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                      <img src={busForm.image} alt="Upload preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/5 flex items-center justify-center shrink-0 text-gray-400 dark:text-gray-500 group-hover:bg-gray-300 dark:group-hover:bg-white/10 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Choose local image</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-555">PNG, JPG or WebP (auto-resized)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-900"
                  value={busForm.image}
                  onChange={(e) => setBusForm({ ...busForm, image: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Vehicle Description
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Equipped with soft reclining leather seats, individual reading lights, climate control, and soft neck pillows."
            className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-900"
            value={busForm.description}
            onChange={(e) => setBusForm({ ...busForm, description: e.target.value })}
          />
        </div>


        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Amenities Checklist
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['WiFi', 'Charging Point', 'Water Bottle', 'Pillow', 'Blanket', 'Reading Light'].map((amenity) => {
              const checked = busForm.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                    checked ? 'bg-secondary/15 text-dark dark:text-secondary border-secondary' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-secondary border-secondary text-dark' : 'border-gray-300 dark:border-white/10'}`}>
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => onComplete ? onComplete() : (window.location.href = '/admin')} className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm cursor-pointer border border-gray-200 dark:border-white/5">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow cursor-pointer">
            Save Bus Details
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBus;
