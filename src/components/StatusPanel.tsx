import React, { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { getDownloadUrl } from '../services/api';

export interface LogMessage {
    id: string;
    text: string;
    timestamp: Date;
    type: 'info' | 'success' | 'warning' | 'error' | 'file';
    filename?: string;
}

interface StatusPanelProps {
    logs: LogMessage[];
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="mt-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Network Activity</h3>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm max-h-full bg-gray-900 text-gray-300">
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-600 italic">
                        Waiting for network events...
                    </div>
                ) : (
                    logs.map((log) => {
                        let colorClass = 'text-blue-400';
                        if (log.type === 'success') colorClass = 'text-green-400';
                        if (log.type === 'warning') colorClass = 'text-yellow-400';
                        if (log.type === 'error') colorClass = 'text-red-400';
                        if (log.type === 'file') colorClass = 'text-indigo-300';

                        return (
                            <div key={log.id} className="flex gap-3 animate-fade-in opacity-90 transition-opacity flex-wrap">
                                <span className="text-gray-500 flex-shrink-0">
                                    [{log.timestamp.toLocaleTimeString([], { hour12: false })}]
                                </span>
                                <span className={`${colorClass} break-all flex-1`}>
                                    {log.text}
                                    {log.type === 'file' && log.filename && (
                                        <a 
                                            href={getDownloadUrl(log.filename)}
                                            download={log.filename}
                                            className="ml-2 inline-flex items-center gap-1 text-xs bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded transition-colors"
                                        >
                                            <Download className="w-3 h-3" />
                                            Download
                                        </a>
                                    )}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={endRef} />
            </div>
        </div>
    );
};
