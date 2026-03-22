# Local Network File Sharing (Frontend)

This is the React frontend for a local network file-sharing application designed to facilitate seamless file transfers between devices on the same network.

## Features

- **Real-Time Device Discovery:** Automatically detects and displays other devices on the local network using WebSockets.
- **File Uploads & Downloads:** Supports sending and receiving files with a responsive progress indicator.
- **Live Status Notifications:** Keeps you informed about connection statuses and ongoing transfer progress.
- **Responsive UI:** A modern, clean user interface built with Tailwind CSS.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Real-Time Communication:** WebSockets

## Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with a package manager like `npm` or `yarn`.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or depending on your Vite configuration).

## Connecting to the Backend

This frontend is designed to work alongside a FastAPI backend. Ensure the backend server is running and accessible on your local network (typically on port `8000`). The frontend establishes both HTTP and WebSocket connections to facilitate its core features.
