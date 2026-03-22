import type { Device } from './device';

export interface WebSocketMessage {
    type: string;
    device_id?: string;
    devices?: Device[];
    username?: string;
    message?: string;
    filename?: string;
    sender?: string;
    target_device_id?: string;
}

export interface FileTransferStatus {
    status: string;
    filename?: string;
}
