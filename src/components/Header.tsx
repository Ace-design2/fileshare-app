import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
    connected: boolean;
    deviceName: string;
}

export const Header: React.FC<HeaderProps> = ({ connected, deviceName }) => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 antialiased">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-sm text-white">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">LocalDrop</h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700">
                        {deviceName}
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${connected ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-red-100 text-red-700'}`}>
                        {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        {connected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
            </div>
        </header>
    );
};
