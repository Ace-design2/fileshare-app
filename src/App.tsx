import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DeviceList } from './components/DeviceList';
import { FileUpload } from './components/FileUpload';
import { StatusPanel } from './components/StatusPanel';
import type { LogMessage } from './components/StatusPanel';
import { wsService } from './services/websocket';
import type { Device } from './types/device';
import type { WebSocketMessage } from './types/message';
import { Info } from 'lucide-react';

function App() {
    const [connected, setConnected] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

    const addLog = useCallback((text: string, type: LogMessage['type'] = 'info', filename?: string) => {
        setLogs(prev => [...prev.slice(-49), {
            id: Math.random().toString(36).substring(2, 9),
            text,
            timestamp: new Date(),
            type,
            filename
        }]);
    }, []);

    useEffect(() => {
        const removeStatusListener = wsService.addStatusListener((status) => {
            setConnected(status);
            if (status) {
                addLog('Connected to LocalDrop network', 'success');
            } else {
                addLog('Connection lost. Attempting to reconnect...', 'error');
                // We optionally wipe device list on disconnect if desired
            }
        });

        const removeMessageListener = wsService.addMessageListener((msg: WebSocketMessage) => {
            switch (msg.type) {
                case 'device_joined':
                    if (msg.device_id) {
                        setDevices(prev => {
                            if (!prev.find(d => d.id === msg.device_id)) {
                                return [...prev, { id: msg.device_id!, name: `Device ${msg.device_id!.split('_')[1] || msg.device_id}` }];
                            }
                            return prev;
                        });
                        
                        setCurrentDeviceId(prev => {
                            if (!prev) return msg.device_id!;
                            return prev;
                        });
                        
                        addLog(`Device joined: ${msg.device_id}`, 'info');
                    }
                    break;
                case 'device_left':
                    if (msg.device_id) {
                        setDevices(prev => prev.filter(d => d.id !== msg.device_id));
                        addLog(`Device left: ${msg.device_id}`, 'warning');
                    }
                    break;
                case 'file_transfer_started':
                    if (msg.filename) {
                        addLog(`Transfer started: ${msg.filename}`, 'info');
                    }
                    break;
                case 'file_transfer_completed':
                    if (msg.filename) {
                        addLog(`Transfer completed: ${msg.filename}`, 'success');
                    }
                    break;
                case 'file_available':
                    if (msg.filename) {
                        addLog(`New file available: ${msg.filename}`, 'file', msg.filename);
                    }
                    break;
                default:
                    console.log('Unknown message type:', msg);
            }
        });

        wsService.connect();

        return () => {
            removeStatusListener();
            removeMessageListener();
            wsService.disconnect();
        };
    }, [addLog]);

    const selfDevice = devices.find(d => d.id === currentDeviceId);
    const deviceName = selfDevice ? selfDevice.name : 'Connecting...';

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900">
            <Header connected={connected} deviceName={deviceName} />
            
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4">
                
                <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-sm">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 shrink-0">
                        <Info className="w-8 h-8" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-indigo-950 font-extrabold text-xl mb-1.5 tracking-tight">Welcome to LocalDrop!</h2>
                        <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                            Any device connected to your current Wi-Fi network and viewing this page will instantly appear below. 
                            Select or drop a file to securely share it across all connected devices in real-time.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="col-span-1 lg:col-span-2 flex flex-col">
                        <DeviceList devices={devices} currentDeviceId={currentDeviceId} />
                        <FileUpload disabled={!connected} />
                    </div>
                    
                    <div className="col-span-1 flex flex-col pt-6 lg:pt-8">
                        <StatusPanel logs={logs} />
                    </div>
                </div>
                
            </main>
        </div>
    );
}

export default App;
