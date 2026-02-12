
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";

// Ensure API_KEY is available in the environment.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const clothingAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "A short, descriptive name for the clothing item (e.g., 'Blue Striped T-Shirt').",
        },
        type: {
            type: Type.STRING,
            description: "The type of clothing (e.g., 'T-Shirt', 'Jeans', 'Dress', 'Jacket').",
        },
        color: {
            type: Type.STRING,
            description: "The dominant color of the clothing item.",
        },
        season: {
            type: Type.STRING,
            enum: ['Spring', 'Summer', 'Autumn', 'Winter', 'All'],
            description: "The most suitable season for this item.",
        },
    },
    required: ["name", "type", "color", "season"],
};

export const analyzeClothingImage = async (base64Image: string, mimeType: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: "Analyze this image of a clothing item. Identify its name, type, primary color, and the most suitable season. Return the response as a JSON object matching the provided schema. Be accurate.",
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: clothingAnalysisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw new Error("Failed to analyze image. Please try again.");
    }
};

let chatInstance: Chat | null = null;

export const getChatbotResponse = async (message: string, context: string) => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: `You are a helpful wardrobe assistant chatbot. The user's current wardrobe contains the following items and locations:\n\n${context}\n\nAnswer the user's questions based on this information. Be friendly and concise. For complex questions about outfit combinations or fashion advice, take your time to think.`,
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });
    }

    const stream = await chatInstance.sendMessageStream({ message });
    return stream;
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
    // Re-create the AI instance to ensure the latest key from the dialog is used.
    const videoAi = new GoogleGenAI({ apiKey: API_KEY });
    let operation = await videoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await videoAi.operations.getVideosOperation({ operation: operation });
    }

    return operation.response?.generatedVideos?.[0]?.video?.uri;
};
