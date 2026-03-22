export interface WebSocketMessage {
    type: string;
    device_id?: string;
    message?: string;
    filename?: string;
}

export interface FileTransferStatus {
    status: string;
    filename?: string;
}
