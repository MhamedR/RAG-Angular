# RAG Assistant Frontend

A modern Angular frontend application for a Retrieval Augmented Generation (RAG) system. This application integrates with a NestJS backend to provide an intuitive interface for document upload, real-time chat, and document search.

## Features

- **Authentication** with API key
- **Real-time Chat** via WebSocket connection
- **Document Upload** with drag-and-drop interface
- **Document Management** with status tracking
- **RAG Search** to query documents with relevant sources
- **Responsive Design** that works on desktop and mobile

## Prerequisites

- Node.js 16+ and npm
- Angular CLI 16+
- NestJS backend running on http://localhost:3001

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Navigate to `http://localhost:4200` in your browser

## Backend Integration

This frontend application is designed to connect to a NestJS backend that provides:

1. AI API: GET /api/ai - For streaming completions
2. RAG API:
   - POST /api/rag/index - For indexing documents
   - GET /api/rag/query - For querying the RAG system
3. Documents API: POST /api/documents/upload - For file uploads
4. WebSocket endpoint for real-time chat with "chat-message" event

All API requests require an API key in the `x-api-key` header, which is automatically added by the application after login.

## Usage

1. **Login**: Enter your API key on the login page
2. **Upload Documents**: Navigate to the Documents page to upload files
3. **Chat**: Use the Chat page to have a conversation with the AI
4. **Search**: Go to the Search page to ask specific questions about your documents

## Development

### Code Structure

- **Components**: UI components for different views
- **Services**: Business logic and API integrations
- **Models**: Type definitions for data structures
- **Interceptors**: HTTP request/response handlers
- **Guards**: Route protection

### Adding Components

To add a new component, use the Angular CLI:

```bash
ng generate component components/my-component --standalone
```

## License

MIT 