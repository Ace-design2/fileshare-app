import React from 'react';
import type { Device } from '../types/device';
import { MonitorSmartphone, User } from 'lucide-react';

interface DeviceListProps {
    devices: Device[];
    currentDeviceId: string | null;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, currentDeviceId }) => {
    if (devices.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-6 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-500 mb-4 shadow-sm border border-blue-100">
                    <MonitorSmartphone className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Looking for devices...</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">Make sure other users are on the same Wi-Fi network and have the app open.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    Available Devices
                </h2>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-md">
                    {devices.length} Online
                </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {devices.map((device) => {
                    const isSelf = device.id === currentDeviceId;
                    return (
                        <div 
                            key={device.id} 
                            className={`group relative flex flex-col items-center p-6 bg-white rounded-2xl transition-all duration-300 ${isSelf ? 'border-2 border-indigo-500 shadow-md ring-4 ring-indigo-50 ring-opacity-50' : 'border border-gray-200 hover:border-indigo-300 hover:shadow-lg shadow-sm hover:-translate-y-1'}`}
                        >
                            {isSelf && (
                                <span className="absolute top-3 right-3 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                                </span>
                            )}
                            <div className={`p-4 rounded-full mb-3 shadow-inner ${isSelf ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors'}`}>
                                {isSelf ? <User className="w-8 h-8" /> : <MonitorSmartphone className="w-8 h-8" />}
                            </div>
                            <span className="font-semibold text-gray-900 text-center truncate w-full">{device.name}</span>
                            <span className="text-xs text-gray-400 mt-1 font-medium">{isSelf ? 'You' : device.id}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
