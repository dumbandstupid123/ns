#!/bin/bash

# NextStep App Deployment Script

set -e

echo "🚀 NextStep App Deployment Script"
echo "================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy env.example to .env and fill in your API keys:"
    echo "cp env.example .env"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY is required!"
    echo "Please add your OpenAI API key to the .env file"
    exit 1
fi

echo "✅ Environment variables loaded"

# Choose deployment method
echo ""
echo "Choose deployment method:"
echo "1) Docker Compose (Local/VPS)"
echo "2) Build for Cloud Deployment"
echo "3) Development Setup"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🐳 Deploying with Docker Compose..."
        
        # Build and start containers
        docker-compose down
        docker-compose build
        docker-compose up -d
        
        echo "✅ Deployment complete!"
        echo "🌐 Frontend: http://localhost"
        echo "🔧 Backend: http://localhost:5001"
        echo "📊 Health Check: http://localhost:5001/health"
        ;;
    2)
        echo "☁️ Building for Cloud Deployment..."
        
        # Build frontend
        echo "Building frontend..."
        cd frontend
        npm ci
        npm run build
        cd ..
        
        # Create deployment package
        echo "Creating deployment package..."
        mkdir -p deploy
        cp -r backend deploy/
        cp -r frontend/dist deploy/frontend-dist
        cp docker-compose.yml deploy/
        cp env.example deploy/
        
        echo "✅ Build complete!"
        echo "📦 Deployment files are in ./deploy/"
        echo "Upload these files to your cloud provider"
        ;;
    3)
        echo "🛠️ Setting up development environment..."
        
        # Backend setup
        echo "Setting up backend..."
        cd backend
        if [ ! -d "venv" ]; then
            python -m venv venv
        fi
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
        
        # Frontend setup
        echo "Setting up frontend..."
        cd frontend
        npm install
        cd ..
        
        echo "✅ Development setup complete!"
        echo "To start development:"
        echo "1. Backend: cd backend && source venv/bin/activate && python server.py"
        echo "2. Frontend: cd frontend && npm run dev"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment script completed!" 