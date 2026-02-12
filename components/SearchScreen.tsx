
import React, { useState, useMemo } from 'react';
import { ClothingItem, StorageLocation, Season } from '../types';
import Header from './shared/Header';

interface SearchScreenProps {
  allClothes: ClothingItem[];
  allLocations: StorageLocation[];
}

const SearchResultCard: React.FC<{ item: ClothingItem; locationName: string }> = ({ item, locationName }) => (
    <div className="bg-gray-800 rounded-lg shadow-lg flex items-start space-x-4 p-3">
        <img src={item.imageDataUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
        <div className="flex-1">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-sm text-indigo-400 font-semibold">{locationName}</p>
            <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs bg-indigo-500/50 text-indigo-200 px-2 py-1 rounded-full">{item.type}</span>
                <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded-full">{item.color}</span>
                <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded-full">{item.season}</span>
            </div>
        </div>
    </div>
);

const SearchScreen: React.FC<SearchScreenProps> = ({ allClothes, allLocations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<Season | 'All Seasons'>('All Seasons');

  const locationMap = useMemo(() => {
    return new Map(allLocations.map(loc => [loc.id, loc.name]));
  }, [allLocations]);

  const filteredClothes = useMemo(() => {
    return allClothes.filter(item => {
      const term = searchTerm.toLowerCase();
      const matchesSearchTerm = 
        item.name.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term) ||
        item.color.toLowerCase().includes(term) ||
        item.customTags.some(tag => tag.toLowerCase().includes(term));
      
      const matchesSeason = selectedSeason === 'All Seasons' || item.season === selectedSeason;

      return matchesSearchTerm && matchesSeason;
    });
  }, [allClothes, searchTerm, selectedSeason]);

  const seasons: (Season | 'All Seasons')[] = ['All Seasons', 'Spring', 'Summer', 'Autumn', 'Winter', 'All'];

  return (
    <div className="animate-fade-in">
      <Header title="Search Clothes" />
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <input
          type="text"
          placeholder="Search by name, type, color, tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
        />
        <div className="flex items-center space-x-2">
            <label htmlFor="season-filter" className="text-gray-400">Season:</label>
            <select
                id="season-filter"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value as Season | 'All Seasons')}
                className="bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        <div className="space-y-4">
            {filteredClothes.length > 0 ? (
                 filteredClothes.map(item => (
                    <SearchResultCard key={item.id} item={item} locationName={locationMap.get(item.storageLocationId) || 'Unknown Location'} />
                ))
            ) : (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-lg">No items found.</p>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;
