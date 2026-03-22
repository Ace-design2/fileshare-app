export interface Device {
    id: string;
    username: string;
    name?: string; // Kept for backward compatibility while we refactor
}
