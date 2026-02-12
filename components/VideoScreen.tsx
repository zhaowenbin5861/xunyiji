
import React, { useState, useEffect } from 'react';
import Header from './shared/Header';
import LoadingSpinner from './shared/LoadingSpinner';
import { generateVideo } from '../services/geminiService';

const VideoScreen: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [isCheckingKey, setIsCheckingKey] = useState(true);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                try {
                    const keySelected = await window.aistudio.hasSelectedApiKey();
                    setHasApiKey(keySelected);
                } catch (e) {
                    console.error("Error checking for API key:", e);
                    setHasApiKey(false);
                } finally {
                    setIsCheckingKey(false);
                }
            } else {
                 setIsCheckingKey(false);
                 console.warn("AI Studio context not available.");
            }
        };
        checkKey();
    }, []);
    
    const handleSelectKey = async () => {
        if (window.aistudio) {
            try {
                await window.aistudio.openSelectKey();
                // Assume success and proceed. The service will handle re-auth errors.
                setHasApiKey(true); 
            } catch (e) {
                console.error("Error opening key selector:", e);
            }
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !hasApiKey) return;
        setIsLoading(true);
        setVideoUrl(null);
        setError(null);
        try {
            const downloadLink = await generateVideo(prompt, aspectRatio);
            if (downloadLink) {
                 const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                 if (!response.ok) throw new Error("Failed to fetch video blob.");
                 const blob = await response.blob();
                 setVideoUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("Video generation failed to return a link.");
            }
        } catch (e: any) {
            let errorMessage = "An unknown error occurred during video generation.";
            if (e.message) {
                 errorMessage = e.message;
                 if (e.message.includes("Requested entity was not found")) {
                    errorMessage = "API Key not valid. Please select a valid key from a paid project.";
                    setHasApiKey(false); // Reset key state to prompt user again
                 }
            }
            setError(errorMessage);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isCheckingKey) {
        return <div className="flex items-center justify-center h-screen"><LoadingSpinner text="Checking API Key..."/></div>
    }

    if (!hasApiKey) {
        return (
             <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
                <Header title="Video Generation" />
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-4">API Key Required</h2>
                    <p className="text-gray-300 mb-6">
                        Video generation with Veo requires a paid Google AI API key. Please select one from a project with billing enabled.
                    </p>
                    <button 
                        onClick={handleSelectKey}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                        Select API Key
                    </button>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
                        Learn more about billing
                    </a>
                </div>
            </div>
        );
    }


    return (
        <div className="animate-fade-in">
            <Header title="Video Generation" />
            <div className="p-4 max-w-4xl mx-auto space-y-6">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the video you want to create... e.g., 'a cat wearing a wizard hat casting a spell'"
                    className="w-full h-32 bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <div className="flex items-center space-x-4">
                    <label className="text-gray-300">Aspect Ratio:</label>
                    <div className="flex gap-2">
                        <button onClick={() => setAspectRatio('16:9')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>16:9 Landscape</button>
                        <button onClick={() => setAspectRatio('9:16')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>9:16 Portrait</button>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-indigo-900 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <LoadingSpinner/> : 'Generate Video'}
                </button>

                {isLoading && (
                    <div className="text-center text-indigo-300 p-4 bg-gray-800 rounded-lg">
                        <p className="font-semibold">Video generation in progress...</p>
                        <p className="text-sm">This can take a few minutes. Please be patient.</p>
                    </div>
                )}
                
                {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>}

                {videoUrl && (
                    <div className="mt-6 animate-fade-in-fast">
                        <h3 className="text-xl font-bold mb-3">Your Video:</h3>
                        <video controls src={videoUrl} className="w-full rounded-lg shadow-lg" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoScreen;
