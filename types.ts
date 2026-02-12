
export enum Screen {
    Home = 'HOME',
    Location = 'LOCATION',
    Search = 'SEARCH',
    Video = 'VIDEO',
}

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All';

export interface ClothingItem {
    id: string;
    storageLocationId: string;
    imageDataUrl: string;
    name: string;
    type: string;
    color: string;
    season: Season;
    customTags: string[];
}

export interface StorageLocation {
    id: string;
    name: string;
}

export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
}
