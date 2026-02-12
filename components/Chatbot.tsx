
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GenerateContentResponse } from '@google/genai';
import { getChatbotResponse } from '../services/geminiService';
import { ChatMessage, ClothingItem, StorageLocation } from '../types';
import { ChatIcon, XMarkIcon, SendIcon } from './icons/Icons';
import LoadingSpinner from './shared/LoadingSpinner';

interface ChatbotProps {
    allClothes: ClothingItem[];
    allLocations: StorageLocation[];
}

const Chatbot: React.FC<ChatbotProps> = ({ allClothes, allLocations }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const stringifyWardrobe = useCallback(() => {
        let context = 'LOCATIONS:\n';
        allLocations.forEach(loc => {
            context += `- ${loc.name} (ID: ${loc.id})\n`;
        });
        context += '\nCLOTHING ITEMS:\n';
        allClothes.forEach(item => {
            context += `- Name: ${item.name}, Type: ${item.type}, Color: ${item.color}, Season: ${item.season}, Location ID: ${item.storageLocationId}\n`;
        });
        return context;
    }, [allClothes, allLocations]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const botMessage: ChatMessage = { sender: 'bot', text: '' };
        setMessages(prev => [...prev, botMessage]);

        try {
            const context = stringifyWardrobe();
            const stream = await getChatbotResponse(input, context);

            for await (const chunk of stream) {
                const c = chunk as GenerateContentResponse;
                const chunkText = c.text;
                if(chunkText) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.sender === 'bot') {
                            lastMessage.text += chunkText;
                        }
                        return newMessages;
                    });
                }
            }

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
             setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform duration-200 transform hover:scale-110 z-50"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <XMarkIcon className="w-6 h-6" /> : <ChatIcon className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-40 right-4 w-full max-w-sm h-[60vh] bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in-fast origin-bottom-right">
                    <header className="p-4 bg-gray-900 rounded-t-lg border-b border-gray-700">
                        <h2 className="text-lg font-bold text-white">Wardrobe Assistant</h2>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length-1]?.sender === 'bot' && (
                             <div className="flex justify-start">
                                 <div className="max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                                     <LoadingSpinner />
                                 </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-lg">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                placeholder="Ask about your clothes..."
                                className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed">
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
