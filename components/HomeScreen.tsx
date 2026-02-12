
import React, { useState } from 'react';
import { StorageLocation } from '../types';
import Header from './shared/Header';
import { PlusIcon } from './icons/Icons';

interface HomeScreenProps {
  locations: StorageLocation[];
  onSelectLocation: (id: string) => void;
  onAddLocation: (name: string) => void;
}

const LocationCard: React.FC<{ location: StorageLocation, onClick: () => void }> = ({ location, onClick }) => (
    <div onClick={onClick} className="bg-gray-800 rounded-lg p-4 shadow-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-4">
        <div className="bg-indigo-500 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        </div>
        <span className="font-semibold text-lg">{location.name}</span>
    </div>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ locations, onSelectLocation, onAddLocation }) => {
  const [newLocationName, setNewLocationName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newLocationName.trim()) {
      onAddLocation(newLocationName.trim());
      setNewLocationName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header title="My Wardrobe">
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-full transition-colors duration-200">
          <PlusIcon className="w-6 h-6" />
        </button>
      </Header>
      <div className="p-4 max-w-4xl mx-auto">
        {isAdding && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">New Storage Location</h3>
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="e.g., Main Closet, Suitcase"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end mt-3 space-x-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-semibold">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-semibold">Add</button>
            </div>
          </div>
        )}
        {locations.length === 0 && !isAdding ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Your wardrobe is empty.</p>
            <p>Add a storage location to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map(loc => (
              <LocationCard key={loc.id} location={loc} onClick={() => onSelectLocation(loc.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
