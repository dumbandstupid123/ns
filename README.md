# LiveKit AI Car Call Centre

A modern web application that provides an AI-powered call center interface for car-related inquiries and support.

## Features

- **Dashboard**: Modern interface with client management and call statistics
- **AI Assistant**: Real-time voice and chat interface for car-related queries
- **Client Management**: Track and manage client information
- **Resource Management**: Manage and access car-related resources and documentation
- **LiveKit Integration**: Real-time video and audio communication

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/dumbandstupid123/ns.git
   cd ns
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env  # Create your environment file
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   cp .env.example .env  # Create your environment file
   ```

4. Configure environment variables:
   - Backend (.env):
     - Set your OpenAI API key
     - Configure LiveKit credentials
     - Adjust other settings as needed
   - Frontend (.env):
     - Set the LiveKit URL
     - Configure API URL if needed

5. Start the servers:
   - Backend:
     ```bash
     cd backend
     python server.py
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```

6. Access the application at http://localhost:5173

## Project Structure

```
LiveKit-AI-Car-Call-Centre/
├── backend/                 # Python backend
│   ├── agent.py            # AI agent implementation
│   ├── api.py              # API endpoints
│   ├── db_driver.py        # Database operations
│   ├── prompts.py          # AI prompts
│   ├── requirements.txt    # Python dependencies
│   └── server.py           # Main server file
├── frontend/               # React frontend
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   └── App.jsx        # Main application
│   └── package.json       # Node.js dependencies
└── docs/                  # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
