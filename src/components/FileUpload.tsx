import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFile } from '../services/api';
import type { Device } from '../types/device';

interface FileUploadProps {
    disabled: boolean;
    selectedDevice: Device | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ disabled, selectedDevice }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file || disabled) return;
        
        if (!selectedDevice) {
            setError('Please select a device to send the file.');
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        setError(null);
        setSuccess(null);
        setUploading(true);
        
        try {
            await uploadFile(file, selectedDevice.id);
            setSuccess(`Successfully shared ${file.name}`);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError('Failed to share file. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !uploading) setIsDragging(true);
    }, [disabled, uploading]);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (disabled || uploading) return;
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleUpload(files[0]);
        }
    }, [disabled, uploading]);

    return (
        <div className="mt-8">
            <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300
                    ${disabled ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' : 
                      isDragging ? 'bg-indigo-50 border-indigo-400 scale-[1.01] shadow-inner' : 'bg-white border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-lg cursor-pointer'}
                `}
            >
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) handleUpload(files[0]);
                    }}
                    disabled={disabled || uploading}
                />
                
                <div className={`p-5 rounded-full mb-5 shadow-sm transition-colors duration-300 ${uploading ? 'bg-indigo-600 text-white' : isDragging ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-100 text-indigo-600'}`}>
                    {uploading ? (
                        <Loader2 className="w-10 h-10 animate-spin" />
                    ) : (
                        <UploadCloud className={`w-10 h-10 ${isDragging ? 'animate-bounce' : ''}`} />
                    )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                    {uploading 
                        ? 'Sharing file to network...' 
                        : selectedDevice 
                            ? `Sending to: ${selectedDevice.username || selectedDevice.name}`
                            : 'Tap to select or drop a file'}
                </h3>
                
                <p className="text-sm font-medium text-gray-500 mb-4 text-center max-w-sm">
                    {disabled 
                        ? 'Connect to the network to share files' 
                        : selectedDevice
                            ? 'Drop a file here to transfer it directly to this device.'
                            : 'Select a device from the list above to send a file.'}
                </p>

                {error && (
                    <div className="absolute bottom-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 font-semibold rounded-xl text-sm border border-red-100 shadow-sm animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="absolute bottom-4 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 font-semibold rounded-xl text-sm border border-green-100 shadow-sm animate-fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        {success}
                    </div>
                )}
            </div>
        </div>
    );
};
