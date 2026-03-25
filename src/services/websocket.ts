import type { WebSocketMessage } from '../types/message';

type MessageCallback = (msg: WebSocketMessage) => void;
type StatusCallback = (connected: boolean) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private messageListeners: MessageCallback[] = [];
    private statusListeners: StatusCallback[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;
    
    private username: string = "Unknown";

    // Connects to the robust websocket service
    connect(username: string, url: string = `ws://${window.location.hostname}:8000/ws`) {
        this.username = username;
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log('WebSocket connected successfully');
                this.reconnectAttempts = 0;
                
                // Immediately register the device with its username
                this.sendMessage({
                    type: 'register_device',
                    username: this.username
                });
                
                this.notifyStatusListeners(true);
            };

            this.socket.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    this.notifyMessageListeners(data);
                } catch (e) {
                    console.error('Failed to parse websocket message', e);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket completely disconnected');
                this.notifyStatusListeners(false);
                this.handleReconnect(url);
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket Error', error);
                // We don't close here, socket.onclose will fire anyway
            };
        } catch (error) {
            console.error('WebSocket connection initialization error:', error);
            this.handleReconnect(url);
        }
    }

    private handleReconnect(url: string) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to securely reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(this.username, url), this.reconnectDelay);
        } else {
            console.error('Max robust reconnect attempts visually reached.');
        }
    }

    disconnect() {
        if (this.socket) {
            // Prevent automatic reconnect loop on intentional disconnect
            this.socket.onclose = null;
            this.socket.close();
            this.socket = null;
        }
        this.notifyStatusListeners(false);
    }

    // Send a JSON message to the backend
    sendMessage(msg: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(msg));
        } else {
            console.error('Cannot send message, WebSocket is not open.');
        }
    }

    // Subscribe to incoming messages
    addMessageListener(callback: MessageCallback) {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
        };
    }

    // Subscribe to connection status changes
    addStatusListener(callback: StatusCallback) {
        this.statusListeners.push(callback);
        return () => {
            this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
        };
    }

    private notifyMessageListeners(message: WebSocketMessage) {
        this.messageListeners.forEach(listener => listener(message));
    }

    private notifyStatusListeners(status: boolean) {
        this.statusListeners.forEach(listener => listener(status));
    }
}

export const wsService = new WebSocketService();
