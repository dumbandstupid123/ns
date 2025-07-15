#!/bin/bash
cd "$(dirname "$0")"

# --- Configuration ---
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
VENV_DIR="$BACKEND_DIR/venv"
PORTS_TO_CHECK=(5001 5173 8082)

# --- Helper Functions ---
function print_header() {
    echo "============================================="
echo "🏠 Housing Resource Assistant Startup Script"
echo "============================================="
}

function kill_processes_on_ports() {
    echo "🔄 Checking for running services on ports: ${PORTS_TO_CHECK[*]}..."
    for port in "${PORTS_TO_CHECK[@]}"; do
        pid=$(lsof -t -i:$port)
        if [ -n "$pid" ]; then
            echo "   Killing process with PID $pid on port $port."
            kill -9 $pid
        fi
    done
}

function setup_environment() {
    # Activate Python virtual environment
    if [ ! -f "$VENV_DIR/bin/activate" ]; then
        echo "❌ Error: Python virtual environment not found at '$VENV_DIR'."
        exit 1
    fi
    source "$VENV_DIR/bin/activate"
    
    # Set OpenAI API Key from environment (if not already set)
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "⚠️  Warning: OPENAI_API_KEY environment variable not set"
    fi
    
    # Load .env file securely (if it exists)
    if [ -f "$BACKEND_DIR/.env" ]; then
        set -o allexport
        source "$BACKEND_DIR/.env"
        set +o allexport
    fi

    # Check for OpenAI Key after loading
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "⚠️  Warning: OPENAI_API_KEY is not set"
    else
        echo "✅ OPENAI_API_KEY loaded successfully."
fi
}

# --- Service Control ---
start_backend() {
    echo "📡 Starting Backend API..."
    (cd "$BACKEND_DIR" && uvicorn server:app --host 0.0.0.0 --port 5001 &)
    echo "   Backend process started."
}

start_agent() {
    echo "🤖 Starting LiveKit Agent..."
    (cd "$BACKEND_DIR" && python agent.py start &)
    echo "   Agent process started."
}

start_frontend() {
    echo "🌐 Starting Frontend..."
    (cd "$FRONTEND_DIR" && npm run dev &)
    echo "   Frontend process started."
}

cleanup() {
    echo -e "\n🛑 Stopping all services..."
    pkill -P $$ > /dev/null 2>&1
    kill_processes_on_ports
    echo "✅ All services stopped."
    exit 0
}

# --- Main Execution ---
trap cleanup SIGINT SIGTERM

print_header
kill_processes_on_ports
setup_environment

start_backend
start_agent
start_frontend

echo -e "\n🚀 All services are launching..."
echo "   - Backend API: http://localhost:5001"
echo "   - Frontend:    http://localhost:5173"
echo -e "\nPress Ctrl+C to stop all services."

wait 