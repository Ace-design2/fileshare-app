import React, { useState, useRef, useEffect } from 'react';
import type { Device } from '../types/device';
import type { WebSocketMessage } from '../types/message';
import { Send, MessageSquare } from 'lucide-react';

interface ChatPanelProps {
    messages: WebSocketMessage[];
    onSendMessage: (message: string) => void;
    selectedDevice: Device | null;
    selfUsername: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
    messages, 
    onSendMessage, 
    selectedDevice,
    selfUsername
}) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 text-indigo-500 rounded-xl shadow-sm">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight">
                            {selectedDevice ? 'Private Chat' : 'Network Chat'}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                            {selectedDevice ? `Talking to ${selectedDevice.username}` : 'Visible to everyone'}
                        </p>
                    </div>
                </div>
                {selectedDevice && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">
                        Private Mode
                    </span>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <MessageSquare className="w-10 h-10 mb-2" />
                        <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isSelf = msg.sender === selfUsername;
                        const isPrivate = msg.type === 'private_message';
                        
                        return (
                            <div key={i} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1">
                                    {isSelf ? 'You' : msg.sender}
                                </span>
                                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${
                                    isSelf 
                                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-200' 
                                        : isPrivate 
                                            ? 'bg-emerald-500 text-white rounded-tl-sm shadow-md shadow-emerald-200' 
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                                }`}>
                                    {isPrivate && !isSelf && (
                                        <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-100 mb-0.5 border-b border-emerald-400/50 pb-0.5">
                                            Private Whisper
                                        </div>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedDevice ? `Whisper to ${selectedDevice.username}...` : "Message everyone..."}
                        className="w-full pl-5 pr-14 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all text-sm placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};
