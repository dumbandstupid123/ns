# Housing Resource Assistant

A modern AI-powered housing counselor application that helps social workers match clients with appropriate housing resources using AI analysis.

## Features

- **AI Resource Matching**: Intelligent matching of clients to housing resources using semantic analysis
- **Voice Assistant**: LiveKit-powered voice chat with AI assistant
- **Client Management**: Add and manage client information
- **Resource Browser**: Browse and search available housing resources
- **Modern Dashboard**: Clean interface for housing counselors

## Architecture

This application consists of:
1. **FastAPI Backend** (`backend/server.py`) - Main API server on port 5001
2. **React Frontend** - Modern web interface on port 5173
3. **LiveKit Agent** (`backend/agent.py`) - Voice assistant on port 8082

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key
- LiveKit credentials

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

1. **Start the Backend API** (Terminal 1):
```bash
cd backend
source venv/bin/activate
python server.py
```

2. **Start the LiveKit Agent** (Terminal 2):
```bash
cd backend
source venv/bin/activate
python agent.py
```

3. **Start the Frontend** (Terminal 3):
```bash
cd frontend
npm run dev
```

4. **Access the Application**:
   - Main App: http://localhost:5173
   - API Health: http://localhost:5001/api/health

## Project Structure

```
clean-repo/
├── backend/                 # Python backend
│   ├── server.py           # Main FastAPI server
│   ├── agent.py            # LiveKit voice agent
│   ├── resource_parser.py  # Resource data parser
│   ├── api.py              # Assistant function handlers
│   ├── prompts.py          # AI prompts and messages
│   ├── requirements.txt    # Python dependencies
│   ├── resources.txt       # Raw resource data
│   ├── mock_clients.json   # Sample client data
│   └── clients.json        # Real client data storage
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Node dependencies
│   └── index.html          # HTML template
├── venv/                   # Python virtual environment
└── README.md               # This file
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/resources` - Get all resources
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Add new client
- `GET /api/get` - Get LiveKit token for voice chat

## Key Features

### Voice Assistant
- Real-time voice interaction using LiveKit
- AI-powered responses using GPT-4
- Client lookup and case history retrieval
- Resource information and recommendations

## Development

The application is designed to be modular and extensible. The main components are:

1. **Voice Agent**: Provides conversational interface
2. **Frontend Dashboard**: Modern React interface for counselors

All unused code and duplicate applications have been removed for simplicity.
