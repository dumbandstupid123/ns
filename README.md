# NextStep - AI-Powered Resource Matching System

A modern AI-powered resource matching application that helps social workers connect clients with appropriate housing, food, and transportation resources using intelligent semantic analysis.

## Features

- **AI Resource Matching**: Intelligent matching of clients to resources using semantic analysis with OpenAI and ChromaDB
- **Client Management**: Add and manage client information with comprehensive profiles
- **Resource Browser**: Browse and search 170+ available housing, food, and transportation resources
- **Modern Dashboard**: Clean interface for social workers and case managers
- **Voice Assistant**: AI-powered voice chat functionality
- **Real-time Updates**: Live resource status and availability tracking

## Architecture

This application consists of:
1. **FastAPI Backend** - Main API server with RAG resource matching
2. **React Frontend** - Modern web interface with Vite
3. **ChromaDB Vector Database** - Semantic search for resources
4. **OpenAI Integration** - AI-powered matching and chat

## Deployment

### Live Application
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway at `https://ns-deploy-production.up.railway.app`

### Setup Instructions

#### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd frontend
npm install
```

#### Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

#### Running the Application

1. **Start the Backend API** (Terminal 1):
```bash
cd backend
source venv/bin/activate
python server.py
```

2. **Start the Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

3. **Access the Application**:
   - Main App: http://localhost:5173
   - API Health: http://localhost:5001/api/health

## Project Structure

```
clean-repo/
├── backend/                 # Python backend
│   ├── server.py           # Main FastAPI server
│   ├── simple_rag_matcher.py # RAG resource matching
│   ├── assistant_functions.py # AI assistant functions
│   ├── prompts.py          # AI prompts and messages
│   ├── requirements.txt    # Python dependencies
│   ├── structured_resources.json # Resource database
│   └── clients.json        # Client data storage
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Node dependencies
│   └── index.html          # HTML template
└── README.md               # This file
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/resources` - Get all resources
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Add new client
- `POST /api/match_resources` - Match client to resources using AI
- `POST /api/chat` - Chat with AI assistant

## Key Features

### AI Resource Matching
- Semantic search through 170+ resources
- Intelligent matching based on client needs
- Real-time resource recommendations
- Support for housing, food, and transportation resources

### Client Management
- Comprehensive client profiles
- Case history tracking
- Resource assignment and follow-up

## Development

The application is designed to be modular and extensible. The main components are:

1. **RAG Matcher**: Provides intelligent resource matching
2. **Frontend Dashboard**: Modern React interface for social workers
3. **AI Assistant**: Conversational interface for resource queries

All components are optimized for production deployment with simplified dependencies.
