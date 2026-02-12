
import React from 'react';
import { Screen } from '../../types';
import { HomeIcon, SearchIcon, VideoIcon } from '../icons/Icons';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
}> = ({ onClick, isActive, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 bg-opacity-80 backdrop-blur-md border-t border-gray-700 flex justify-around items-center z-50">
      <NavButton
        onClick={() => setActiveScreen(Screen.Home)}
        isActive={activeScreen === Screen.Home || activeScreen === Screen.Location}
        label="Home"
        icon={<HomeIcon />}
      />
      <NavButton
        onClick={() => setActiveScreen(Screen.Search)}
        isActive={activeScreen === Screen.Search}
        label="Search"
        icon={<SearchIcon />}
      />
      <NavButton
        onClick={() => setActiveScreen(Screen.Video)}
        isActive={activeScreen === Screen.Video}
        label="Video"
        icon={<VideoIcon />}
      />
    </nav>
  );
};

export default BottomNav;
