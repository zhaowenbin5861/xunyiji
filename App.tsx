
import React, { useState, useCallback, useMemo } from 'react';
import { StorageLocation, ClothingItem, Screen } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import HomeScreen from './components/HomeScreen';
import LocationScreen from './components/LocationScreen';
import SearchScreen from './components/SearchScreen';
import VideoScreen from './components/VideoScreen';
import BottomNav from './components/shared/BottomNav';
import Chatbot from './components/Chatbot';
import { PlusIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [locations, setLocations] = useLocalStorage<StorageLocation[]>('locations', []);
  const [clothes, setClothes] = useLocalStorage<ClothingItem[]>('clothes', []);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Home);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const handleSelectLocation = useCallback((id: string) => {
    setSelectedLocationId(id);
    setActiveScreen(Screen.Location);
  }, []);

  const handleAddLocation = useCallback((name: string) => {
    const newLocation: StorageLocation = { id: `loc-${Date.now()}`, name };
    setLocations(prev => [...prev, newLocation]);
  }, [setLocations]);
  
  const handleDeleteLocation = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this location and all items in it?')) {
      setLocations(prev => prev.filter(loc => loc.id !== id));
      setClothes(prev => prev.filter(item => item.storageLocationId !== id));
      setActiveScreen(Screen.Home);
      setSelectedLocationId(null);
    }
  }, [setLocations, setClothes]);

  const handleAddClothingItem = useCallback((item: Omit<ClothingItem, 'id'>) => {
    const newItem: ClothingItem = { ...item, id: `item-${Date.now()}` };
    setClothes(prev => [...prev, newItem]);
  }, [setClothes]);

  const handleDeleteClothingItem = useCallback((id: string) => {
     if (window.confirm('Are you sure you want to delete this item?')) {
       setClothes(prev => prev.filter(item => item.id !== id));
     }
  }, [setClothes]);

  const selectedLocation = useMemo(() => {
    return locations.find(loc => loc.id === selectedLocationId);
  }, [locations, selectedLocationId]);

  const clothesInLocation = useMemo(() => {
    return clothes.filter(item => item.storageLocationId === selectedLocationId);
  }, [clothes, selectedLocationId]);

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.Home:
        return <HomeScreen locations={locations} onSelectLocation={handleSelectLocation} onAddLocation={handleAddLocation} />;
      case Screen.Location:
        if (selectedLocation) {
          return (
            <LocationScreen 
              location={selectedLocation} 
              clothes={clothesInLocation}
              onAddItem={handleAddClothingItem}
              onDeleteItem={handleDeleteClothingItem}
              onDeleteLocation={handleDeleteLocation}
            />
          );
        }
        return null; // Should not happen if logic is correct
      case Screen.Search:
        return <SearchScreen allClothes={clothes} allLocations={locations} />;
      case Screen.Video:
        return <VideoScreen />;
      default:
        return <HomeScreen locations={locations} onSelectLocation={handleSelectLocation} onAddLocation={handleAddLocation} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col">
      <main className="flex-grow pb-24 relative">
        {renderScreen()}
      </main>
      <Chatbot allClothes={clothes} allLocations={locations} />
      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
};

export default App;
