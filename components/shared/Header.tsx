
import React from 'react';

interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
    return (
        <header className="p-4 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                <div>{children}</div>
            </div>
        </header>
    );
};

export default Header;
