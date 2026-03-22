import { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DeviceList } from './components/DeviceList';
import { FileUpload } from './components/FileUpload';
import { StatusPanel } from './components/StatusPanel';
import { ChatPanel } from './components/ChatPanel';
import type { LogMessage } from './components/StatusPanel';
import { wsService } from './services/websocket';
import { generateUsername } from './utils/nameGenerator';
import type { Device } from './types/device';
import type { WebSocketMessage } from './types/message';
import { Info } from 'lucide-react';

function App() {
    const [connected, setConnected] = useState(false);
    const [username] = useState<string>(() => generateUsername());
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [chatMessages, setChatMessages] = useState<WebSocketMessage[]>([]);
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
                case 'current_devices':
                    if (msg.devices) {
                        const allDevices = msg.devices.map((d: any) => ({
                            id: d.device_id || d.id,
                            username: d.username || 'Unknown',
                            name: d.username || `Device ${d.device_id?.split('_')[1] || d.id}`
                        }));
                        setDevices(allDevices);
                        
                        if (msg.my_device_id) {
                            setCurrentDeviceId(msg.my_device_id);
                        }
                        
                        addLog(`Loaded ${allDevices.length} existing devices on network`, 'info');
                    }
                    break;
                case 'device_joined':
                    if (msg.device_id) {
                        setDevices(prev => {
                            if (!prev.find(d => d.id === msg.device_id)) {
                                return [...prev, { 
                                    id: msg.device_id!, 
                                    username: msg.username || 'Unknown',
                                    name: msg.username || `Device ${msg.device_id!.split('_')[1] || msg.device_id}` 
                                }];
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
                        setSelectedDevice(prev => prev?.id === msg.device_id ? null : prev);
                        addLog(`Device left: ${msg.device_id}`, 'warning');
                    }
                    break;
                case 'chat_message':
                case 'private_message':
                    setChatMessages(prev => [...prev, msg]);
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

        wsService.connect(username);

        return () => {
            removeStatusListener();
            removeMessageListener();
            wsService.disconnect();
        };
    }, [addLog]);

    const selfDevice = devices.find(d => d.id === currentDeviceId);
    const deviceName = selfDevice?.username || selfDevice?.name || 'Connecting...';

    const handleSendMessage = (message: string) => {
        if (selectedDevice && selectedDevice.id) {
            wsService.sendMessage({
                type: 'private_message',
                target_device_id: selectedDevice.id,
                sender: username,
                message: message
            });
            // Immediately add our own private message to view
            setChatMessages(prev => [...prev, {
                type: 'private_message',
                sender: username,
                message: message,
                target_device_id: selectedDevice.id
            }]);
        } else {
            wsService.sendMessage({
                type: 'chat_message',
                sender: username,
                message: message
            });
        }
    };

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
                        <DeviceList 
                            devices={devices} 
                            currentDeviceId={currentDeviceId} 
                            selectedDevice={selectedDevice}
                            onSelectDevice={setSelectedDevice}
                        />
                        <FileUpload 
                            disabled={!connected} 
                            selectedDevice={selectedDevice} 
                        />
                    </div>
                    
                    <div className="col-span-1 flex flex-col gap-6 pt-6 lg:pt-8">
                        <ChatPanel 
                            messages={chatMessages}
                            onSendMessage={handleSendMessage}
                            selectedDevice={selectedDevice}
                            selfUsername={username || 'Unknown'}
                        />
                        <StatusPanel logs={logs} />
                    </div>
                </div>
                
            </main>
        </div>
    );
}

export default App;
