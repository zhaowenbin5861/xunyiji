
import React, { useState, useRef, useCallback } from 'react';
import { StorageLocation, ClothingItem, Season } from '../types';
import Header from './shared/Header';
import { PlusIcon, TrashIcon } from './icons/Icons';
import { analyzeClothingImage } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';

interface LocationScreenProps {
  location: StorageLocation;
  clothes: ClothingItem[];
  onAddItem: (item: Omit<ClothingItem, 'id'>) => void;
  onDeleteItem: (id:string) => void;
  onDeleteLocation: (id: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const AddItemModal: React.FC<{ 
    locationId: string;
    onAddItem: (item: Omit<ClothingItem, 'id'>) => void;
    onClose: () => void;
}> = ({ locationId, onAddItem, onClose }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ name: string; type: string; color: string; season: Season } | null>(null);
    const [customTags, setCustomTags] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsLoading(true);
            setAnalysisResult(null);
            try {
                const base64Image = await fileToBase64(file);
                const result = await analyzeClothingImage(base64Image, file.type);
                setAnalysisResult(result);
            } catch (error) {
                alert(error instanceof Error ? error.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleSave = () => {
        if (imagePreview && analysisResult) {
            onAddItem({
                storageLocationId: locationId,
                imageDataUrl: imagePreview,
                name: analysisResult.name,
                type: analysisResult.type,
                color: analysisResult.color,
                season: analysisResult.season,
                customTags: customTags.split(',').map(tag => tag.trim()).filter(Boolean),
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                    
                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                    {!imagePreview ? (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span>Tap to take a photo</span>
                        </button>
                    ) : (
                        <div className="mb-4">
                            <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-60 object-contain rounded-lg" />
                        </div>
                    )}
                    
                    {isLoading && <div className="my-4"><LoadingSpinner text="Analyzing image..." /></div>}

                    {analysisResult && (
                        <div className="space-y-3 animate-fade-in-fast">
                             <div>
                                <label className="text-sm font-medium text-gray-400">Name</label>
                                <input type="text" value={analysisResult.name} onChange={e => setAnalysisResult({...analysisResult, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400">Type</label>
                                <input type="text" value={analysisResult.type} onChange={e => setAnalysisResult({...analysisResult, type: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400">Color</label>
                                <input type="text" value={analysisResult.color} onChange={e => setAnalysisResult({...analysisResult, color: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400">Season</label>
                                <select value={analysisResult.season} onChange={e => setAnalysisResult({...analysisResult, season: e.target.value as Season})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                    <option>Spring</option>
                                    <option>Summer</option>
                                    <option>Autumn</option>
                                    <option>Winter</option>
                                    <option>All</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-400">Custom Tags (comma separated)</label>
                                <input type="text" value={customTags} onChange={e => setCustomTags(e.target.value)} placeholder="e.g. formal, casual" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6 space-x-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-semibold">Cancel</button>
                        <button onClick={handleSave} disabled={!analysisResult || isLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-semibold disabled:bg-indigo-900 disabled:cursor-not-allowed">Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ClothingCard: React.FC<{ item: ClothingItem; onDelete: (id: string) => void; }> = ({ item, onDelete }) => (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden relative group">
        <img src={item.imageDataUrl} alt={item.name} className="w-full h-48 object-cover" />
        <div className="p-3">
            <h3 className="font-bold text-md truncate">{item.name}</h3>
            <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs bg-indigo-500/50 text-indigo-200 px-2 py-1 rounded-full">{item.type}</span>
                <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded-full">{item.color}</span>
                <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded-full">{item.season}</span>
            </div>
        </div>
        <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-opacity duration-200">
             <TrashIcon className="w-4 h-4" />
        </button>
    </div>
);


const LocationScreen: React.FC<LocationScreenProps> = ({ location, clothes, onAddItem, onDeleteItem, onDeleteLocation }) => {
    const [isAddingItem, setIsAddingItem] = useState(false);

    return (
        <div className="animate-fade-in">
            <Header title={location.name}>
                <div className="flex items-center space-x-2">
                     <button onClick={() => onDeleteLocation(location.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-full transition-colors duration-200">
                        <TrashIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => setIsAddingItem(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-full transition-colors duration-200">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
            </Header>
            <div className="p-4 max-w-4xl mx-auto">
                {clothes.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-lg">This location is empty.</p>
                        <p>Add your first item of clothing!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {clothes.map(item => (
                           <ClothingCard key={item.id} item={item} onDelete={onDeleteItem} />
                        ))}
                    </div>
                )}
            </div>
            {isAddingItem && <AddItemModal locationId={location.id} onAddItem={onAddItem} onClose={() => setIsAddingItem(false)} />}
        </div>
    );
};

export default LocationScreen;
